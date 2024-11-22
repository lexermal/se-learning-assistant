import Postmate from "postmate";

export class PluginController {
    private static instance: PluginController;
    private plugin: Postmate.Model | null = null;
    private subscriptions: Map<string, any[]> = new Map();

    private constructor() {
        this.plugin = new Postmate.Model({
            pluginName: "flashcards",
            triggerChild: ({ topic, data }: any) => {
                // console.log("trigger child with topic:" + topic + " and data: ", data);
                this.subscriptions.get(topic)?.forEach((callback: any) => callback(data));
                this.subscriptions.set(topic, []);
            }
        });

        this.on = this.on.bind(this);
        this.emit = this.emit.bind(this);
        this.dbFetch = this.dbFetch.bind(this);
        this.dbInsert = this.dbInsert.bind(this);
        this.dbUpdate = this.dbUpdate.bind(this);
        this.dbDelete = this.dbDelete.bind(this);
        this.emitAndWaitResponse = this.emitAndWaitResponse.bind(this);
    }

    public static getInstance(): PluginController {
        if (!PluginController.instance) {
            PluginController.instance = new PluginController();
        }
        return PluginController.instance;
    }

    public emit(eventName: string, data?: any) {
        this.plugin?.then(child => child.emit(eventName, data));
    }

    public on(eventName: string, callback: (data: any) => void) {
        if (!this.subscriptions.has(eventName)) {
            this.subscriptions.set(eventName, []);
        }

        this.subscriptions.get(eventName)?.push(callback);
    }

    async emitAndWaitResponse(topic: string, data: any) {
        return await new Promise((resolve) => {
            let triggered = false;

            this.emit(topic, data);

            this.on(topic, (data: any) => {
                if (triggered) return;
                triggered = true;

                resolve(data)
            })
        });
    }

    public async dbFetch(table: string, select = "*"): Promise<any> {
        return await this.emitAndWaitResponse("db_fetch", { table, select });
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
}