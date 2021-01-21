class ChatbotState {
    // ----- CONSTRUCTOR ----- //
    constructor(name) {
        this.name = name;
        this.actions = new Map();
        this.answers = new Map();
    }

    // ----- ADD FUNCTIONS ----- //
    addAction(intent, action) {
        let isNew = !this.actions.has(intent);
        this.actions.set(intent, action);
        return isNew;
    }

    addAnswer(intent, answer) {
        let isNew = false;
        if (!this.answers.has(intent)) {
            // no answers exist for given intent
            this.answers.set(intent, []);
            isNew = true;
        }
        this.answers.get(intent).push(answer);
        return isNew;
    }

    // ----- STATE HANDLER ----- //
    async process(intent) {
        // call action for intent with reference to state as parameter
        if (this.actions.has(intent)) {
            this.actions.get(intent)(this);
        }

        // get all answers for intent
        let intentAnswers = [];
        if (this.answers.has(intent)) {
            intentAnswers = [...this.answers.get(intent)]; // shallow copy of array
        }

        return intentAnswers;
    }
}

module.exports = ChatbotState;
