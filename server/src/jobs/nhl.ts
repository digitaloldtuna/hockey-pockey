/* eslint-disable */
import { getStandingsNow, getTeams } from '../services/nhl_api';
import { supabaseAdmin } from '../supabase';

const supabase = supabaseAdmin();

export const PopulateTeamsDB = async () => {
  try {
    // best way to get teams in the season
    const { standings: rawStandings } = await getStandingsNow();
    if (rawStandings.length !== 32) {
      throw Error(`incorrect number of standings: ${rawStandings.length} != 32`);
    }

    console.log('Raw Standings:', rawStandings);

    const standings = rawStandings.reduce(
      (fs, rawStanding) => {
        fs[rawStanding.teamAbbrev.default] = {
          fullName: rawStanding.teamName.default,
          code: rawStanding.teamAbbrev.default,
          logo: rawStanding.teamLogo,
          divisionName: rawStanding.divisionName,
          conferenceName: rawStanding.conferenceName,
        };
        return fs;
      },
      {} as Record<string, any>
    );

    console.log('Standings:', standings);

    const { data: rawTeams } = await getTeams();

    console.log('Raw Teams:', rawTeams);

    const teams = rawTeams.reduce(
      (ft, rawTeam) => {
        ft[rawTeam.triCode] = {
          apiId: rawTeam.id,
          franchiseId: rawTeam.franchiseId,
          fullName: rawTeam.fullName,
          leagueId: rawTeam.leagueId,
        };
        return ft;
      },
      {} as Record<string, any>
    );

    console.log('Teams:', teams);

    const teamsInSeason: Record<string, any> = {};
    Object.keys(standings).forEach((code) => {
      if (!teams[code]) {
        throw Error(`Code ${code} has no team associated with it.`);
      }
      teamsInSeason[code] = { ...standings[code], ...teams[code] };
    });

    console.log('Object:', teamsInSeason);

    Promise.all(
      Object.values(teamsInSeason).map(async (team) => {
        let preexisting: { data?: any; error?: any } = {};
        try {
          preexisting = await supabase
            .from('teams')
            .select('apiId')
            .eq('apiId', team.apiId)
            .single();
        } catch (e) {
          // do nothing
        }

        if (preexisting.data) {
          throw Error(`Team ${team.code} already exists: ${JSON.stringify(preexisting)}`);
        } else {
          console.log('Adding:', team);
        }

        await supabase.from('teams').insert([team]);
      })
    );
  } catch (e) {
    console.log('Error:', e);
  }
};
