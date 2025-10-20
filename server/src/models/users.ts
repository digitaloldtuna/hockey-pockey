import { supabaseAdmin, supabaseClient } from '../supabase';

export interface User {
  id: string;
  email: string;
}

export const createUser = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<User> => {
  const { data: profiles, error: profilesError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('email', email);

  if (profilesError) {
    throw Error('Something went wrong.');
  }

  if (profiles.length > 0) {
    throw Error('This email has been taken.');
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Send confirmation email
  });

  if (error) {
    throw Error(`Error fetching teams: ${error}`);
  }

  const user: User = {
    id: data.user.id,
    // TODO: fix this
    email: data.user.email || '',
  };
  return user;
};

export const loginWithCredentials = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
}> => {
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    throw Error(`Invalid credentials.`);
  }
  return data.session;
};

export const isUserAuthenticated = async (token: string): Promise<boolean> => {
  const {
    data: { user },
    error,
  } = await supabaseClient.auth.getUser(token);
  if (error || !user) {
    return false;
  }
  return true;
};
