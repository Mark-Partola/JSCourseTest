import {autobind} from 'core-decorators';

@autobind
export default class Messenger {

    private socket: WebSocket;
    private messageHandler: Function;

    constructor(address: string) {
        this.socket = new WebSocket(address);
        this.addListeners();
    }

    public subscribe(handler: Function) {
        this.messageHandler = handler;
        this.socket.onmessage = this.processMessage;
    }

    public send(message: Object) {
        this.socket.send(JSON.stringify(message));
    }

    public disable() {
        this.socket.close();
    }

    private addListeners() {
        this.socket.onerror = this.onError;
        this.socket.onopen = this.onOpen;
        this.socket.onclose = this.onClose;
    }

    private processMessage(event: MessageEvent) {
        try {
            const message = JSON.parse(event.data);
            this.messageHandler(message);
        } catch (e) {
            throw new Error(`Given incorrect json: ${e}`);
        }
    }

    private onOpen() {
        console.log("Соединение установлено.");
    }

    private onError(error: ErrorEvent) {
        console.log("Ошибка " + error.message);
    }

    private onClose(event: CloseEvent) {
        if (event.wasClean) {
            console.log('Соединение закрыто чисто');
        } else {
            console.log('Обрыв соединения');
        }
    }
}