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
        this.answers.set(intent, this.answers.get(intent).concat(answer));
        return isNew;
    }
    
    addSuggestion(intent, suggestion) {
        let isNew = false;
        if (!this.suggestions.has(intent)) {
            // no answers exist for given intent
            this.suggestions.set(intent, []);
            isNew = true;
        }
        this.suggestions.set(intent, this.suggestions.get(intent).concat(suggestion));
        return isNew;
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
