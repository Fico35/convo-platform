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
    importStates(stateJson) {
        const ChatbotState = require('./ChatbotState');
        let arr = JSON.parse(stateJson);
        for (let i = 0; i < arr.length; i++) {
            // for each state
            let state = new ChatbotState(arr[i].name);
            for (let answerObject of arr[i].answers) {
                // read only answers, skip actions
                state.addAnswer(answerObject.intent, answerObject.answers);
            }
            this.addState(state);
        }
    }
    importStatesWithFunctions(stateJson) {
        // import all states from json (with actions)
        // import functions with new Function(functionString)
        // give warning for untrusted sources
    }
    exportStates(callback = null) {
        // ADD escaping " to \"
        let exportJson = `[`;
        for (let [name, state] of this.allStates) {
            // iterate through all states
            exportJson += `{"name":"${name}","answers":[`;
            for (let [intent, answers] of state.answers) {
                exportJson += `{"intent":"${intent}","answers":[`;
                for (let ans of answers) {
                    exportJson += `"${ans}",`;
                }
                exportJson = exportJson.slice(0, -1); // remove last comma
                exportJson += `]},`;
            }
            exportJson = exportJson.slice(0, -1); // remove last comma
            exportJson += `]},`;
        }
        exportJson = exportJson.slice(0, -1); // remove last comma
        exportJson += `]`;
        // return Promise if callback is null
        if (callback == null) {
            return exportJson;
        } else {
            callback(exportJson);
        }
    }
    exportStatesWithFunctions(callback = null) {
        // return Promise if callback is null
        // (with actions)
        // export functions with Function.prototype.toString()
        // give warning for unsafe code
    }

    // ----- HANDLER ----- //
    async handle(sentence, callback = null) {
        // async always returns result wrapped in Promise
        if (this.currentState == null) {
            throw new Error("No state has been selected.");
        }
        let intent = await this.extractIntent(sentence);
        // return Promise if callback is null
        if (callback == null) {
            return this.currentState.handle(intent);
        } else {
            callback(this.currentState.handle(intent));
        }
    }
}

module.exports = Chatbot;
