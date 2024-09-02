export abstract class ChatMessage {
    constructor(
        public readonly role:    'system'|'user'|'assistant',
        public readonly content: string
    ) {}
}

export class SystemMessage extends ChatMessage {
    constructor (content: string) {
        super('system', content)
    }
}

export class UserMessage extends ChatMessage {
    constructor (content: string) {
        super('user', content)
    }
}

export class AssistantMessage extends ChatMessage {
    constructor (content: string) {
        super('assistant', content)
    }
}
