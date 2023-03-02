PP.DebugFunctionsPerformanceAnalysisResultsLoggerParams = class DebugFunctionsPerformanceAnalysisResultsLoggerParams {
    constructor() {
        this.myPerformanceAnalyzer = null;

        this.myLogTitle = "Functions Performance Analysis Results";
        this.mySecondsBetweenLogs = 1;
        this.myLogFunction = "log";

        this.myLogMaxResults = false;

        this.myLogCollapsed = false;

        this.myLogSortOrder = PP.DebugFunctionsPerformanceAnalyzerSortOrder.NONE;

        this.myLogMaxAmountOfResults = null;
        this.myLogResultsWithCallsCountAbove = null;
        this.myLogResultsWithTotalExecutionTimePercentageAbove = null;

        this.myLogCallsCountResults = false;
        this.myLogTotalExecutionTimeResults = false;
        this.myLogTotalExecutionTimePercentageResults = false;
        this.myLogAverageExecutionTimeResults = false;

        this.myClearConsoleBeforeLog = false;
    }
};

PP.DebugFunctionsPerformanceAnalysisResultsLogger = class DebugFunctionsPerformanceAnalysisResultsLogger {
    constructor(params) {
        this._myParams = params;

        this._myLogTimer = new PP.Timer(this._myParams.mySecondsBetweenLogs);
    }

    update(dt) {
        if (this._myParams.myPerformanceAnalyzer == null) {
            return;
        }

        this._myLogTimer.update(dt);
        if (this._myLogTimer.isDone()) {
            this._myLogTimer.start();

            let timeSinceLastReset = this._myParams.myPerformanceAnalyzer.getTimeSinceLastReset();

            let analysisResults = null;
            if (!this._myParams.myLogMaxFunctionCalls) {
                analysisResults = this._myParams.myPerformanceAnalyzer.getResults(this._myParams.myLogSortOrder);
            } else {
                analysisResults = this._myParams.myPerformanceAnalyzer.getMaxResults(this._myParams.myLogSortOrder);
            }

            if (this._myParams.myLogResultsWithCallsCountAbove != null) {
                let analysisResultsClone = new Map(analysisResults);
                analysisResults = new Map();
                let keys = [...analysisResultsClone.keys()];
                for (let i = 0; i < keys.length; i++) {
                    let results = analysisResultsClone.get(keys[i]);
                    if (results.myCallsCount > this._myParams.myLogResultsWithCallsCountAbove) {
                        analysisResults.set(keys[i], results);
                    }
                }
            }

            if (this._myParams.myLogResultsWithTotalExecutionTimePercentageAbove != null) {
                let analysisResultsClone = new Map(analysisResults);
                analysisResults = new Map();
                let keys = [...analysisResultsClone.keys()];
                for (let i = 0; i < keys.length; i++) {
                    let results = analysisResultsClone.get(keys[i]);
                    if (results.myTotalExecutionTimePercentage * 100 > this._myParams.myLogResultsWithTotalExecutionTimePercentageAbove) {
                        analysisResults.set(keys[i], results);
                    }
                }
            }

            if (this._myParams.myLogMaxAmountOfResults != null) {
                let analysisResultsClone = new Map(analysisResults);
                analysisResults = new Map();
                let keys = [...analysisResultsClone.keys()];
                for (let i = 0; i < this._myParams.myLogMaxAmountOfResults && i < keys.length; i++) {
                    let counter = analysisResultsClone.get(keys[i]);
                    analysisResults.set(keys[i], counter);
                }
            }

            if (this._myParams.myClearConsoleBeforeLog) {
                console.clear();
            }

            let analysisResultsToLog = new Map();
            for (let key of analysisResults.keys()) {
                let currentResults = analysisResults.get(key);

                let resultsToLog = {};
                if (this._myParams.myLogCallsCountResults) {
                    resultsToLog.myCallsCount = currentResults.myCallsCount;
                }

                if (this._myParams.myLogTotalExecutionTimeResults) {
                    resultsToLog.myTotalExecutionTime = currentResults.myTotalExecutionTime;
                }

                if (this._myParams.myLogTotalExecutionTimePercentageResults) {
                    resultsToLog.myTotalExecutionTimePercentage = currentResults.myTotalExecutionTimePercentage;
                }

                if (this._myParams.myLogAverageExecutionTimeResults) {
                    resultsToLog.myAverageExecutionTime = currentResults.myAverageExecutionTime;
                }

                analysisResultsToLog.set(key, resultsToLog);
            }


            if (this._myParams.myLogCollapsed) {
                console[this._myParams.myLogFunction](this._myParams.myLogTitle, "\nTime Elasped:", timeSinceLastReset.toFixed(3), " ms\n", analysisResultsToLog);
            } else {
                let resultsText = "";

                for (let entry of analysisResults.entries()) {
                    let name = entry[0];
                    let results = entry[1];
                    resultsText += "\n" + name;

                    let textOrdered = [];

                    let callsCountText = "Calls Count: " + results.myCallsCount;
                    let totalExecutionTimeText = "Total Time: " + results.myTotalExecutionTime.toFixed(3) + " ms";
                    let totalExecutionTimePercentageText = "Total Time %: " + (results.myTotalExecutionTimePercentage * 100).toFixed(2) + "%";
                    let averageExecutionTimeText = "Average Time: " + results.myAverageExecutionTime.toFixed(3) + " ms";

                    if (!this._myParams.myLogCallsCountResults) {
                        callsCountText = null;
                    }

                    if (this._myParams.myLogTotalExecutionTimeResults) {
                        totalExecutionTimeText = null;
                    }

                    if (this._myParams.myLogTotalExecutionTimePercentageResults) {
                        totalExecutionTimePercentageText = null;
                    }

                    if (this._myParams.myLogAverageExecutionTimeResults) {
                        averageExecutionTimeText = null;
                    }

                    switch (this._myParams.myLogSortOrder) {
                        case PP.DebugFunctionsPerformanceAnalyzerSortOrder.CALLS_COUNT:
                            textOrdered.push(callsCountText);
                            textOrdered.push(totalExecutionTimeText);
                            textOrdered.push(totalExecutionTimePercentageText);
                            textOrdered.push(averageExecutionTimeText);
                            break;
                        case PP.DebugFunctionsPerformanceAnalyzerSortOrder.TOTAL_EXECUTION_TIME:
                            textOrdered.push(totalExecutionTimeText);
                            textOrdered.push(totalExecutionTimePercentageText);
                            textOrdered.push(averageExecutionTimeText);
                            textOrdered.push(callsCountText);
                            break;
                        case PP.DebugFunctionsPerformanceAnalyzerSortOrder.AVERAGE_EXECUTION_TIME:
                            textOrdered.push(averageExecutionTimeText);
                            textOrdered.push(totalExecutionTimeText);
                            textOrdered.push(totalExecutionTimePercentageText);
                            textOrdered.push(callsCountText);
                            break;
                        default:
                            textOrdered.push(callsCountText);
                            textOrdered.push(totalExecutionTimeText);
                            textOrdered.push(totalExecutionTimePercentageText);
                            textOrdered.push(averageExecutionTimeText);
                    }

                    for (let text of textOrdered) {
                        if (text != null) {
                            resultsText += " - " + text;
                        }
                    }
                }

                if (this.myLogTotalExecutionTimePercentageResults || this._myParams.myLogTotalExecutionTimePercentageResults || this._myParams.myLogAverageExecutionTimeResults) {
                    console[this._myParams.myLogFunction](this._myParams.myLogTitle, "\nTotal Time:", timeSinceLastReset.toFixed(3), " ms", resultsText);
                } else {
                    console[this._myParams.myLogFunction](this._myParams.myLogTitle, "\n", resultsText);
                }
            }
        }

    }
};