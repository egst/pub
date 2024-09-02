import {ValidModule} from 'modules/module'

import * as formats         from 'modules/generation/formats'
import * as instructions    from 'modules/generation/instructions'
import {completionInput}    from 'modules/generation/generate-module-implementation'
import {GenerationResponse} from 'modules/generation/generation-response'
import {InvalidResponse}    from 'modules/generation/generation-response'

import {AssistantMessage}      from 'open-ai/chat-completion/chat-message'
import {ChatMessage}           from 'open-ai/chat-completion/chat-message'
import {SystemMessage}         from 'open-ai/chat-completion/chat-message'
import {UserMessage}           from 'open-ai/chat-completion/chat-message'
import {requestChatCompletion} from 'open-ai/chat-completion/request-chat-completion'

export const fixInput = (
    name:        string,
    description: string,
    modules:     ValidModule[],
    response:    InvalidResponse,
): ChatMessage[] => [
    ...completionInput(name, description, modules),
    new AssistantMessage(response.toOriginalResponse()),
    new SystemMessage(instructions.codeFix),
    new UserMessage('Errors: \n\n' + response.errors.join('\n\n')),
]

export const fixModuleImplementation = async (
    name:        string,
    description: string,
    response:    InvalidResponse,
    modules:     ValidModule[],
): Promise<GenerationResponse> =>
    GenerationResponse.createFromString(await requestChatCompletion(
        fixInput(name, description, modules, response),
        {format: formats.moduleGeneration}
    ))
