const ChatbotState = require('./ChatbotState');

class Chatbot {
    // ----- CONSTRUCTOR ----- //
    constructor(intentExtractionFunction) {
        if (intentExtractionFunction == null) { // == matches null and undefined
            throw new Error(`Please define an intent extracting function for your chatbot.`);
        }
        if (typeof intentExtractionFunction !== 'function' && !(intentExtractionFunction instanceof Function)) {
            throw new Error(`Parameter given to chatbot is not a function.`);
        }
        this.extractIntent = intentExtractionFunction;
        this.allStates = new Map();
    }

    // ----- ALL STATES ----- //
    addState(state) {
        if (state == null) {
            throw new Error(`Please pass a ChatbotState as a parameter to addState(state).`);
        }
        if (state instanceof ChatbotState) {
            state.chatbot = this;   // add chatbot reference to state
            this.allStates.set(state.name, state);
            if (this.currentState == null) {
                // if no current state is set, set the new state as the current one
                this.currentState = state;
            }
            return true;
        } else {
            throw new Error(`Given parameter is not an instance of ChatbotState.`);
        }
    }
    getState(stateName) {
        return this.allStates.get(stateName);
    }

    // ----- CURRENT STATE ----- //
    setCurrentState(stateName) {
        if (this.allStates.has(stateName)) {
            this.currentState = this.allStates.get(stateName);
            return true;
        } else {
            throw new Error(`ChatbotState with given name (${stateName}) does not exist.`);
        }
    }

    // ----- IMPORT/EXPORT ----- //
    async importStates(exportedStatesString) {
        let arr = JSON.parse(exportedStatesString);
        for (let i = 0; i < arr.length; i++) {
            // for each state
            let state = new ChatbotState(arr[i].name);
            // read only answers, skip actions
            for (let answerObject of arr[i].answers) {
                state.addAnswer(answerObject.intent, answerObject.answers);
            }
            this.addState(state);
        }
    }

    async importStatesWithActions(exportedStatesString) {
        console.warn(`This feature converts strings from JSON format into executable code. If the source of this is not trusted, it might be harmful or cause many errors. Please only use this if you know what you are doing!`);
        let arr = JSON.parse(exportedStatesString);
        for (let i = 0; i < arr.length; i++) {
            // for each state
            let state = new ChatbotState(arr[i].name);
            // read actions & answers
            for (let actionObject of arr[i].actions) {
                let funcTemp = new Function(actionObject.paramName, actionObject.functionCode);
                state.addAction(actionObject.intent, funcTemp);
            }
            for (let answerObject of arr[i].answers) {
                state.addAnswer(answerObject.intent, answerObject.answers);
            }
            this.addState(state);
        }
    }

    async exportStates() {
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
            stateString += `],`;
            // end ANSWERS

            stateString += `}`;
            // end STATE
            stateArray.push(stateString);
        }
        return `[${stateArray.join(",")}]`;
    }
    
    async exportStatesWithActions() {
        console.warn("This feature converts executable code into strings. If this code is reused without proper checks, it may cause many errors. Please only use this if you know what you are doing!");
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
            stateString += `],`;
            // end ACTIONS

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
            stateString += `],`;
            // end ANSWERS

            stateString += `}`;
            // end STATE
            stateArray.push(stateString);
        }
        return `[${stateArray.join(",")}]`;
    }

    // ----- HANDLER ----- //
    async process(utterance) {
        // async always returns result wrapped in Promise
        if (this.currentState == null) {
            throw new Error("No state has been selected.");
        }
        let nlpResult = await this.extractIntent(utterance);
        let answers = await this.currentState.handle(nlpResult.intent);
        return {
            utterance: utterance,
            intent: nlpResult.intent,
            score: nlpResult.score,
            answers: answers,
        };
    }
}

module.exports = Chatbot;
