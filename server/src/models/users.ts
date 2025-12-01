import { supabaseAdmin as admin, supabaseClient as client } from '../supabase';

const supabaseAdmin = admin();
const supabaseClient = client();

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

export const getUser = async (
  token: string
): Promise<{
  id: string;
  email?: string;
}> => {
  const {
    data: { user },
    error,
  } = await supabaseClient.auth.getUser(token);
  if (error || !user) {
    throw Error(`No user.`);
  }
  return user;
};

// models/users.ts
export const refreshAccessToken = async (refresh_token: string) => {
  const { data, error } = await supabaseAdmin.auth.refreshSession({ refresh_token });

  if (error || !data.session) {
    throw error || new Error('Failed to refresh session');
  }

  const session = data.session;

  // compute expires_in manually
  const now = Math.floor(Date.now() / 1000);
  const expires_in = session.expires_at ? session.expires_at - now : 0;

  return {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_in,
  };
};
