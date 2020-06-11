class Chatbot {
    // ----- CONSTRUCTOR ----- //
    constructor(intentExtractionFunction) {
        if (intentExtractionFunction == null) { // == matches null and undefined
            throw new Error("Please define an intent extracting function for your chatbot.");
        }
        if (typeof intentExtractionFunction !== "function" && !(intentExtractionFunction instanceof Function)) {
            throw new Error("Parameter given to chatbot is not a function.");
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

    async importStatesWithActions(stateJson, callback = null) {
        const ChatbotState = require('./ChatbotState');
        let arr = JSON.parse(stateJson);
        for (let i = 0; i < arr.length; i++) {
            // for each state
            let state = new ChatbotState(arr[i].name);
            // read actions, answers & suggestions
            for (let actionObject of arr[i].actions) {
                let funcTemp = new Function(actionObject.paramName, actionObject.functionCode);
                state.addAction(actionObject.intent, funcTemp);
            }
            for (let answerObject of arr[i].answers) {
                state.addAnswer(answerObject.intent, answerObject.answers);
            }
            for (let suggestionObject of arr[i].suggestions) {
                state.addAnswer(suggestionObject.intent, suggestionObject.suggestions);
            }
            this.addState(state);
        }
        console.warn("This feature converts strings from JSON format into executable code. If the source of this is not trusted, it might be harmful or cause many errors. Please only use this if you know what you are doing!");
        if (callback != null) {
            callback();
        }
    }

    async exportStates(callback = null) {
        let stateArray = [];
        for (let [name, state] of this.allStates) {
            // start STATE
            let stateString = `{"name":"${name.replace(/\"/g, "\\\"")}",`;
            // start ANSWERS
            stateString += `"answers":[`;
            let answerArray = [];
            for (let [intent, answers] of state.answers) {
                let answerString = `{"intent":"${intent.replace(/\"/g, "\\\"")}","answers":[`;
                for (let i in answers) {
                    answers[i] = JSON.stringify(answers[i]);
                }
                answerString += answers.join(",");
                answerString += `]}`;
                answerArray.push(answerString);
            }
            stateString += answerArray.join(",");
            stateString += `],`; // end ANSWERS
            // start SUGGESTIONS
            stateString += `"suggestions":[`;
            let suggestionArray = [];
            for (let [intent, suggestions] of state.suggestions) {
                let suggestionString = `{"intent":"${intent.replace(/\"/g, "\\\"")}","suggestions":[`;
                for (let i in suggestions) {
                    suggestions[i] = `"${suggestions[i].replace(/\"/g, "\\\"")}"`;
                }
                suggestionString += suggestions.join(",");
                suggestionString += `]},`;
                suggestionArray.push(suggestionString);
            }
            stateString += suggestionArray.join(",");
            stateString += `]`; // end SUGGESTIONS
            stateString += `}`; // end STATE
            stateArray.push(stateString);
        }
        let exportJson = `[` + stateArray.join(",") + `]`;
        if (callback != null) {
            callback(exportJson);
        } else {
            return exportJson;
        }
    }

    async exportStatesWithActions(callback = null) {
        let stateArray = [];
        for (let [name, state] of this.allStates) {
            // start STATE
            let stateString = `{"name":"${name.replace(/\"/g, "\\\"")}",`;
            // start ACTIONS
            stateString += `"actions":[`;
            let actionArray = [];
            for (let [intent, action] of state.actions) {
                let funcString = action.toString();
                let paramName = funcString.substring(funcString.search(/\(/) + 1, funcString.search(/\)/)).trim();
                if (paramName.search(/,/) !== -1) {
                    console.error(`Action function must only have 1 parameter (current chatbot state).\nSkipping action for intent "${intent}" in state "${name}".`);
                    continue;
                }
                funcString = funcString.substring(funcString.search(/\{/) + 1, funcString.search(/\}/)).trim().replace(/\s*\n\s*/g, "");
                actionArray.push(`{"intent":"${intent.replace(/\"/g, "\\\"")}",`
                                + `"paramName":"${paramName.replace(/\"/g, "\\\"")}",`
                                + `"functionCode":"${funcString.replace(/\"/g, "\\\"")}"}`);
            }
            stateString += actionArray.join(",");
            stateString += `],`; // end ACTIONS
            // start ANSWERS
            stateString += `"answers":[`;
            let answerArray = [];
            for (let [intent, answers] of state.answers) {
                let answerString = `{"intent":"${intent.replace(/\"/g, "\\\"")}","answers":[`;
                for (let i in answers) {
                    answers[i] = JSON.stringify(answers[i]);
                }
                answerString += answers.join(",");
                answerString += `]}`;
                answerArray.push(answerString);
            }
            stateString += answerArray.join(",");
            stateString += `],`; // end ANSWERS
            // start SUGGESTIONS
            stateString += `"suggestions":[`;
            let suggestionArray = [];
            for (let [intent, suggestions] of state.suggestions) {
                let suggestionString = `{"intent":"${intent.replace(/\"/g, "\\\"")}","suggestions":[`;
                for (let i in suggestions) {
                    suggestions[i] = `"${suggestions[i].replace(/\"/g, "\\\"")}"`;
                }
                suggestionString += suggestions.join(",");
                suggestionString += `]},`;
                suggestionArray.push(suggestionString);
            }
            stateString += suggestionArray.join(",");
            stateString += `]`; // end SUGGESTIONS
            stateString += `}`; // end STATE
            stateArray.push(stateString);
        }
        let exportJson = `[` + stateArray.join(",") + `]`;
        console.warn("This feature converts executable code into strings. If this code is reused without proper checks, it may cause many errors. Please only use this if you know what you are doing!");
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
