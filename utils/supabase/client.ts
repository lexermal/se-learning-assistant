import { createBrowserClient } from "@supabase/ssr";
import { SupabaseClient as Client } from '@supabase/supabase-js';
import { Plugin } from "../plugin/CommunicationHandler";
export class SupabaseClient {
  private static instance: SupabaseClient;
  private static client = null as Client | null;
  private static plugins: Plugin[] = [];

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

  public static async getPlugins(): Promise<Plugin[]> {
    if (SupabaseClient.plugins.length > 0) {
      return SupabaseClient.plugins;
    }

    const supabase = SupabaseClient.getClient();
    const { data, error } = await supabase.from('plugins').select('*');

    if (error) throw error;

    return data
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((p: Plugin & { external_hosted_url?: string }, index: number) => {
        p.endpoint = this.determinePluginEndpoint(p, index);

        if (process.env.NODE_ENV !== "production") {
          console.debug(`Using dev endpoint for plugin ${p.title} (${p.id}). Expected endpoint: ${p.endpoint}`);
        }

        p.icon_url = p.endpoint + (p.icon_url ?? "");

        if (!Array.isArray(p.sidebar_pages)) {
          p.sidebar_pages = [];
        }

        p.sidebar_pages = p.sidebar_pages.map(sp => {
          sp.icon_url = p.endpoint + sp.icon_url;
          return sp;
        });

        if (!Array.isArray(p.plugin_pages)) {
          p.plugin_pages = [];
        }

        if (!Array.isArray(p.context_menu_actions)) {
          p.context_menu_actions = [];
        }

        return p;
      });
  }

  private static determinePluginEndpoint(p: Plugin & { external_hosted_url?: string }, index: number): string {
    if (process.env.NODE_ENV !== "production") {
      if (p.external_hosted_url) {
        return process.env[p.id + "_ENDPOINT"] ?? p.external_hosted_url;
      } else {
        return "http://localhost:" + (3001 + index) + "/plugins/" + p.id + "/";
      }
    } else {
      return p.external_hosted_url ?? ("https://plugins.rimori.ai/plugins/" + p.id);
    }
  }
}
