const league_api = require('./LeagueAPICalls');
const user_model = require('../models/user_model');

async function create_summoner_entry(
    username,
    region,
    champ_dict,
    last_game_timestamp = null
  ) {
    /**
     * Given unique account information and the champion dictionary for the current patch, returns a db entry of
     * per champion data, recent games, etc. last_game_timestamp is optional paramater - if provided, this will
     * search games only after this timestamp
     */
    const account_args = [username, region];
    let account_id;
    let summoner_puuid;
    let last_processed_game_timestamp;
    try {
      account_id = await utils.retry_async_function(
        kayn_calls.get_account_id,
        account_args
      );
      summoner_puuid = await utils.retry_async_function(
        kayn_calls.get_summoner_puuid,
        account_args
      );
    } catch (error) {
      throw new utils.SummonerDoesNotExistError(
        'User ' + username + ' does not exist in ' + region
      );
    }
  
    try {
      const timestamp_args = [account_id, region];
      last_processed_game_timestamp = await utils.retry_async_function(
        kayn_calls.get_last_processed_game_timestamp,
        timestamp_args
      );
    } catch (error) {
      throw new utils.SummonerHasNoGamesError(
        'User ' + username + ' in ' + region + ' has no ARAM games played.'
      );
    }
    const recent_matches = await kayn_calls.get_recent_matches(
      account_id,
      region,
      champ_dict,
      username
    );
    const icon_id = await utils.retry_async_function(
      kayn_calls.get_icon_id,
      account_args
    );
    let aggregate_stats;
    if (last_game_timestamp === null) {
      //new user
      aggregate_stats = await create_or_update_user(username, region, champ_dict);
    } else {
      //existing user
      aggregate_stats = await create_or_update_user(
        username,
        region,
        champ_dict,
        last_game_timestamp
      );
    }
    const per_champion_data = utils.convert_aggregate_stats_to_list(
      aggregate_stats
    );
    let db_entry = {};
    db_entry['accountId'] = account_id;
    db_entry['summoner_puuid'] = summoner_puuid;
    db_entry['last_processed_game_timestamp_ms'] = last_processed_game_timestamp;
    db_entry['per_champion_data'] = per_champion_data;
    db_entry['recent_games'] = recent_matches;
    db_entry['icon_id'] = icon_id;
  
    return db_entry;
  }