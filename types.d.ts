export declare class ChatbotState {
    constructor(name: string);
    name: string;
    actions: Map<string, (chatbotState: ChatbotState) => void>;
    answers: Map<string, any>;
    chatbot: Chatbot;
    addAction(intent: string, action: (chatbotState: ChatbotState) => void): boolean;
    addAnswer(intent: string, answer: any): boolean;
    process(intent: string): Promise<any[]>;
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
    currentState: ChatbotState;
    addState(state: ChatbotState): boolean;
    getState(stateName: string): ChatbotState;
    setCurrentState(stateName: string): boolean;
    importStates(exportedStatesString: string): Promise<void>;
    importStatesWithActions(exportedStatesString: string): Promise<void>;
    exportStates(): Promise<string>;
    exportStatesWithActions(): Promise<string>;
    process(utterance: string): Promise<chatbotProcessResult>;
}
