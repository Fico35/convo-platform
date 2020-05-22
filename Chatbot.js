class Chatbot {
    // ----- CONSTRUCTOR ----- //
    constructor(intentExtractionFunction) {
        if (intentExtractionFunction == null) { // == matches null and undefined
            throw new Error("Please define an intent extracting function for your chatbot.");
        }
        this.extractIntent = intentExtractionFunction;
        this.allStates = new Map();
    }

    // ----- ALL STATES ----- //
    addState(state) {
        const ChatbotState = require('./ChatbotState');
        if (state instanceof ChatbotState) {
            state.chatbot = this;   // add chatbot reference to state
            this.allStates.set(state.name, state);
        } else {
            throw new Error("Given parameter is not of type ChatbotState.");
        }
    }
    getState(stateName) {
        return this.allStates.get(stateName);
    }

    // ----- CURRENT STATE ----- //
    setCurrentState(stateName) {
        if (this.allStates.has(stateName)) {
            this.currentState = this.allStates.get(stateName);
        } else {
            throw new Error(`State with given name (${stateName}) does not exist.`);
        }
    }

    // ----- IMPORT/EXPORT ----- //
    async importStates(stateJson, callback = null) {
        const ChatbotState = require('./ChatbotState');
        let arr = JSON.parse(stateJson);
        for (let i = 0; i < arr.length; i++) {
            // for each state
            let state = new ChatbotState(arr[i].name);
            // read only answers and suggestions, skip actions
            for (let answerObject of arr[i].answers) {
                state.addAnswer(answerObject.intent, answerObject.answers);
            }
            for (let suggestionObject of arr[i].suggestions) {
                state.addAnswer(suggestionObject.intent, suggestionObject.suggestions);
            }
            this.addState(state);
        }
        if (callback != null) {
            callback();
        }
    }

    async importStatesWithFunctions(stateJson, callback = null) {
        // import all states from json (with actions)
        // import functions with new Function(functionString)
        // give warning for untrusted sources
        if (callback != null) {
            callback();
        }
    }

    async exportStates(callback = null) {
        let exportJson = `[`;
        for (let [name, state] of this.allStates) {
            // start STATE
            exportJson += `{"name":"${name.replace(/\"/g, "\\\"")}",`;
            // start ANSWERS
            exportJson += `"answers":[`;
            for (let [intent, answers] of state.answers) {
                exportJson += `{"intent":"${intent.replace(/\"/g, "\\\"")}","answers":[`;
                for (let ans of answers) {
                    exportJson += `"${ans.replace(/\"/g, "\\\"")}",`;
                }
                exportJson = exportJson.slice(0, -1); // remove last comma
                exportJson += `]},`;
            }
            exportJson = exportJson.slice(0, -1); // remove last comma
            exportJson += `],`; // end ANSWERS
            // start SUGGESTIONS
            exportJson += `"suggestions":[`;
            for (let [intent, suggestions] of state.suggestions) {
                exportJson += `{"intent":"${intent.replace(/\"/g, "\\\"")}","suggestions":[`;
                for (let sugg of suggestions) {
                    exportJson += `"${sugg.replace(/\"/g, "\\\"")}",`;
                }
                exportJson = exportJson.slice(0, -1); // remove last comma
                exportJson += `]},`;
            }
            exportJson = exportJson.slice(0, -1); // remove last comma
            exportJson += `],`; // end SUGGESTIONS
            exportJson += `},`; // end STATE
        }
        exportJson = exportJson.slice(0, -1); // remove last comma
        exportJson += `]`;
        // return Promise if callback is null
        if (callback != null) {
            callback(exportJson);
        } else {
            return exportJson;
        }
    }

    async exportStatesWithFunctions(callback = null) {
        let exportJson = ``;
        // return Promise if callback is null
        // (with actions)
        // export functions with Function.prototype.toString()
        // give warning for unsafe code
        if (callback != null) {
            callback(exportJson);
        } else {
            return exportJson;
        }
    }

    // ----- HANDLER ----- //
    async handle(sentence, callback = null) {
        // async always returns result wrapped in Promise
        if (this.currentState == null) {
            throw new Error("No state has been selected.");
        }
        let intent = await this.extractIntent(sentence);
        let response = await this.currentState.handle(intent);
        // return Promise if callback is null
        if (callback != null) {
            callback(response);
        } else {
            return response;
        }
    }
}

module.exports = Chatbot;
