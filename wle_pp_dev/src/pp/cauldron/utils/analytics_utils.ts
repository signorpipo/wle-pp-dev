let _myAnalyticsEnabled: boolean = false;

let _mySendDataCallback: ((...args: unknown[]) => void) | null = null;

const _myEventsSentOnce: string[] = [];

let _myDataLogEnabled: boolean = false;
let _myEventsLogEnabled: boolean = false;

let _myErrorsLogEnabled: boolean = false;

export function setAnalyticsEnabled(enabled: boolean): void {
    _myAnalyticsEnabled = enabled;
}

export function isAnalyticsEnabled(): boolean {
    return _myAnalyticsEnabled;
}

export function setSendDataCallback(callback: ((...args: unknown[]) => void) | null): void {
    _mySendDataCallback = callback;
}

export function sendData(...args: unknown[]): void {
    try {
        if (_myAnalyticsEnabled) {
            if (_myDataLogEnabled) {
                console.log("Analytics Data: " + args);
            }

            if (_mySendDataCallback != null) {
                _mySendDataCallback(...args);
            } else if (_myErrorsLogEnabled) {
                console.error("You need to set the send data callback");
            }
        }
    } catch (error) {
        if (_myErrorsLogEnabled) {
            console.error(error);
        }
    }
}

export function sendEvent(eventName: string, params?: Record<string, unknown>, sendOnce: boolean = false): void {
    try {
        if (_myAnalyticsEnabled) {
            let sendEventAllowed = true;

            if (sendOnce) {
                sendEventAllowed = !AnalyticsUtils.hasEventAlreadyBeenSent(eventName);
            }

            if (sendEventAllowed) {
                if (_myEventsLogEnabled) {
                    if (params != null) {
                        console.log("Analytics Event: " + eventName + " - Params:", params);
                    } else {
                        console.log("Analytics Event: " + eventName);
                    }
                }

                if (_mySendDataCallback != null) {
                    if (params != null) {
                        _mySendDataCallback("event", eventName, params);
                    } else {
                        _mySendDataCallback("event", eventName);
                    }

                    if (sendOnce) {
                        _myEventsSentOnce.pp_pushUnique(eventName);
                    }
                } else if (_myErrorsLogEnabled) {
                    console.error("You need to set the send data callback");
                }
            }
        }
    } catch (error) {
        if (_myErrorsLogEnabled) {
            console.error(error);
        }
    }
}

export function sendEventOnce(eventName: string, params?: Record<string, unknown>): void {
    AnalyticsUtils.sendEvent(eventName, params, true);
}

export function sendEventWithValue(eventName: string, value: number, sendOnce: boolean = false): void {
    AnalyticsUtils.sendEvent(eventName, { "value": value }, sendOnce);
}

export function sendEventOnceWithValue(eventName: string, value: number): void {
    AnalyticsUtils.sendEventWithValue(eventName, value, true);
}

export function clearEventSentOnceState(eventName: string): void {
    _myEventsSentOnce.pp_removeEqual(eventName);
}

export function clearAllEventsSentOnceState(): void {
    _myEventsSentOnce.pp_clear();
}

export function hasEventAlreadyBeenSent(eventName: string): boolean {
    return _myEventsSentOnce.pp_hasEqual(eventName);
}

export function getEventsAlreadyBeenSent(): string[] {
    return _myEventsSentOnce;
}

export function setDataLogEnabled(enabled: boolean): void {
    _myDataLogEnabled = enabled;
}

export function isDataLogEnabled(): boolean {
    return _myDataLogEnabled;
}

export function setEventsLogEnabled(enabled: boolean): void {
    _myEventsLogEnabled = enabled;
}

export function isEventsLogEnabled(): boolean {
    return _myEventsLogEnabled;
}

export function setErrorsLogEnabled(enabled: boolean): void {
    _myErrorsLogEnabled = enabled;
}

export function isErrorsLogEnabled(): boolean {
    return _myErrorsLogEnabled;
}

export const AnalyticsUtils = {
    setAnalyticsEnabled,
    isAnalyticsEnabled,
    setSendDataCallback,
    sendData,
    sendEvent,
    sendEventOnce,
    sendEventWithValue,
    sendEventOnceWithValue,
    clearEventSentOnceState,
    clearAllEventsSentOnceState,
    hasEventAlreadyBeenSent,
    getEventsAlreadyBeenSent,
    setDataLogEnabled,
    isDataLogEnabled,
    setEventsLogEnabled,
    isEventsLogEnabled,
    setErrorsLogEnabled,
    isErrorsLogEnabled
} as const;