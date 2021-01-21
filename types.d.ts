export declare class ChatbotState {
    constructor(name: string);
    name: string;
    actions: Map<string, (chatbotState: ChatbotState) => void>;
    answers: Map<string, any>;
    chatbot: Chatbot;
    addAction(intent: string, action: (chatbotState: ChatbotState) => void): boolean;
    addAnswer(intent: string, answer: any): boolean;
    async process(intent: string): Promise<any[]>;
}

export type nlpResult = {
    utterance: string,
    intent: string,
    score: Number,
};

export type chatbotProcessResult = {
    utterance: string,
    intent: string,
    score: Number,
    answers: any[],
}

export declare class Chatbot {
    constructor(intentExtractionFunction: (utterance: string) => Promise<nlpResult>);
    extractIntent(utterance: string): Promise<nlpResult>;
    allStates: Map<string, ChatbotState>;
    addState(state: ChatbotState): boolean;
    getState(stateName: string): ChatbotState;
    setCurrentState(stateName: string): boolean;
    async importStates(exportedStatesString: string): Promise<void>;
    async importStatesWithActions(exportedStatesString: string): Promise<void>;
    async exportStates(): Promise<string>;
    async exportStatesWithActions(): Promise<string>;
    async process(utterance: string): Promise<chatbotProcessResult>;
}
