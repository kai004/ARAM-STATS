
const { json } = require('body-parser')
const { Kayn, REGIONS } = require('kayn')
const fs = require('fs').promises;
const util = require('util');
// Convert fs.readFile into Promise version of same    
const readFile = util.promisify(fs.readFile);

const kayn = Kayn(process.env.RIOT_API_KEY)({
    region: REGIONS.NORTH_AMERICA,
    apiURLPrefix: 'https://%s.api.riotgames.com',
    locale: 'en_US',
    debugOptions: {
        isEnabled: true,
        showKey: false,
    },
    requestOptions: {
        shouldRetry: true,
        numberOfRetriesBeforeAbort: 3,
        delayBeforeRetry: 1000,
        burst: false,
        shouldExitOn403: false,
    },
    cacheOptions: {
        cache: null,
        timeToLives: {
            useDefault: false,
            byGroup: {},
            byMethod: {},
        },
    },
})

//given summoner name, return account id
async function get_summoner_id(username, region) {
    //gets summoner_id from username
    const summoner_id = await kayn.Summoner.by
      .name(username)
      .region(region)
      .then((summoner) => {
        return summoner.id;
      });
    return summoner_id;
  }

//get champion list, only call when new champ release
function get_champions(){
    kayn.DDragon.Champion.list()
    .callback(async function(error, champions) {

        var champion_dict = {};
        for (champion in champions.data){
            champion_dict[champion] = [champions.data[champion].key, champions.data[champion].tags]
        }
        console.log(champion_dict)
        var json = JSON.stringify(champion_dict);
        try {
            await fs.writeFile('./Reference', json); // need to be in an async function
        } catch (error) {
            console.log(error)
        }

    })
}
async function get_champions_list() {

    payload = await kayn.DDragon.Champion.listFull();
    champ_list = payload.data;
    champ_dict = {};
    for (champ in champ_list) {
      champ_dict[champ_list[champ].key] = champ;
    }
    console.log(champ_dict)
    return champ_dict;
}

//given champ name, return champ id
async function get_champions_id(name){
    try {
        const data = await fs.readFile('./Reference'); // need to be in an async function
        var data_json = JSON.parse(data)
        for (var champion in data_json){
           if (champion == name){
                return data_json[champion][0]
           }
        }
      } catch (error) {
        console.log(error)
    }

}
//given a champion_id, return champ name
async function get_champion_name(champion_id){
    try{
        const data = await fs.readFile('./Reference'); // need to be in an async function
        var data_json = JSON.parse(data)
        for (champion in data_json){
            if (data_json[champion][0] == champion_id){
                return champion
            }
        }

    } catch (error){
        console.log(error)
    }

}

async function get_summoner_puuid(username, region) {
    //gets account_id from username
    const puuid = await kayn.Summoner.by
      .name(username)
      .region(region)
      .then((summoner) => {
        return summoner.name;
      });
    return puuid;
}

async function get_champions_role(champion_id, primary_or_secondary){
    try{
        const data = await fs.readFile('./Reference'); // need to be in an async function
        var data_json = JSON.parse(data)
        for (var champion in data_json){
           if (data_json[champion][0] == champion_id){
                try{
                    return (data_json[champion][1])[primary_or_secondary]
                } catch (error){
                    console.log(error)
                }
           }
        }

    } catch (error){
        console.log(error)
    }

}

async function get_icon_id(username, region) {
    const icon_id = await kayn.Summoner.by
      .name(username)
      .region(region)
      .then((summoner) => {
        return summoner.profileIconId;
      });
    return icon_id;
}

async function get_full_matchlist(account_id, region, start_timestamp = 0) {
    /**
     * Calls Riot's API for matchlists 100 at a time in order to get a full list of matchlists for this player starting from start_timestamp
     * full_matchlist is a list of matchlist objects returned by Riot API, which are themselves lists of matches, so is a nested list
     * This function awaits in a for loop, but this is actually what we want - there is no way to tell how many games an account has, as
     * the field total_games is currently busted from Riot API.
     */
    let full_matchlist = [];
    let start_index = 0;
    const num_matches = 100;
    let matchlist;
    do {
      const args = [
        account_id,
        region,
        start_index,
        num_matches,
        start_timestamp,
      ];
      matchlist = await utils.retry_async_function(
        kayn_calls.get_subsection_matchlist,
        args
      );
      if (matchlist.matches.length > 0) {
        full_matchlist.push(matchlist);
      }
      start_index += 100;
    } while (matchlist.matches.length === 100);
    return full_matchlist;
}

  
async function get_subsection_matchlist(
    account_id,
    region,
    start_index,
    num_matches = 100,
    start_timestamp
  ) {
    //Riot api only allows up to 100 matches to be returned at a time, so this function is recursively called on groups
    //of 100 matches to get the full desired matchlist. see get_full_matchlist for additional comment
    const matchlist = await kayn.Matchlist.by
      .accountID(account_id)
      .region(region)
      .query({
        queue: [utils.ARAM],
        beginIndex: start_index,
        endIndex: start_index + num_matches,
        beginTime: start_timestamp,
      })
      .then((matchlist) => {
        console.log(
          'found',
          matchlist.startIndex,
          ' to ',
          matchlist.endIndex,
          'matches'
        );
        return matchlist;
      })
      .catch((error) => {
        //the reason this is here is because when we ask riot api
        //for a matchlist with a timestamp that is too large (i.e. this player has no games since then)
        //riot api returns a 404 error specifically. This deals with it.
        if (error.statusCode === 404) {
          const matchlist = { matches: [] };
          return matchlist;
        }
        throw error;
      });
    return matchlist;
}

