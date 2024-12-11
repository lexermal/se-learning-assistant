import { createBrowserClient } from "@supabase/ssr";
// import { env } from "../constants";

// export const createClient = () =>
//   createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);




// import { createBrowserClient } from '@supabase/ssr';
import { SupabaseClient as Client } from '@supabase/supabase-js';

export class SupabaseClient {
  private static instance: SupabaseClient;
  private static client = null as Client | null;

  private constructor() {
    // private constructor to prevent instantiation
  }

  public static getClient(supabaseUrl?: string, supabaseAnonKey?: string): Client {
    if (!SupabaseClient.instance && supabaseUrl && supabaseAnonKey) {
      console.log('Creating new Supabase client in singleton');
      SupabaseClient.instance = new SupabaseClient();

      this.client = createBrowserClient(supabaseUrl, supabaseAnonKey, {
        cookieEncoding: 'base64url',
        auth: { flowType: 'pkce' },
      });
    }

    if (!this.client) {
      console.log("Stacktrace", new Error().stack);
      throw new Error('Supabase client not initialized');
    }
    return this.client;
  }

}
