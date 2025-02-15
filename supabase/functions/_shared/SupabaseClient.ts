import { getEnv } from './Env.ts';
import { WebError, WebErrorKey } from './WebServer.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2'

export async function getUserSupabaseClient(req: Request) {
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');

    const supabaseClient = createClient(getEnv('SUPABASE_URL'), getEnv('SUPABASE_ANON_KEY'));

    const { error } = await supabaseClient.auth.getUser(token);

    if (error) {
        throw new WebError(error.message, WebErrorKey.InvalidAuthorizationHeader);
    }

    return supabaseClient;
}