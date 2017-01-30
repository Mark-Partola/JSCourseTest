import Messenger from './Messenger';
import {autobind} from 'core-decorators';
import Helper from './Helper';

type message = {
    stateId: number
};

type pulledMessage = message & {
    pulled: number,
    stateId: number
};

type checkMessage = message & {
    action: 'check',
    lever1: number,
    lever2: number,
    stateId: number,
    same: boolean
};

type powerMessage = message & {
    newState: "poweredOff" | "poweredOn",
    token?: string
}

type incomingMessage = pulledMessage & checkMessage & powerMessage;

@autobind
export default class ManualControlPanel {

    private static RESOLVING_STATE = 'resolving';
    private static BALANCING_STATE = 'balancing';

    private leversState: number = 0b0000;
    private resolvedPosition: number = 0;
    private systemState: string = ManualControlPanel.RESOLVING_STATE;
    private messenger: Messenger;

    private resolvedPairs: number[][] = [];

    private potentialNeededStates: Array<number> = [0b0000, 0b1111];

    constructor() {
        this.messenger = new Messenger('ws://nuclear.t.javascript.ninja');
        this.messenger.subscribe(this.onMessage);
    }

    public onMessage(message: incomingMessage): void {
        Helper.write(message);

        if (typeof message.pulled === 'number') {
            this.pulledAction(message);
        } else if (message.action === 'check') {
            this.checkAction(message);
        } else if (message.newState === 'poweredOn') {
            this.poweredOnAction();
        } else if (message.newState === 'poweredOff') {
            this.poweredOffAction(message);
        }

        Helper.print(this.leversState);
    }

    private pulledAction(message: pulledMessage): void {
        if (this.systemState === ManualControlPanel.RESOLVING_STATE) {
            this.resolveLevers(message);
        }

        if (message.pulled <= this.resolvedPosition) {
            this.balancePositions(message);
        }
    }

    private checkAction(message: checkMessage): void {
        if (this.resolvedPosition === 0) {
            if (message.same) {
                this.leversState = 0b0011;
            } else {
                this.leversState = 0b0010;
            }
        } else {
            let nextPosMask = this.getStateMask(this.resolvedPosition + 1);
            let currentPosMask = this.getStateMask(this.resolvedPosition);
            const isBeforeTrue = Boolean(this.leversState & currentPosMask);

            if (message.same) {
                nextPosMask = isBeforeTrue ? nextPosMask : this.leversState;
                this.leversState |= nextPosMask;
            } else {
                nextPosMask = isBeforeTrue ? this.leversState : nextPosMask;
                this.leversState |= nextPosMask;
            }
        }

        this.resolvedPosition++;

        if (this.resolvedPosition >= 3) {
            this.systemState = ManualControlPanel.BALANCING_STATE;
        }
    }

    private poweredOnAction() {
        let indexOfPotentialState = this.potentialNeededStates.indexOf(this.leversState);
        if (~indexOfPotentialState) {
            this.potentialNeededStates.splice(indexOfPotentialState, 1);
        }
    }

    private poweredOffAction(message: powerMessage) {
        console.log(`Nuclear station is disabled! ${message.token}`);
        this.messenger.disable();
    }

    private resolveLevers(message: pulledMessage): void {
        let resolvedPairs = this.resolvedPairs.some((check) => {
            return (check[0] === this.resolvedPosition) && (check[1] === this.resolvedPosition + 1);
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
    }

    private balancePositions(message: pulledMessage): void {
        this.leversState = this.updateState(this.leversState, message);

        if (this.checkNecessaryState(this.leversState)) {
            this.messenger.send({
                action: "powerOff",
                stateId: message.stateId
            });
        }
    }

    private updateState(state: number, message: pulledMessage): number {
        const lever = message.pulled;
        return state ^ this.getStateMask(lever);
    }

    private getStateMask(position: number): number {
        let stateMask;

        if (position === 0) {
            stateMask = 0b0001;
        } else if (position === 1) {
            stateMask = 0b0010
        } else if (position === 2) {
            stateMask = 0b0100
        } else {
            stateMask = 0b1000
        }

        return stateMask;
    }

    private checkNecessaryState(state: number): boolean {
        if (~this.potentialNeededStates.indexOf(state)) {
            Helper.write('Maybe it is a necessary state');
            return true;
        }

        return false;
    }
}