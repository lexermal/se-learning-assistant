import { Child } from "ibridge-flex";
import { WhereClauseBuilder } from "./WhereClauseBuilder";
import { LanguageLevel } from "../difficultyConverter";

export interface Tool {
    name: string;
    description: string;
    parameters: {
        name: string;
        type: "string" | "number" | "boolean";
        description: string;
    }[];
}

export interface ToolInvocation {
    toolName: string;
    args: Record<string, string>;
}

export class PluginController {
    private static instance: PluginController;
    private plugin: Child<null, null>;
    private onceListeners: Map<string, any[]> = new Map();
    private listeners: Map<string, any[]> = new Map();
    private communicationSecret: string | null = null;
    private initialized = false;

    private constructor() {
        // localStorage.debug = "*";

        this.plugin = new Child({
            triggerChild: ({ topic, data, _id }: any) => {
                // console.log("trigger child with topic:" + topic + " and data: ", data);
                this.onceListeners.get(topic)?.forEach((callback: any) => callback(_id, data));
                this.onceListeners.set(topic, []);
                this.listeners.get(topic)?.forEach((callback: any) => callback(_id, data));
            }
        });
        this.init();

        this.emit = this.emit.bind(this);
        this.onOnce = this.onOnce.bind(this);
        this.dbFetch = this.dbFetch.bind(this);
        this.dbInsert = this.dbInsert.bind(this);
        this.dbUpdate = this.dbUpdate.bind(this);
        this.dbDelete = this.dbDelete.bind(this);
        this.subscribe = this.subscribe.bind(this);
        this.setSettings = this.setSettings.bind(this);
        this.getSettings = this.getSettings.bind(this);
        this.internalEmit = this.internalEmit.bind(this);
        this.getAIResponse = this.getAIResponse.bind(this);
        this.dbFunctionCall = this.dbFunctionCall.bind(this);
        this.getVoiceResponse = this.getVoiceResponse.bind(this);
        this.getAIResponseStream = this.getAIResponseStream.bind(this);
        this.emitAndWaitResponse = this.emitAndWaitResponse.bind(this);
        this.getVoiceToTextResponse = this.getVoiceToTextResponse.bind(this);
    }

    public static getInstance(): PluginController {
        if (!PluginController.instance) {
            PluginController.instance = new PluginController();
        }
        return PluginController.instance;
    }

    async init() {
        if (this.initialized) {
            return;
        }

        // Wait for the plugin to be ready
        await this.plugin.handshake().then(() => this.initialized = true).catch((error: any) => {
            console.error("Failed to initialize the plugin communication:", error);
        });
    }

    private getSecret() {
        if (!this.communicationSecret) {
            const secret = new URLSearchParams(window.location.search).get("secret");
            if (!secret) {
                throw new Error("Communication secret not found in URL as query parameter");
            }
            this.communicationSecret = secret;
        }
        return this.communicationSecret;
    }

    public emit(eventName: string, data?: any) {
        this.internalEmit(eventName, 0, data);
    }

    // the communication needs to have an id to be able to distinguish between different responses
    private internalEmit(eventName: string, id: number, data?: any) {
        this.init().then(() => this.plugin.emitToParent(eventName, { data, _id: id, secret: this.getSecret() }));
    }

    public subscribe(eventName: string, callback: (_id: number, data: any) => void) {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, []);
        }

        this.listeners.get(eventName)?.push(callback);
    }

    public onOnce(eventName: string, callback: (data: any) => void) {
        if (!this.onceListeners.has(eventName)) {
            this.onceListeners.set(eventName, []);
        }

        this.onceListeners.get(eventName)?.push(callback);
    }

    async emitAndWaitResponse<T>(topic: string, data: any): Promise<T> {
        return await new Promise((resolve) => {
            let triggered = false;
            const id = Math.random();

            this.internalEmit(topic, id, data);

            this.subscribe(topic, (_id: number, data: any) => {
                if (triggered || (_id !== id && _id !== 0)) return;
                triggered = true;

                resolve(data)
            })
        });
    }

    public async dbFetch(table: string, select = "*", filter?: WhereClauseBuilder): Promise<any> {
        return await this.emitAndWaitResponse("db_fetch", { table, select, filter: filter?.build() });
    }

    public async dbInsert(table: string, values: any | any[], returnValues?: string): Promise<any> {
        return await this.emitAndWaitResponse("db_insert", { table, values, returnValues });
    }

    public async dbUpdate(table: string, filter: any, values: any, returnValues?: string): Promise<any> {
        return await this.emitAndWaitResponse("db_update", { table, values, filter, returnValues });
    }

    public async dbDelete(table: string, filter: any): Promise<any> {
        return await this.emitAndWaitResponse("db_delete", { table, filter });
    }

    public async dbFunctionCall(name: string, data?: any): Promise<any> {
        return await this.emitAndWaitResponse("db_call", { name, data });
    }

    /**
     * Get the settings for the plugin. T can be any type of settings, UserSettings or SystemSettings.
     * @param defaultSettings The default settings to use if no settings are found.
     * @param genericSettings The type of settings to get.
     * @returns The settings for the plugin. 
     */
    public async getSettings<T>(defaultSettings: T, genericSettings?: "user" | "system"): Promise<T> {
        const response = await this.emitAndWaitResponse("get_settings", { genericSettings }) as T;
        if (response === null) {
            this.setSettings(defaultSettings, genericSettings);
            return defaultSettings;
        }
        return response;
    }

    public async setSettings(settings: any, genericSettings?: "user" | "system") {
        await this.emitAndWaitResponse("set_settings", { settings, genericSettings });
    }

    public async getAIResponse(messages: { role: string, content: string }[]): Promise<string> {
        return this.emitAndWaitResponse("getAIResponse", messages);
    }

    public async getAIResponseStream(
        messages: { role: string, content: string }[],
        onMessage: (id: string, message: string, finished: boolean, toolInvocations?: ToolInvocation[]) => void,
        tools?: Tool[]
    ) {
        let triggered = false;

        // console.log("getAIResponseStream", messages);

        const id = Math.random();
        this.internalEmit("getAIResponseStream", id, { messages, tools: tools || [] });
        this.subscribe("getAIResponseStream", (_id: number, data: { id: string, response: string, finished: boolean, toolInvocations?: ToolInvocation[] }) => {
            if (triggered || (_id !== id && _id !== 0)) return;
            triggered = data.finished;
            onMessage(data.id, data.response, data.finished, data.toolInvocations);
        })
    }

    public getVoiceResponse(text: string, voice = "alloy", speed = 1, language?: string): Promise<Blob> {
        return this.emitAndWaitResponse("getVoiceResponse", { text, voice, speed, language });
    }

    public getVoiceToTextResponse(file: Blob): Promise<string> {
        return this.emitAndWaitResponse("getSTTResponse", file);
    }
}


export interface UserSettings {
    motherTongue: string;
    languageLevel: LanguageLevel;
}

export interface SystemSettings {
    // TODO: add system settings
}