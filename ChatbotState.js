class ChatbotState {
    // ----- CONSTRUCTOR ----- //
    constructor(name) {
        this.name = name;
        this.actions = new Map();
        this.answers = new Map();
        this.suggestions = new Map();
    }

    // ----- ADD FUNCTIONS ----- //
    addAction(intent, action) {
        this.actions.set(intent, action);
    }
    addAnswer(intent, answer) {
        if (answer instanceof Array) {
            // add each answer from array
            if (!this.answers.has(intent)) {
                let emptyArray = [];
                this.answers.set(intent, emptyArray);
            }
            let answerArray = this.answers.get(intent); // only one get() call
            for (let answ of answer) {
                answerArray.push(answ);
            }
        } else {
            // add answer sent as parameter
            if (!this.answers.has(intent)) {
                let emptyArray = [];
                this.answers.set(intent, emptyArray);
            }
            this.answers.get(intent).push(answer);
        }
    }
    addSuggestion(intent, suggestion) {
        if (suggestion instanceof Array) {
            // add each suggestion from array
            if (!this.suggestions.has(intent)) {
                let emptyArray = [];
                this.suggestions.set(intent, emptyArray);
            }
            let suggestionArray = this.answers.get(intent); // only one get() call
            for (let sugg of suggestion) {
                suggestionArray.push(sugg);
            }
        } else {
            // add suggestion sent as parameter
            if (!this.suggestions.has(intent)) {
                let emptyArray = [];
                this.suggestions.set(intent, emptyArray);
            }
            this.suggestions.get(intent).push(suggestion);
        }
    }

    // ----- STATE HANDLER ----- //
    handle(intent) {
        let response = {};
        response.intent = intent;
        
        // call action for intent with reference to state as parameter
        if (this.actions.has(intent)) {
            this.actions.get(intent)(this);
        }

        // get all answers for intent
        response.answers = [];
        if (this.answers.has(intent)) {
            let answerArray = this.answers.get(intent); // only one get() call
            for (let i = 0; i < answerArray.length; i++) {
                response.answers.push(answerArray[i]);
            }
        }

        // get all suggestions for intent
        response.suggestions = [];
        if (this.suggestions.has(intent)) {
            let suggestionArray = this.suggestions.get(intent); // only one get() call
            for (let i = 0; i < suggestionArray.length; i++) {
                response.suggestions.push(suggestionArray[i]);
            }
        }

        return response;
    }
}

module.exports = ChatbotState;
