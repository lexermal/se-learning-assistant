import { SupabaseClient } from "@supabase/supabase-js";
import { Parent } from "ibridge-flex"
import { MenuEntry } from "../../components/plugin/ContextMenu";
import { env } from "../client-constants";

export interface SidebarPage {
    name: string;
    url: string;
    icon_url: string;
    description: string;
    actionKey: string;
}

export interface Plugin {
    id: string;
    title: string;
    description: string;
    git_repository: string;
    website: string;
    icon_url: string;
    version: string;
    author: string;
    endpoint: string;
    context_menu_actions: MenuEntry[];
    plugin_pages: {
        name: string;
        url: string;
        description: string;
        root: string;
    }[];
    sidebar_pages: SidebarPage[];
    settings_page: string;
    unmanaged: boolean;
}

export default class CommunicationHandler {
    private supabase: SupabaseClient;
    private plugin: Plugin;
    private parent: Parent;
    private communicationSecret: string;
    private initialized = false;

    constructor(supabase: SupabaseClient, plugin: Plugin, ref: any, hash?: string, classListArray?: string[], queryParams?: Map<string, string>) {
        this.plugin = plugin;
        this.supabase = supabase;
        this.communicationSecret = Math.random().toString(36).substring(3);

        const url = this.getUrl(plugin.endpoint, hash, queryParams);
        // localStorage.debug = "*";
        ref.children[0].src = url;
        this.parent = new Parent({ container: ref, target: ref.children[0], showIframe: true, classList: [...(classListArray || []), "w-full"] });
        this.init().then(() => this.initSubscribers());
    }

    private getUrl(endpoint: string, hash?: string, queryParams?: Map<string, string>) {
        // console.log({ endpoint, hash, queryParams })
        const fullEndpoint = endpoint + (hash || "");

        const url = new URL(fullEndpoint);

        // if (!this.plugin.unmanaged) {
        url.searchParams.append("secret", this.communicationSecret);
        // }

        if (!this.plugin.unmanaged && !url.href.startsWith(endpoint)) {
            console.error("The url does not start with the endpoint. External pages are not supported.", url.href, fullEndpoint);
            return endpoint;
        }

        if (queryParams) {
            queryParams.forEach((value, key) => url.searchParams.append(key, value));
        }

        return url.toString();
    }

    private async getPluginToken() {
        const { data: { session } } = await this.supabase.auth.getSession();
        if (!session) {
            throw new Error("User not logged in");
        }

        // Extract the full-access token for authorization with the Edge Function
        const { data, error } = await this.supabase.functions.invoke("plugin-token");

        if (error) {
            throw new Error("Failed to get plugin token", { cause: error });
        }
        return data.token;
    }

    private call(topic: string, callId: number, data: any) {
        this.parent.get("triggerChild", { topic, data, _id: callId })
    }

    async destroy() {
        this.parent.destroy();
    }

    async init(): Promise<boolean> {
        if (this.initialized) {
            return true;
        }

        // Wait for the plugin to be ready
        return await this.parent.handshake().then(() => {
            this.initialized = true;
            return true;
        }).catch((error: any) => {
            console.warn("Could not initialize the communication with the plugin.", error);
            return false;
        });
    }

    async initSubscribers() {
        this.subscribe("getSupabaseAccess", async (callId) => {
            const token = await this.getPluginToken();
            this.call("getSupabaseAccess", callId, {
                token,
                pluginId: this.plugin.id,
                url: env.SUPABASE_URL,
                key: env.SUPABASE_ANON_KEY,
                tablePrefix: this.plugin.id,
                expiration: new Date(Date.now() + 1000 * 60 * 60 * 1.5), // 1.5 hours
            });
        });
        // TODO: add subscribers for plugin-to-plugin communication
    }

    async subscribe(topic: string, callback: (callId: number, data: any) => void) {
        if (!this.initialized) {
            await this.init();
        }
        this.parent.on(topic, ({ secret, _id, data }: any) => {
            if (secret === this.communicationSecret) {
                callback(_id, data);
            }
        });
    }

    async emit(topic: string, data: any) {
        await this.init();
        this.call(topic, 0, data);
    }
}
