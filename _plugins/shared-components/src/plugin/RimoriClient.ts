import { SupabaseClient } from "@supabase/supabase-js";
import { GenericSchema } from "@supabase/supabase-js/dist/module/lib/types";
import { PostgrestQueryBuilder, PostgrestFilterBuilder } from "@supabase/postgrest-js";
import { PluginController, Tool, ToolInvocation } from "./PluginController";
import { LanguageLevel } from "../utils/difficultyConverter";

export class RimoriClient {
    private static instance: RimoriClient;
    private superbase: SupabaseClient;
    private plugin: PluginController;
    public functions: SupabaseClient["functions"];
    public storage: SupabaseClient["storage"];
    public tablePrefix: string;
    private constructor(pluginController: PluginController, superbase: SupabaseClient, tablePrefix: string) {
        this.superbase = superbase;
        this.plugin = pluginController;
        this.tablePrefix = tablePrefix;
        this.storage = this.superbase.storage;
        this.functions = this.superbase.functions;
        this.rpc = this.rpc.bind(this);
        this.from = this.from.bind(this);
        this.emit = this.emit.bind(this);
        this.request = this.request.bind(this);
        this.subscribe = this.subscribe.bind(this);
        this.getSettings = this.getSettings.bind(this);
        this.setSettings = this.setSettings.bind(this);
        this.getAIResponse = this.getAIResponse.bind(this);
        this.getVoiceResponse = this.getVoiceResponse.bind(this);
        this.getAIResponseStream = this.getAIResponseStream.bind(this);
        this.getVoiceToTextResponse = this.getVoiceToTextResponse.bind(this);
    }

    public static async getInstance(pluginController: PluginController): Promise<RimoriClient> {
        if (!RimoriClient.instance) {
            const { supabase, tablePrefix } = await pluginController.getClient();
            RimoriClient.instance = new RimoriClient(pluginController, supabase, tablePrefix);
        }
        return RimoriClient.instance;
    }

    public from<
        TableName extends string & keyof GenericSchema['Tables'],
        Table extends GenericSchema['Tables'][TableName]
    >(relation: TableName): PostgrestQueryBuilder<GenericSchema, Table, TableName>
    public from<
        ViewName extends string & keyof GenericSchema['Views'],
        View extends GenericSchema['Views'][ViewName]
    >(relation: ViewName): PostgrestQueryBuilder<GenericSchema, View, ViewName>
    public from(relation: string): PostgrestQueryBuilder<GenericSchema, any, any> {
        return this.superbase.from(this.tablePrefix + "_" + relation);
    }

    /**
    * Perform a function call.
    *
    * @param functionName - The function name to call
    * @param args - The arguments to pass to the function call
    * @param options - Named parameters
    * @param options.head - When set to `true`, `data` will not be returned.
    * Useful if you only need the count.
    * @param options.get - When set to `true`, the function will be called with
    * read-only access mode.
    * @param options.count - Count algorithm to use to count rows returned by the
    * function. Only applicable for [set-returning
    * functions](https://www.postgresql.org/docs/current/functions-srf.html).
    *
    * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
    * hood.
    *
    * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
    * statistics under the hood.
    *
    * `"estimated"`: Uses exact count for low numbers and planned count for high
    * numbers.
    */
    rpc<Fn extends GenericSchema['Functions'][string], FnName extends string & keyof GenericSchema['Functions']>(
        functionName: FnName,
        args: Fn['Args'] = {},
        options: {
            head?: boolean
            get?: boolean
            count?: 'exact' | 'planned' | 'estimated'
        } = {}
    ): PostgrestFilterBuilder<
        GenericSchema,
        Fn['Returns'] extends any[]
        ? Fn['Returns'][number] extends Record<string, unknown>
        ? Fn['Returns'][number]
        : never
        : never,
        Fn['Returns'],
        string,
        null
    > {
        return this.superbase.rpc(this.tablePrefix + "_" + functionName, args, options)
    }

    public subscribe(eventName: string, callback: (_id: number, data: any) => void) {
        this.plugin.subscribe(eventName, callback);
    }

    public request<T>(eventName: string, data: any): Promise<T> {
        return this.plugin.request(eventName, data);
    }

    public emit(eventName: string, data: any) {
        this.plugin.emit(eventName, data);
    }

    /**
    * Get the settings for the plugin. T can be any type of settings, UserSettings or SystemSettings.
    * @param defaultSettings The default settings to use if no settings are found.
    * @param genericSettings The type of settings to get.
    * @returns The settings for the plugin. 
    */
    public async getSettings<T>(defaultSettings: T, genericSettings?: "user" | "system"): Promise<T> {
        const response = await this.plugin.request("get_settings", { genericSettings }) as T;
        if (response === null) {
            this.setSettings(defaultSettings, genericSettings);
            return defaultSettings;
            //if the settings are not the same, merge the settings
        } else if (Object.keys(response as Partial<T>).length !== Object.keys(defaultSettings as Partial<T>).length) {
            const existingKeys = Object.fromEntries(
                Object.entries(response as object).filter(([k]) => k in (defaultSettings as object))
            );
            const mergedSettings = { ...defaultSettings, ...existingKeys };
            console.warn("Settings mismatch", { response, defaultSettings, mergedSettings });
            this.setSettings(mergedSettings, genericSettings);
            return mergedSettings;
        }
        return response;
    }

    public async setSettings(settings: any, genericSettings?: "user" | "system") {
        await this.plugin.request("set_settings", { settings, genericSettings });
    }

    public async getAIResponse(messages: { role: string, content: string }[]): Promise<string> {
        return this.plugin.request("getAIResponse", messages);
    }

    public async getAIResponseStream(
        messages: { role: string, content: string }[],
        onMessage: (id: string, message: string, finished: boolean, toolInvocations?: ToolInvocation[]) => void,
        tools?: Tool[]
    ) {
        throw new Error("Not implemented");
        // let triggered = false;

        // console.log("getAIResponseStream", messages);

        // const id = Math.random();
        // this.internalEmit("getAIResponseStream", id, { messages, tools: tools || [] });
        // this.subscribe("getAIResponseStream", (_id: number, data: { id: string, response: string, finished: boolean, toolInvocations?: ToolInvocation[] }) => {
        //     if (triggered || (_id !== id && _id !== 0)) return;
        //     triggered = data.finished;
        //     onMessage(data.id, data.response, data.finished, data.toolInvocations);
        // })
    }

    public getVoiceResponse(text: string, voice = "alloy", speed = 1, language?: string): Promise<Blob> {
        return this.plugin.request("getVoiceResponse", { text, voice, speed, language });
    }

    public getVoiceToTextResponse(file: Blob): Promise<string> {
        return this.plugin.request("getSTTResponse", file);
    }
}

export interface UserSettings {
    motherTongue: string;
    languageLevel: LanguageLevel;
}

export interface SystemSettings {
    // TODO: add system settings
}