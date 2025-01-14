import { SupabaseClient } from "@supabase/supabase-js";
import { Parent } from "ibridge-flex"
import { MenuEntry } from "../../../components/plugin/ContextMenu";
import buildSupabaseQuery from "./SelectStatementBuilder";

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
    }[];
    sidebarPages: SidebarPage[];
    settingsPage: string;
}

export default class CommunicationHandler {
    private supabase: SupabaseClient;
    private plugin: Plugin;
    private parent: Parent;
    private communicationSecret: string | null = null;
    private voiceQueue: Array<{ callId: number; text: string; voice: string; speed: number }> = [];
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
        hash = "#" + (hash || "").replace("#", "");

        const url = new URL(endpoint);

        url.hash = hash;
        url.searchParams.append("secret", this.communicationSecret!);

        if (queryParams) {
            queryParams.forEach((value, key) => {
                url.searchParams.append(key, value);
            });
        }

        return url.toString();
    }

    private call(topic: string, callId: number, data: any) {
        this.parent.get("triggerChild", { topic, data, _id: callId })
    }

    private getTable(table: string) {
        return this.supabase.from(this.getTableName(table));
    }

    private getTableName(table: string) {
        return `pl_${this.plugin.name}_${table}`;
    }

    async destroy() {
        this.parent.destroy();
    }

    async init() {
        if (this.initialized) {
            return;
        }

        // Wait for the plugin to be ready
        await this.parent.handshake().then(() => {
            this.initialized = true;
        }).catch((error: any) => {
            console.error("Failed to initialize the plugin communication:", error);
        });
    }

    async initSubscribers() {
        this.subscribe("db_fetch", async (callId, data: { table: string, select: string, filter: any }) => {
            console.log(`Plugin ${this.plugin.name} wants to fetch data from: ${data.table}`);

            const query = await buildSupabaseQuery(this.supabase, this.getTableName(data.table), data.select, data.filter);
            this.call("db_fetch", callId, query.data);
        });

        // insert
        this.subscribe("db_insert", async (callId, data: { table: string, values: any | any[], returnValues?: string }) => {
            console.log("Plugin " + this.plugin.name + " wants to insert data into: ", data.table);

            if (data.returnValues) {
                console.log("Plugin " + this.plugin.name + " wants to return response after insert");
                const date = await this.getTable(data.table).insert(data.values).select(data.returnValues);
                return this.call("db_insert", callId, date.data);
            }

            await this.getTable(data.table).insert(data.values);
        });

        // update
        this.subscribe("db_update", async (callId, data: { table: string, values: any, filter: any, returnValues?: string }) => {
            console.log("Plugin " + this.plugin.name + " wants to update data in: ", data.table);

            if (data.returnValues) {
                console.log("Plugin " + this.plugin.name + " wants to return response after update");
                return await this.getTable(data.table).update(data.values).match(data.filter).select(data.returnValues);
            }


            return await this.getTable(data.table).update(data.values).match(data.filter);
        });

        // delete
        this.subscribe("db_delete", async (callId, data: { table: string, filter: any }) => {
            console.log("Plugin " + this.plugin.name + " wants to delete data from: ", data.table);

            return await this.getTable(data.table).delete().match(data.filter);
        });

        // call function
        this.subscribe("db_call", async (callId, data: { name: string, data?: any }) => {
            console.log("Plugin " + this.plugin.name + " wants to call: ", data.name);

            const { data: result } = await this.supabase.rpc(this.getTableName(data.name), data.data);
            // console.log("db call result: ", result);
            this.call("db_call", callId, result);
        });

        // request fullscreen
        let isFullscreen = false;
        document.addEventListener("fullscreenchange", () => {
            isFullscreen = !!document.fullscreenElement;
            this.call("triggerFullscreen", 0, isFullscreen);
        });

        this.subscribe("triggerFullscreen", async () => {
            console.log(`Plugin ${this.plugin.name} wants to ${!isFullscreen ? "enter" : "leave"} fullscreen.`);
            try {
                const ref = document.querySelector("iframe")!
                if (!isFullscreen) {
                    // @ts-ignore
                    ref.requestFullscreen() || ref.webkitRequestFullscreen()
                } else {
                    // @ts-ignore
                    document.exitFullscreen() || document.webkitExitFullscreen()
                }
            } catch (error: any) {
                console.error("Failed to enter fullscreen", error.message);
            }
        });

        // get settings
        this.subscribe("get_settings", async (callId) => {
            console.log(`Plugin ${this.plugin.name} wants to get settings.`);
            const { data } = await this.supabase.from("plugin_settings").select("*").eq("plugin_id", this.plugin.id);
            console.log("fetched Settings", data);
            this.call("get_settings", callId, data?.length ? data[0].settings : null);
        });

        // set settings
        this.subscribe("set_settings", async (data: any) => {
            console.log(`Plugin ${this.plugin.name} wants to set settings.`);
            await this.supabase.from("plugin_settings").upsert({ plugin_id: this.plugin.id, settings: data });
        });

        // get ai response
        this.subscribe("getAIResponse", async (callId, messages) => {
            console.log(`Plugin ${this.plugin.name} wants to get AI response.`);
            fetch('/api/chat', {
                method: 'POST',
                body: JSON.stringify({ messages })
            }).then(r => r.json()).then(r => {
                this.call("getAIResponse", callId, r.messages[0].content[0].text);
            });
        });

        // get ai response stream
        this.subscribe("getAIResponseStream", async (callId, messages) => {
            console.log(`Plugin ${this.plugin.name} wants to get AI response stream.`);
            streamChatGPT(messages, (id, response, finished) => {
                this.call("getAIResponseStream", callId, { id, response, finished });
            });
        });

        // create voice response
        this.subscribe("getVoiceResponse", async (callId, { text, voice = "alloy", speed = 1 }) => {
            this.voiceQueue.push({ callId, text, voice, speed });
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
            const { callId, text, voice, speed } = this.voiceQueue.shift()!;
            this.activeVoiceRequests++;
            this.handleGetVoiceResponse(callId, text, voice, speed)
                .finally(() => {
                    this.activeVoiceRequests--;
                    this.processVoiceQueue();
                });
        }
    }

    private async handleGetVoiceResponse(callId: number, text: string, voice: string, speed: number) {
        try {
            const response = await fetch('/api/speech', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ input: text, voice, speed }),
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


async function streamChatGPT(messages: any[], onResponse: (id: string, response: string, finished: boolean) => void) {
    const messageId = Math.random().toString(36).substring(3);
    const response = await fetch('/api/chat/stream', {
        method: 'POST',
        body: JSON.stringify({
            // model: 'gpt-4',  // specify the model
            messages
        })
    });

    if (!response.body) {
        console.error('No response body.');
        return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');

    let content = "";
    let done = false;
    while (!done) {
        const { value } = await reader.read();

        if (value) {
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n').filter(line => line.trim() !== '');

            for (const line of lines) {
                const data = line.substring(3, line.length - 1);
                const command = line.substring(0, 1);
                // console.log("data: ", { line, data, command });

                if (command === '0') {
                    content += data;
                    // console.log("AI response:", content);

                    //content \n\n should be real line break when message is displayed
                    onResponse(messageId, content.replace(/\\n/g, '\n'), false);
                } else if (command === 'd') {
                    // console.log("AI usage:", JSON.parse(line.substring(2)));
                    done = true;
                    break;
                }
            }
        }
    }
    onResponse(messageId, content.replace(/\\n/g, '\n'), true);
}
