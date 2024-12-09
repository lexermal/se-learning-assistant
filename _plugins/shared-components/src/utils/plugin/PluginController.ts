import Postmate from "postmate";
import { WhereClauseBuilder } from "./WhereClauseBuilder";

export class PluginController {
    private static instance: PluginController;
    private plugin: Postmate.Model | null = null;
    private onceListeners: Map<string, any[]> = new Map();
    private listeners: Map<string, any[]> = new Map();
    private communicationSecret: string | null = null;

    private constructor() {
        this.plugin = new Postmate.Model({
            pluginName: "flashcards",
            triggerChild: ({ topic, data }: any) => {
                // console.log("trigger child with topic:" + topic + " and data: ", data);
                this.onceListeners.get(topic)?.forEach((callback: any) => callback(data));
                this.onceListeners.set(topic, []);
                this.listeners.get(topic)?.forEach((callback: any) => callback(data));
            }
        });

        this.onOnce = this.onOnce.bind(this);
        this.emit = this.emit.bind(this);
        this.dbFetch = this.dbFetch.bind(this);
        this.dbInsert = this.dbInsert.bind(this);
        this.dbUpdate = this.dbUpdate.bind(this);
        this.dbDelete = this.dbDelete.bind(this);
        this.subscribe = this.subscribe.bind(this);
        this.setSettings = this.setSettings.bind(this);
        this.getSettings = this.getSettings.bind(this);
        this.dbFunctionCall = this.dbFunctionCall.bind(this);
        this.emitAndWaitResponse = this.emitAndWaitResponse.bind(this);
    }

    public static getInstance(): PluginController {
        if (!PluginController.instance) {
            PluginController.instance = new PluginController();
        }
        return PluginController.instance;
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
        this.plugin?.then(child => child.emit(eventName, { data, secret: this.getSecret() }));
    }

    public subscribe(eventName: string, callback: (data: any) => void) {
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

    async emitAndWaitResponse(topic: string, data: any) {
        return await new Promise((resolve) => {
            let triggered = false;

            this.emit(topic, data);

            this.onOnce(topic, (data: any) => {
                if (triggered) return;
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

    public async getSettings<T>(): Promise<T> {
        return await this.emitAndWaitResponse("get_settings", {}) as T;
    }

    public async setSettings(settings: any) {
        await this.emitAndWaitResponse("set_settings", settings);
    }

    public async getAIResponse(messages: { role: string, content: string }[]) {
        return this.emitAndWaitResponse("getAIResponse", messages);
    }

    public getAIResponseStream(messages: { role: string, content: string }[], onMessage: (id: string, message: string, finished: boolean) => void) {
        let triggered = false;

        this.emit("getAIResponseStream", messages);
        this.subscribe("getAIResponseStream", (data: { id: string, response: string, finished: boolean }) => {
            if (triggered) return;
            triggered = data.finished;
            onMessage(data.id, data.response, data.finished);
        })
    }

}