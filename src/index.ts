import {processMessageQueue, sendMessage} from "./channels/sender.js"

export class RocketBase {
    // class method interface
    public sendMessage: ((this: any, message: string) => void) | any
    public processMessageQueue: ((this: any) => void) | any;
    // class members
    private readonly port: number;
    private readonly socket: WebSocket;
    private messageQueue: string[] = [];
    // callback functions map
    private onUpdatedCallbacks: Map<string, (data: any) => void> = new Map();

    constructor(port: number) {
        this.port = port;
        this.socket = new WebSocket(`ws://localhost:${this.port}/live`);

        this.socket.addEventListener('open', () => {
            console.log('Connected to server');
            this.processMessageQueue();
        });

        this.socket.addEventListener('close', () => {
            console.log('Disconnected from server');
        });

        this.socket.addEventListener('message', (event: MessageEvent) => {
            let data;
            if (typeof event.data === 'string') {
                try {
                    data = JSON.parse(event.data);
                } catch (error) {
                    data = event.data;
                }
            } else {
                data = event.data;
            }
            console.log('Received data:', data)
            const tableName = data.id.tb;
            if (this.onUpdatedCallbacks.has(tableName)) {
                const callback = this.onUpdatedCallbacks.get(tableName);
                if (callback) {
                    callback(data);
                }
            }
        });

        this.socket.addEventListener('error', (event: Event) => {
            console.error('WebSocket error:', event);
        });
    }

    public onUpdated(tableName: string, callback: (data: any) => void): void {
        console.log('mounted for live update : ', tableName);
        this.onUpdatedCallbacks.set(tableName, callback);
    }
}

RocketBase.prototype.sendMessage = sendMessage;
RocketBase.prototype.processMessageQueue = processMessageQueue;