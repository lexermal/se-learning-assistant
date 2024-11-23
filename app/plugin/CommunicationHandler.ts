import { SupabaseClient } from "@supabase/supabase-js";
import Postmate from "postmate";
import {
    PostgrestClient,
    PostgrestFilterBuilder,
    PostgrestQueryBuilder,
} from '@supabase/postgrest-js'
import { MenuEntry } from "../../components/plugin/ContextMenu";

export interface Plugin {
    id: string;
    name: string;
    description: string;
    pluginRepo: string;
    pluginWebsite: string;
    version: string;
    author: string;
    endpoint: string;
    contextMenuActions: MenuEntry[];
    isMainPlugin: boolean;
    isSidebarPlugin: boolean;
}

export default class CommunicationHandler {
    private pluginConnection: Postmate;
    private supabase: SupabaseClient;
    private plugin: Plugin;
    private parent?: Postmate.ParentAPI;

    constructor(supabase: SupabaseClient, plugin: Plugin, ref: any, hash?: string) {
        hash = "#" + (hash || "").replace("#", "");
        this.plugin = plugin;
        this.supabase = supabase;
        this.pluginConnection = new Postmate({ container: ref, url: plugin.endpoint + hash, classListArray: ["w-full"] });
        this.init();
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
        if (!this.pluginConnection) {
            return;
        }

        // Wait for the plugin to be ready
        this.parent = await this.pluginConnection;

        this.parent.on("db_fetch", async (data: { table: string, select: string }) => {
            console.log(`Plugin ${this.plugin.name} wants to fetch data from: ${data.table}`);

            const query = await this.getTable(data.table).select(data.select);
            // console.log("Query: ", query);
            // todo add filter
            this.call("db_fetch", query.data);
        });

        // insert
        this.parent.on("db_insert", async (data: { table: string, values: any | any[], returnValues?: string }) => {
            console.log("Plugin " + this.plugin.name + " wants to insert data into: ", data.table);

            if (data.returnValues) {
                console.log("Plugin " + this.plugin.name + " wants to return response after insert");
                const date = await this.getTable(data.table).insert(data.values).select(data.returnValues);
                return this.call("db_insert", date.data);
            }

            await this.getTable(data.table).insert(data.values);
        });

        // update
        this.parent.on("db_update", async (data: { table: string, values: any, filter: any, returnValues?: string }) => {
            console.log("Plugin " + this.plugin.name + " wants to update data in: ", data.table);

            if (data.returnValues) {
                console.log("Plugin " + this.plugin.name + " wants to return response after update");
                return await this.getTable(data.table).update(data.values).match(data.filter).select(data.returnValues);
            }


            return await this.getTable(data.table).update(data.values).match(data.filter);
        });

        // delete
        this.parent.on("db_delete", async (data: { table: string, filter: any }) => {
            console.log("Plugin " + this.plugin.name + " wants to delete data from: ", data.table);

            return await this.getTable(data.table).delete().match(data.filter);
        });

        // call function
        this.parent.on("db_call", async (data: { name: string, data?: any }) => {
            console.log("Plugin " + this.plugin.name + " wants to call: ", data.name);

            const { data: result } = await this.supabase.rpc(this.getTableName(data.name), data.data);
            // console.log("db call result: ", result);
            this.call("db_call", result);
        });

        // request fullscreen
        this.parent.on("triggerFullscreen", async (fullscreen = true) => {
            console.log(`Plugin ${this.plugin.name} wants to ${fullscreen ? "enter" : "leave"} fullscreen.`);
            try {
                const ref = document.querySelector("iframe")!
                if (fullscreen) {
                    // @ts-ignore
                    ref.requestFullscreen() || ref.webkitRequestFullscreen()
                } else {
                    // @ts-ignore
                    document.exitFullscreen() || document.webkitExitFullscreen()
                }
                this.call("triggerFullscreen", { fullscreen, success: true });
            } catch (error) {
                this.call("triggerFullscreen", { fullscreen, success: false });
            }
        });
    }

    async subscribe(topic: string, callback: (data: any) => void) {
        await this.init();
        this.parent!.on(topic, callback);
    }

    async getPluginProperty(prop: string) {
        await this.init();
        return await this.parent!.get(prop);
    }

    async emit(topic: string, data: any) {
        await this.init();
        this.parent!.call(topic, data);
    }
}
