export class AnalyticsManager {
    constructor() {
        this._myAnalyticsEnabled = false;

        this._mySendDataCallback = null;

        this._myEventsSentOnce = [];

        this._myDataLogEnabled = false;
        this._myEventsLogEnabled = false;

        this._myErrorsLogEnabled = false;
    }

    setAnalyticsEnabled(enabled) {
        this._myAnalyticsEnabled = enabled;
    }

    isAnalyticsEnabled() {
        return this._myAnalyticsEnabled;
    }

    setSendDataCallback(callback) {
        this._mySendDataCallback = callback;
    }

    sendData(...args) {
        try {
            if (this._myAnalyticsEnabled) {
                if (this._myDataLogEnabled) {
                    console.log("Analytics Data: " + args);
                }

                if (this._mySendDataCallback != null) {
                    this._mySendDataCallback(...args);
                } else if (this._myErrorsLogEnabled) {
                    console.error("You need to set the send data callback");
                }
            }
        } catch (error) {
            if (this._myErrorsLogEnabled) {
                console.error(error);
            }
        }
    }

    sendEvent(eventName, value = null, sendOnce = false) {
        try {
            if (this._myAnalyticsEnabled) {
                let sendEventAllowed = true;

                if (sendOnce) {
                    sendEventAllowed = !this.hasEventAlreadyBeenSent(eventName);
                }

                if (sendEventAllowed) {
                    if (this._myEventsLogEnabled) {
                        if (value != null) {
                            console.log("Analytics Event: " + eventName + " - Value: " + value);
                        } else {
                            console.log("Analytics Event: " + eventName);
                        }
                    }

                    if (this._mySendDataCallback != null) {
                        if (value != null) {
                            this._mySendDataCallback("event", eventName, { "value": value });
                        } else {
                            this._mySendDataCallback("event", eventName);
                        }

                        if (sendOnce) {
                            this._myEventsSentOnce.pp_pushUnique(eventName);
                        }
                    } else if (this._myErrorsLogEnabled) {
                        console.error("You need to set the send data callback");
                    }
                }
            }
        } catch (error) {
            if (this._myErrorsLogEnabled) {
                console.error(error);
            }
        }
    }

    sendEventOnce(eventName, value = null) {
        this.sendEvent(eventName, value, true);
    }

    clearEventSentOnceState(eventName) {
        this._myEventsSentOnce.pp_removeEqual(eventName);
    }

    clearAllEventsSentOnceState() {
        this._myEventsSentOnce.pp_clear();
    }

    hasEventAlreadyBeenSent(eventName) {
        return this._myEventsSentOnce.pp_hasEqual(eventName);
    }

    getEventsAlreadyBeenSent() {
        return this._myEventsSentOnce;
    }

    setDataLogEnabled(enabled) {
        this._myDataLogEnabled = enabled;
    }

    isDataLogEnabled() {
        return this._myDataLogEnabled;
    }

    setEventsLogEnabled(enabled) {
        this._myEventsLogEnabled = enabled;
    }

    isEventsLogEnabled() {
        return this._myEventsLogEnabled;
    }

    setErrorsLogEnabled(enabled) {
        this._myErrorsLogEnabled = enabled;
    }

    isErrorsLogEnabled() {
        return this._myErrorsLogEnabled;
    }
}