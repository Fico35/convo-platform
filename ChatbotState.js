class ChatbotState {
    // ----- CONSTRUCTOR ----- //
    constructor(name) {
        this.name = name;
        this.actions = new Map();
        this.answers = new Map();
    }

    // ----- ADD FUNCTIONS ----- //
    addAction(intent, action) {
        this.actions.set(intent, action);
    }
    addAnswer(intent, answer) {
        if (answer instanceof Array) {
            // add each answer from array
            // add answer sent as parameter
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

    // ----- STATE HANDLER ----- //
    handle(intent) {
        let response = {};
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

        return response;
    }
}

module.exports = ChatbotState;
