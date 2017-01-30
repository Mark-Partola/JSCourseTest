System.register(["./Messenger", "core-decorators", "./Helper"], function (exports_1, context_1) {
    "use strict";
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __moduleName = context_1 && context_1.id;
    var Messenger_1, core_decorators_1, Helper_1, ManualControlPanel, ManualControlPanel_1;
    return {
        setters: [
            function (Messenger_1_1) {
                Messenger_1 = Messenger_1_1;
            },
            function (core_decorators_1_1) {
                core_decorators_1 = core_decorators_1_1;
            },
            function (Helper_1_1) {
                Helper_1 = Helper_1_1;
            }
        ],
        execute: function () {
            ManualControlPanel = ManualControlPanel_1 = (function () {
                function ManualControlPanel() {
                    this.leversState = 0;
                    this.resolvedPosition = 0;
                    this.systemState = ManualControlPanel_1.RESOLVING_STATE;
                    this.resolvedPairs = [];
                    this.potentialNeededStates = [0, 15];
                    this.messenger = new Messenger_1["default"]('ws://nuclear.t.javascript.ninja');
                    this.messenger.subscribe(this.onMessage);
                }
                ManualControlPanel.prototype.onMessage = function (message) {
                    Helper_1["default"].write(message);
                    if (typeof message.pulled === 'number') {
                        this.pulledAction(message);
                    }
                    else if (message.action === 'check') {
                        this.checkAction(message);
                    }
                    else if (message.newState === 'poweredOn') {
                        this.poweredOnAction();
                    }
                    else if (message.newState === 'poweredOff') {
                        this.poweredOffAction(message);
                    }
                    Helper_1["default"].print(this.leversState);
                };
                ManualControlPanel.prototype.pulledAction = function (message) {
                    if (this.systemState === ManualControlPanel_1.RESOLVING_STATE) {
                        this.resolveLevers(message);
                    }
                    if (message.pulled <= this.resolvedPosition) {
                        this.balancePositions(message);
                    }
                };
                ManualControlPanel.prototype.checkAction = function (message) {
                    if (this.resolvedPosition === 0) {
                        if (message.same) {
                            this.leversState = 3;
                        }
                        else {
                            this.leversState = 2;
                        }
                    }
                    else {
                        var nextPosMask = this.getStateMask(this.resolvedPosition + 1);
                        var currentPosMask = this.getStateMask(this.resolvedPosition);
                        var isBeforeTrue = Boolean(this.leversState & currentPosMask);
                        if (message.same) {
                            nextPosMask = isBeforeTrue ? nextPosMask : this.leversState;
                            this.leversState |= nextPosMask;
                        }
                        else {
                            nextPosMask = isBeforeTrue ? this.leversState : nextPosMask;
                            this.leversState |= nextPosMask;
                        }
                    }
                    this.resolvedPosition++;
                    if (this.resolvedPosition >= 3) {
                        this.systemState = ManualControlPanel_1.BALANCING_STATE;
                    }
                };
                ManualControlPanel.prototype.poweredOnAction = function () {
                    var indexOfPotentialState = this.potentialNeededStates.indexOf(this.leversState);
                    if (~indexOfPotentialState) {
                        this.potentialNeededStates.splice(indexOfPotentialState, 1);
                    }
                };
                ManualControlPanel.prototype.poweredOffAction = function (message) {
                    console.log("Nuclear station is disabled! " + message.token);
                    this.messenger.disable();
                };
                ManualControlPanel.prototype.resolveLevers = function (message) {
                    var _this = this;
                    var resolvedPairs = this.resolvedPairs.some(function (check) {
                        return (check[0] === _this.resolvedPosition) && (check[1] === _this.resolvedPosition + 1);
                    });
                    if (resolvedPairs) {
                        return;
                    }
                    this.messenger.send({
                        action: 'check',
                        lever1: this.resolvedPosition,
                        lever2: this.resolvedPosition + 1,
                        stateId: message.stateId
                    });
                    this.resolvedPairs.push([
                        this.resolvedPosition,
                        this.resolvedPosition + 1
                    ]);
                };
                ManualControlPanel.prototype.balancePositions = function (message) {
                    this.leversState = this.updateState(this.leversState, message);
                    if (this.checkNecessaryState(this.leversState)) {
                        this.messenger.send({
                            action: "powerOff",
                            stateId: message.stateId
                        });
                    }
                };
                ManualControlPanel.prototype.updateState = function (state, message) {
                    var lever = message.pulled;
                    return state ^ this.getStateMask(lever);
                };
                ManualControlPanel.prototype.getStateMask = function (position) {
                    var stateMask;
                    if (position === 0) {
                        stateMask = 1;
                    }
                    else if (position === 1) {
                        stateMask = 2;
                    }
                    else if (position === 2) {
                        stateMask = 4;
                    }
                    else {
                        stateMask = 8;
                    }
                    return stateMask;
                };
                ManualControlPanel.prototype.checkNecessaryState = function (state) {
                    if (~this.potentialNeededStates.indexOf(state)) {
                        Helper_1["default"].write('Maybe it is a necessary state');
                        return true;
                    }
                    return false;
                };
                return ManualControlPanel;
            }());
            ManualControlPanel.RESOLVING_STATE = 'resolving';
            ManualControlPanel.BALANCING_STATE = 'balancing';
            ManualControlPanel = ManualControlPanel_1 = __decorate([
                core_decorators_1.autobind
            ], ManualControlPanel);
            exports_1("default", ManualControlPanel);
        }
    };
});
//# sourceMappingURL=ManualControlPanel.js.map