import { Child } from "ibridge-flex";
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { RimoriClient } from "./RimoriClient";

export class PluginController {
    private static instance: PluginController;
    private static client: RimoriClient;
    private plugin: Child<null, null>;
    private onceListeners: Map<string, any[]> = new Map();
    private listeners: Map<string, any[]> = new Map();
    private communicationSecret: string | null = null;
    private initialized = false;
    private supabase: SupabaseClient | null = null;
    private tablePrefix: string | null = null;
    private accessTokenExpiration: Date | null = null;
    private token: string | null = null;
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
        // this.init();

        this.emit = this.emit.bind(this);
        this.onOnce = this.onOnce.bind(this);
        this.getClient = this.getClient.bind(this);
        this.subscribe = this.subscribe.bind(this);
        this.internalEmit = this.internalEmit.bind(this);
        this.request = this.request.bind(this);
    }

    public static async getInstance(): Promise<RimoriClient> {
        if (!PluginController.instance) {
            PluginController.instance = new PluginController();
            await PluginController.instance.init();
            PluginController.client = await RimoriClient.getInstance(
                PluginController.instance
            );
        }
        return PluginController.client;
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

    public async getClient(): Promise<{ supabase: SupabaseClient, tablePrefix: string }> {
        if (
            this.supabase &&
            this.tablePrefix &&
            this.accessTokenExpiration &&
            this.accessTokenExpiration > new Date()
        ) {
            return { supabase: this.supabase, tablePrefix: this.tablePrefix };
        }

        const response = await this.request<{
            url: string,
            key: string,
            token: string,
            expiration: Date,
            tablePrefix: string
        }>("getSupabaseAccess");

        this.accessTokenExpiration = response.expiration;
        this.token = response.token;

        this.supabase = createClient(response.url, response.key, {
            accessToken: () => Promise.resolve(this.getToken())
        });

        return { supabase: this.supabase, tablePrefix: response.tablePrefix };
    }

    public async getToken() {
        if (this.token && this.accessTokenExpiration && this.accessTokenExpiration > new Date()) {
            return this.token;
        }

        const response = await this.request<{ token: string, expiration: Date }>("getSupabaseAccess");

        this.token = response.token;
        this.accessTokenExpiration = response.expiration;

        return this.token;
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

    async request<T>(topic: string, data: any = {}): Promise<T> {
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
}