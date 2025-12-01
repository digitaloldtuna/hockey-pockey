import { supabaseAdmin } from '../supabase';

const supabase = supabaseAdmin();

export interface EnvVariable {
  id: string;
  name: string;
  value: any;
  last_updated: Date;
  created_at: Date;
}

export const getAllEnvVariables = async (): Promise<EnvVariable[]> => {
  const { data, error } = await supabase.from('env').select('*');
  if (error) {
    throw Error(`Cannot fetch environment variables: ${error.message}`);
  }
  const variables = data.map((variable) => ({ ...variable, value: variable.value.value }));
  return variables;
};

export const getEnvVariable = async (name: string): Promise<EnvVariable> => {
  const { data, error } = await supabase.from('env').select('*').eq('name', name).single();
  if (error) {
    throw Error(`Cannot fetch environment variable with name ${name}: ${error.message}`);
  }
  const variable = { ...data, value: data.value.value };
  return variable;
};

export const getEnvVariableValue = async (name: string): Promise<any> => {
  const variable = await getEnvVariable(name);
  return variable.value;
};

export const updateEnvVariable = async (name: string, value: any): Promise<EnvVariable> => {
  const valueObj = { value };
  const { data, error } = await supabase
    .from('env')
    .update({ value: valueObj })
    .eq('name', name)
    .select()
    .single();
  if (error) {
    throw Error(`Cannot update environment variable with name ${name}: ${error.message}`);
  }
  const variable = { ...data, value: data.value.value };
  return variable;
};
