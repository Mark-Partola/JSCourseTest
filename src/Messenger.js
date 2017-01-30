System.register(["core-decorators"], function (exports_1, context_1) {
    "use strict";
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __moduleName = context_1 && context_1.id;
    var core_decorators_1, Messenger;
    return {
        setters: [
            function (core_decorators_1_1) {
                core_decorators_1 = core_decorators_1_1;
            }
        ],
        execute: function () {
            Messenger = (function () {
                function Messenger(address) {
                    this.socket = new WebSocket(address);
                    this.addListeners();
                }
                Messenger.prototype.subscribe = function (handler) {
                    this.messageHandler = handler;
                    this.socket.onmessage = this.processMessage;
                };
                Messenger.prototype.send = function (message) {
                    this.socket.send(JSON.stringify(message));
                };
                Messenger.prototype.disable = function () {
                    this.socket.close();
                };
                Messenger.prototype.addListeners = function () {
                    this.socket.onerror = this.onError;
                    this.socket.onopen = this.onOpen;
                    this.socket.onclose = this.onClose;
                };
                Messenger.prototype.processMessage = function (event) {
                    try {
                        var message = JSON.parse(event.data);
                        this.messageHandler(message);
                    }
                    catch (e) {
                        throw new Error("Given incorrect json: " + e);
                    }
                };
                Messenger.prototype.onOpen = function () {
                    console.log("Соединение установлено.");
                };
                Messenger.prototype.onError = function (error) {
                    console.log("Ошибка " + error.message);
                };
                Messenger.prototype.onClose = function (event) {
                    if (event.wasClean) {
                        console.log('Соединение закрыто чисто');
                    }
                    else {
                        console.log('Обрыв соединения');
                    }
                };
                return Messenger;
            }());
            Messenger = __decorate([
                core_decorators_1.autobind
            ], Messenger);
            exports_1("default", Messenger);
        }
    };
});
//# sourceMappingURL=Messenger.js.map