import { StandingsNowResponse, TeamsResponse } from '../types/nhlApiTypes';

const NHL_V1_BASE_URL = 'https://api-web.nhle.com/v1';
const NHL_REST_BASE_URL = 'https://api.nhle.com/stats/rest';

export const getStandingsNow = async (): Promise<StandingsNowResponse> => {
  const response = await fetch(`${NHL_V1_BASE_URL}/standings/now`);
  const data: StandingsNowResponse = await response.json();
  return data;
};

export const getTeams = async (): Promise<TeamsResponse> => {
  const response = await fetch(`${NHL_REST_BASE_URL}/en/team`);
  console.log('RESPONSE:', response);
  const data: TeamsResponse = await response.json();
  console.log('Data:', data);
  return data;
};
