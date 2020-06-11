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
            if (this.answers.has(intent)) {
                this.answers.set(intent, [...this.answers.get(intent), ...answer]);
            } else {
                this.answers.set(intent, [...answer]);
            }
        } else {
            // add answer sent as parameter
            if (this.answers.has(intent)) {
                this.answers.set(intent, [...this.answers.get(intent), answer]);
            } else {
                this.answers.set(intent, [answer]);
            }
        }
    }
    
    addSuggestion(intent, suggestion) {
        if (suggestion instanceof Array) {
            // add each suggestion from array
            if (this.suggestions.has(intent)) {
                this.suggestions.set(intent, [...this.suggestions.get(intent), ...suggestion]);
            } else {
                this.suggestions.set(intent, [...suggestion]);
            }
        } else {
            // add suggestion sent as parameter
            if (this.suggestions.has(intent)) {
                this.suggestions.set(intent, [...this.suggestions.get(intent), suggestion]);
            } else {
                this.suggestions.set(intent, [suggestion]);
            }
        }
    }

    // ----- STATE HANDLER ----- //
    async handle(intent) {
        let response = {};
        response.intent = intent;
        
        // call action for intent with reference to state as parameter
        if (this.actions.has(intent)) {
            this.actions.get(intent)(this);
        }

        // get all answers for intent
        response.answers = [];
        if (this.answers.has(intent)) {
            response.answers = [...this.answers.get(intent)];
        }

        // get all suggestions for intent
        response.suggestions = [];
        if (this.suggestions.has(intent)) {
            response.suggestions = [...this.suggestions.get(intent)];
        }

        return response;
    }
}

module.exports = ChatbotState;
