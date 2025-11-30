import { getEnvVariableValue } from '../models/env';

export const getCurrentSeason = async (): Promise<number> => {
  return (await getEnvVariableValue('currentSeason')) as Promise<number>;
};
