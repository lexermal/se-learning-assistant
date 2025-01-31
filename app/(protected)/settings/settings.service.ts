import { SupabaseClient } from '@/utils/supabase/client';

export async function getUserSettings() {
    const supabase = SupabaseClient.getClient();
    const { data } = await supabase.from("plugin_settings").select("*").eq("plugin_id", "user");
    console.log("fetched Settings", data);
    return data?.length ? data[0].settings : null;
}

export async function setUserSettings(settings: any) {
    console.log("setting Settings", settings);
    const supabase = SupabaseClient.getClient();
    await supabase.from("plugin_settings").upsert({ plugin_id: "user", settings: settings });
} 