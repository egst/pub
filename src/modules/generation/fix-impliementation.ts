import {requestChatCompletion} from 'open-ai/chat-completion/request-chat-completion'
import {SystemMessage}         from 'open-ai/chat-completion/chat-message'
import {UserMessage}           from 'open-ai/chat-completion/chat-message'
import {AssistantMessage}      from 'open-ai/chat-completion/chat-message'

import {Module} from 'modules/module'

import * as formats               from 'modules/generation/formats'
import * as instructions          from 'modules/generation/instructions'
import {completionInput}          from 'modules/generation/generate-implementation'
import {GenerationResponse}       from 'modules/generation/response'
import {CodeResponse}             from 'modules/generation/response'
import {createResponseFromString} from 'modules/generation/response'

export const fixImplementation = async (
    name:        string,
    description: string,
    response:    CodeResponse,
    errors:      Error[],
    modules:     Module[],
):  Promise<GenerationResponse> =>
    createResponseFromString(await requestChatCompletion({
        messages: [
            ...completionInput(name, description, modules),
            new AssistantMessage(response.toString()),
            new SystemMessage(instructions.codeFix),
            new UserMessage('Errors: \n\n' + errors.map(error => String(error)).join('\n\n')),
        ],
        format: formats.code
    }))
