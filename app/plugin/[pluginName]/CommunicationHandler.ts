import { SupabaseClient } from "@supabase/supabase-js";
import Postmate from "postmate";
import {
    PostgrestClient,
    PostgrestFilterBuilder,
    PostgrestQueryBuilder,
} from '@supabase/postgrest-js'

export interface Plugin {
    url: string;
    name: string;
    description: string;
}

export default class CommunicationHandler {
    private pluginConnection: Postmate;
    private supabase: SupabaseClient;
    private plugin: Plugin;
    private parent?: Postmate.ParentAPI;

    constructor(supabase: SupabaseClient, plugin: Plugin, ref: any) {
        this.plugin = plugin;
        this.supabase = supabase;
        this.pluginConnection = new Postmate({ container: ref, url: plugin.url, classListArray: ["w-full"] });
        this.init();
    }

    async init() {
        if (!this.pluginConnection) {
            return;
        }

        // Wait for the plugin to be ready
        this.parent = await this.pluginConnection;


        this.parent.on("db_fetch", async (data: { table: string, select: any }) => {
            console.log("Plugin " + this.plugin + " wants to fetch data from: ", data.table);

            let query = await this.supabase.from(data.table).select(data.select);

            // todo add filter
            return query;
        });

        // insert
        this.parent.on("db_insert", async (data: { table: string, values: any | any[], returnValues?: string }) => {
            console.log("Plugin " + this.plugin + " wants to insert data into: ", data.table);

            if (data.returnValues) {
                console.log("Plugin " + this.plugin + " wants to return response after insert");
                return await this.supabase.from(data.table).insert(data.values).select(data.returnValues);
            }

            return await this.supabase.from(data.table).insert(data.values);
        });

        // update
        this.parent.on("db_update", async (data: { table: string, values: any, filter: any, returnValues?: string }) => {
            console.log("Plugin " + this.plugin + " wants to update data in: ", data.table);

            if (data.returnValues) {
                console.log("Plugin " + this.plugin + " wants to return response after update");
                return await this.supabase.from(data.table).update(data.values).match(data.filter).select(data.returnValues);
            }

            return await this.supabase.from(data.table).update(data.values).match(data.filter);
        });

        // delete
        this.parent.on("db_delete", async (data: { table: string, filter: any }) => {
            console.log("Plugin " + this.plugin + " wants to delete data from: ", data.table);

            return await this.supabase.from(data.table).delete().match(data.filter);
        });


        // -------------old code----------------

        // Call plugin method and get data
        // plugin.on("helloFromAlex", (data: any) => {
        //     console.log("Plugin says dynamically: ", data);
        // });

        // const data = await plugin.get("exampleProp");
        // console.log("Plugin property: ", data);

        // console.log("height:", await plugin.get("height"))
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
