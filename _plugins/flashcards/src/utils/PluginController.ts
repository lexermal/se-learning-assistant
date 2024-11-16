import Postmate from "postmate";

export class PluginController {
    private static instance: PluginController;
    private plugin: Postmate.Model | null = null;
    private subscriptions: Map<string, any> = new Map();

    private constructor() {
        this.subscriptions.set("pluginName", "flashcards");
        this.plugin = this.getPlugin();

        this.on = this.on.bind(this);
        this.emit = this.emit.bind(this);
        this.dbFetch = this.dbFetch.bind(this);
        this.pingPong = this.pingPong.bind(this);
    }

    private getPlugin(): Postmate.Model {
        return new Postmate.Model(Object.fromEntries(this.subscriptions));
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
        this.plugin = this.getPlugin();
        this.subscriptions.set(eventName, callback);
    }

    private async pingPong(topic: string, data: any) {
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
        return await this.pingPong("db_fetch", { table, select });
    }
}