async function get_match_info(
    match_id,
    platform_id,
    account_id,
    region,
    username
  ) {
    //return dictionary of win, kills, deaths, assists, cs, etc for this match and this participant player
    //if account_id is not a participant in this match, throws error
    let query_region = region;
    if (utils.PLATFORM_ID_TO_REGION[platform_id] !== region) {
      //console.log('for match_id', match_id, 'account_id', account_id, 'played in ', platform_id, 'but his current region is ', region);
      query_region = utils.PLATFORM_ID_TO_REGION[platform_id];
    }
    return await kayn.Match.get(match_id)
      .region(query_region)
      .then((match) => {
        const participant_identities = match['participantIdentities'];
  
        let desired_id = null;
        for (i = 0; i < participant_identities.length; i++) {
          participant = participant_identities[i];
          if (
            participant['player']['accountId'] === account_id ||
            participant['player']['currentAccountId'] === account_id ||
            participant['player']['summonerName'].toLowerCase() ===
              username.toLowerCase() //checking lowercased username as well in case
          ) {
            desired_id = participant['participantId'];
          }
        }
        if (desired_id === null) {
          //Edge case: goodend4 in EUW1 played a few games in NA. Then he swapped to EUW1 (and got a new accountId). After he swapped,
          //his accountID was taken by a new NA player named Senná. When we query based on accountId, Senna games
          //come up. For now, when we do not find the desired participant, we just return an empty match info obj
  
          let error = new utils.SummonerNotInMatchError(
            'The match ' +
              match_id +
              ' does not contain the user ' +
              username +
              ' with account_id ' +
              account_id +
              ' as a participant. query_region is' +
              query_region
          );
          rand = Math.random();
          if (rand > 0.995) {
            //Logging 1/200
            utils.sendErrorLog(
              username,
              region,
              utils.ERRORS.SUMMONER_NOT_IN_MATCH,
              error
            );
          }
          return error;
        }
        const participants = match['participants'];
        let desired_participant;
        for (i = 0; i < participants.length; i++) {
          if (participants[i]['participantId'] === desired_id) {
            desired_participant = participants[i];
          }
        }
        const match_stats = desired_participant['stats'];
        let match_info = {};
  
        champ_id = desired_participant['championId'];
        match_info['champ'] = champ_id;
        match_info['duration'] = match['gameDuration'];
        match_info['win'] = match_stats['win'];
        match_info['kills'] = match_stats['kills'];
        match_info['deaths'] = match_stats['deaths'];
        match_info['assists'] = match_stats['assists'];
        match_info['cs'] = match_stats['totalMinionsKilled'];
        match_info['gold'] = match_stats['goldEarned'];
        match_info['obj_dmg'] = match_stats['damageDealtToObjectives'];
        match_info['dmg_dealt'] = match_stats['totalDamageDealtToChampions'];
        match_info['dmg_taken'] = match_stats['totalDamageTaken'];
        match_info['pentakills'] = match_stats['pentaKills'];
        match_info_return = match_info;
        return match_info;
      });
}


module.exports = {
    get_champions_list,
    get_champions_id,
    get_champion_name,
    get_summoner_puuid,
    get_champions_role,
    get_icon_id,
    get_full_matchlist,
    get_subsection_matchlist,
    get_match_info,
    get_summoner_id,


};
//summoner("Kai004");
// var z = get_champions_id("Zoe")
// let x = get_champions_id("Zoe")
// x.then(function(result){
//     console.log(result)
// })
// console.log(typeof z)
// var x = get_champion_name(142)
// x.then(function(result){
//     console.log(result)
// })

// x = get_champions_role(142,1)
// x.then(function(result){
//         console.log(result)
//     })
get_champions_dict();