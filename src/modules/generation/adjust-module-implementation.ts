import {ValidModule} from 'modules/module'

import * as formats         from 'modules/generation/formats'
import * as instructions    from 'modules/generation/instructions'
import {completionInput}    from 'modules/generation/generate-module-implementation'
import {GenerationResponse} from 'modules/generation/generation-response'
import {ValidResponse}      from 'modules/generation/generation-response'

import {AssistantMessage}      from 'open-ai/chat-completion/chat-message'
import {ChatMessage}           from 'open-ai/chat-completion/chat-message'
import {SystemMessage}         from 'open-ai/chat-completion/chat-message'
import {UserMessage}           from 'open-ai/chat-completion/chat-message'
import {requestChatCompletion} from 'open-ai/chat-completion/request-chat-completion'

export const adjustmentInput = (
    name:        string,
    description: string,
    adjustment:  string,
    modules:     ValidModule[],
    response:    ValidResponse,
): ChatMessage[] => [
    ...completionInput(name, description, modules),
    new AssistantMessage(response.toOriginalResponse()),
    new SystemMessage(instructions.codeAdjustment),
    ...instructions.moduleAdjustmentExamples.map(example => new SystemMessage(example)),
    new UserMessage(adjustment),
]

export const adjustModuleImplementation = async (
    name:        string,
    description: string,
    adjustment:  string,
    response:    ValidResponse,
    modules:     ValidModule[],
): Promise<GenerationResponse> =>
    GenerationResponse.createFromString(await requestChatCompletion(
        adjustmentInput(name, description, adjustment, modules, response),
        {format: formats.moduleAdjustment}
    ))
