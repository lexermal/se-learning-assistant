import { SupabaseClient } from "@supabase/supabase-js";
import Postmate from "postmate";
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
    private pluginConnection: Postmate;
    private supabase: SupabaseClient;
    private plugin: Plugin;
    private parent?: Postmate.ParentAPI;
    private communicationSecret: string | null = null;

    constructor(supabase: SupabaseClient, plugin: Plugin, ref: any, hash?: string, classListArray?: string[], queryParams?: Map<string, string>) {
        hash = "#" + (hash || "").replace("#", "");
        this.plugin = plugin;
        this.supabase = supabase;
        this.communicationSecret = Math.random().toString(36).substring(3);

        const url = this.getUrl(plugin.endpoint, hash, queryParams);

        this.pluginConnection = new Postmate({ container: ref, url: url, classListArray: [...(classListArray || []), "w-full"] });
        this.init().then(() => this.initSubscribers());
    }

    private getUrl(endpoint: string, hash: string, queryParams?: Map<string, string>) {
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

    private call(topic: string, data: any) {
        this.parent!.call("triggerChild", { topic, data });
    }

    private getTable(table: string) {
        return this.supabase.from(this.getTableName(table));
    }

    private getTableName(table: string) {
        return `pl_${this.plugin.name}_${table}`;
    }

    async destroy() {
        (await this.pluginConnection).destroy();
    }

    async init() {
        if (!this.pluginConnection || this.parent) {
            return;
        }

        // Wait for the plugin to be ready
        this.parent = await this.pluginConnection;
    }

    async initSubscribers() {
        this.subscribe("db_fetch", async (data: { table: string, select: string, filter: any }) => {
            console.log(`Plugin ${this.plugin.name} wants to fetch data from: ${data.table}`);

            const query = await buildSupabaseQuery(this.supabase, this.getTableName(data.table), data.select, data.filter);
            this.call("db_fetch", query.data);
        });

        // insert
        this.subscribe("db_insert", async (data: { table: string, values: any | any[], returnValues?: string }) => {
            console.log("Plugin " + this.plugin.name + " wants to insert data into: ", data.table);

            if (data.returnValues) {
                console.log("Plugin " + this.plugin.name + " wants to return response after insert");
                const date = await this.getTable(data.table).insert(data.values).select(data.returnValues);
                return this.call("db_insert", date.data);
            }

            await this.getTable(data.table).insert(data.values);
        });

        // update
        this.subscribe("db_update", async (data: { table: string, values: any, filter: any, returnValues?: string }) => {
            console.log("Plugin " + this.plugin.name + " wants to update data in: ", data.table);

            if (data.returnValues) {
                console.log("Plugin " + this.plugin.name + " wants to return response after update");
                return await this.getTable(data.table).update(data.values).match(data.filter).select(data.returnValues);
            }


            return await this.getTable(data.table).update(data.values).match(data.filter);
        });

        // delete
        this.subscribe("db_delete", async (data: { table: string, filter: any }) => {
            console.log("Plugin " + this.plugin.name + " wants to delete data from: ", data.table);

            return await this.getTable(data.table).delete().match(data.filter);
        });

        // call function
        this.subscribe("db_call", async (data: { name: string, data?: any }) => {
            console.log("Plugin " + this.plugin.name + " wants to call: ", data.name);

            const { data: result } = await this.supabase.rpc(this.getTableName(data.name), data.data);
            // console.log("db call result: ", result);
            this.call("db_call", result);
        });

        // request fullscreen
        let isFullscreen = false;
        document.addEventListener("fullscreenchange", () => {
            isFullscreen = !!document.fullscreenElement;
            this.call("triggerFullscreen", isFullscreen);
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
        this.subscribe("get_settings", async () => {
            console.log(`Plugin ${this.plugin.name} wants to get settings.`);
            const { data } = await this.supabase.from("plugin_settings").select("*").eq("plugin_id", this.plugin.id);
            console.log("fetched Settings", data);
            this.call("get_settings", data?.length ? data[0].settings : null);
        });

        // set settings
        this.subscribe("set_settings", async (data: any) => {
            console.log(`Plugin ${this.plugin.name} wants to set settings.`);
            await this.supabase.from("plugin_settings").upsert({ plugin_id: this.plugin.id, settings: data });
        });

        // get ai response
        this.subscribe("getAIResponse", async (messages) => {
            console.log(`Plugin ${this.plugin.name} wants to get AI response.`);
            fetch('/api/chat', {
                method: 'POST',
                body: JSON.stringify({ messages })
            }).then(r => r.json()).then(r => {
                this.call("getAIResponse", r.messages[0].content[0].text);
            });
        });

        // get ai response stream
        this.subscribe("getAIResponseStream", async (messages) => {
            console.log(`Plugin ${this.plugin.name} wants to get AI response stream.`);
            streamChatGPT(messages, (id, response, finished) => {
                this.call("getAIResponseStream", { id, response, finished });
            });
        });

        // create voice respponse
        this.subscribe("getVoiceResponse", async ({ text, voice = "alloy", speed = 1 }) => {
            console.log(`Plugin ${this.plugin.name} wants to create voice response.`);
            const response = await fetch('/api/speech', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ input: text, voice, speed }),
            });
            const blob = await response.blob();
            this.call("getVoiceResponse", blob);
        });

    }

    async subscribe(topic: string, callback: (data: any) => void) {
        if (!this.parent) {
            // console.log("Parent not ready, waiting for it to be ready");
            await this.init();
        }
        this.parent!.on(topic, (result: { secret: string, data: any }) => {
            // console.log("Received data from child", result);
            if (result.secret === this.communicationSecret) {
                callback(result.data);
            } else {
                console.debug(`The child secret ${result.secret} did not match the parent secret ${this.communicationSecret}. Ignoring the data request.`);
            }
        });
    }

    async getPluginProperty(prop: string) {
        await this.init();
        return await this.parent!.get(prop);
    }

    async emit(topic: string, data: any) {
        await this.init();
        this.call(topic, data);
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
