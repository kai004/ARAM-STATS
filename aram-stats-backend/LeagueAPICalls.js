riot_token = "RGAPI-ecb38bd0-0037-4188-8f15-20e4cd011ee7"

const { json } = require('body-parser')
const { Kayn, REGIONS } = require('kayn')
const kayn = Kayn(riot_token)({
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

function summonerName(name){
    kayn.Summoner.by.name(name)
    .then(console.log)
    .catch(error => console.error(error))
}

//get champion list, only call when new champ release
function get_Champions(){
    kayn.DDragon.Champion.list()
    .callback(function(error, champions) {

        var champion_dict = {};
        for (champion in champions.data){
            champion_dict[champion] = [champions.data[champion].key, champions.data[champion].tags]
        }
        console.log(champion_dict)
        var json = JSON.stringify(champion_dict);
        var fs = require('fs');
        fs.writeFile('./Reference', json, err => {
            if (err) {
                console.log('Error writing file', err)
            } else {
                console.log('Successfully wrote file')
            }
        })


    })
}
//given champ name, return champ id
function get_Champions_id(name){
    const fs = require('fs')
    fs.readFile('./Reference', 'utf8' , (err, data) => {
        if (err) {
          console.error(err)
          return
        }
        var data_json = JSON.parse(data)
        console.log(data_json)
        for (var champion in data_json){
           if (champion == name){
                return data_json[champion][0]
           }
            
        }
      })
}

//summonerName("Kai005");
//get_Champions();
get_Champions_id("Zyra")

// module.exports ={
//     kayn : kayn
// };