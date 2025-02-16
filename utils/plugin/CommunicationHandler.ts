import { SupabaseClient } from "@supabase/supabase-js";
import { Parent } from "ibridge-flex"
import { MenuEntry } from "../../components/plugin/ContextMenu";
import { env } from "../client-constants";

export interface SidebarPage {
    name: string;
    url: string;
    iconUrl: string;
    description: string;
}

export interface Plugin {
    id: string;
    name: string;
    title: string;
    description: string;
    pluginRepo: string;
    pluginWebsite: string;
    iconUrl: string;
    version: string;
    author: string;
    endpoint: string;
    contextMenuActions: MenuEntry[];
    isMainPlugin: boolean;
    isSidebarPlugin: boolean;
    pluginPages: {
        name: string;
        url: string;
        description: string;
        root: string;
    }[];
    sidebarPages: SidebarPage[];
    settingsPage: string;
    unmanaged?: boolean;
}

export default class CommunicationHandler {
    private supabase: SupabaseClient;
    private plugin: Plugin;
    private parent: Parent;
    private communicationSecret: string | null = null;
    private voiceQueue: Array<{ callId: number; text: string; voice: string; speed: number; language?: string }> = [];
    private activeVoiceRequests = 0;
    private maxConcurrentVoiceRequests = 3;
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

        if (!this.plugin.unmanaged) {
            url.searchParams.append("secret", this.communicationSecret!);
        }

        if (!url.href.startsWith(endpoint)) {
            console.error("The url does not start with the endpoint. External pages are not supported.", url.href, fullEndpoint);
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
        const { data, error } = await this.supabase.functions.invoke(
            "plugin-token",
        );

        if (error) {
            console.error("Failed to get plugin token", error);
            throw new Error("Failed to get plugin token");
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
        if (this.initialized || this.plugin.unmanaged) {
            return true;
        }

        // Wait for the plugin to be ready
        return await this.parent.handshake().then(() => {
            this.initialized = true;
            return true;
        }).catch((error: any) => {
            console.error("Failed to initialize the plugin communication:", error);
            return false;
        });
    }

    async initSubscribers() {
        this.subscribe("getSupabaseAccess", async (callId) => {
            const token = await this.getPluginToken();
            this.call("getSupabaseAccess", callId, {
                token,
                url: env.SUPABASE_URL,
                key: env.SUPABASE_ANON_KEY,
                tablePrefix: "pl_" + this.plugin.name,
                expiration: new Date(Date.now() + 1000 * 60 * 60 * 1.5), // 1.5 hours
            });
        });

        const getSettingsId = (genericSettings?: string) => {
            return ["user", "system"].includes(genericSettings || "") ? genericSettings : this.plugin.id;
        }

        // get settings
        this.subscribe("get_settings", async (callId, { genericSettings }: { genericSettings?: string }) => {
            console.log(`Plugin ${this.plugin.name} wants to get settings.`);

            const id = getSettingsId(genericSettings);

            const { data } = await this.supabase.from("plugin_settings").select("*").eq("plugin_id", id);
            console.log("fetched Settings", data);
            this.call("get_settings", callId, data?.length ? data[0].settings : null);
        });

        // set settings
        this.subscribe("set_settings", async (callId, { genericSettings, settings }: { genericSettings?: string, settings: any }) => {
            console.log(`Plugin ${this.plugin.name} wants to set settings.`);

            const id = getSettingsId(genericSettings);
            await this.supabase.from("plugin_settings").upsert({ plugin_id: id, settings: settings });
        });

        // create voice response
        this.subscribe("getVoiceResponse", async (callId, { text, voice = "openai_alloy", speed = 1, language = undefined }) => {
            this.voiceQueue.push({ callId, text, voice, speed, language });
            this.processVoiceQueue();
        });

        // get speech to text response
        this.subscribe("getSTTResponse", async (callId, audio) => {
            console.log(`Plugin ${this.plugin.name} wants to get STT response.`);

            const formData = new FormData();
            formData.append('file', audio);

            fetch('/api/stt', { method: 'POST', body: formData })
                .then(r => r.json())
                .then(r => this.call("getSTTResponse", callId, r.text));
        });
    }

    private processVoiceQueue() {
        while (this.activeVoiceRequests < this.maxConcurrentVoiceRequests && this.voiceQueue.length) {
            const { callId, text, voice, speed, language } = this.voiceQueue.shift()!;
            this.activeVoiceRequests++;
            this.handleGetVoiceResponse(callId, text, voice, speed, language)
                .finally(() => {
                    this.activeVoiceRequests--;
                    this.processVoiceQueue();
                });
        }
    }

    private async handleGetVoiceResponse(callId: number, text: string, voice: string, speed: number, language?: string) {
        try {
            const response = await fetch('/api/speech', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ input: text, voice, speed, language }),
            });
            const blob = await response.blob();
            this.call("getVoiceResponse", callId, blob);
        } catch (error: any) {
            console.error("Failed to create voice response", error.message);
        }
    }

    async subscribe(topic: string, callback: (callId: number, data: any) => void) {
        if (!this.initialized) {
            await this.init();
        }

        this.parent.on(topic, (result: unknown) => {
            const { secret, _id, data } = result as { secret: string, _id: number, data: any };
            if (secret === this.communicationSecret) {
                callback(_id, data);
            } else {
                console.debug(`The child secret ${secret} did not match the parent secret ${this.communicationSecret}. Ignoring the data request.`);
            }
        });
    }

    async getPluginProperty(prop: string) {
        await this.init();
        return await this.parent.get(prop);
    }

    async emit(topic: string, data: any) {
        await this.init();
        this.call(topic, 0, data);
    }
}
