import {requestChatCompletion} from 'open-ai/chat-completion/request-chat-completion'
import {ChatMessage}           from 'open-ai/chat-completion/chat-message'
import {SystemMessage}         from 'open-ai/chat-completion/chat-message'
import {UserMessage}           from 'open-ai/chat-completion/chat-message'

import {Module} from 'modules/module'

import * as formats               from 'modules/generation/formats'
import * as instructions          from 'modules/generation/instructions'
import {GenerationResponse}       from 'modules/generation/response'
import {createResponseFromString} from 'modules/generation/response'

export const completionInput = (
    name:        string,
    description: string,
    modules:     Module[],
):  ChatMessage[] => [
    new SystemMessage(instructions.codeGenerationFormat),
    new SystemMessage(instructions.codeGeneration),
    ...instructions.moduleExamples.map(example => new SystemMessage(example)),
    new SystemMessage(instructions.otherModules(modules.filter(module => module.name != name))),
    new UserMessage(description),
]

export const generateImplementation = async (
    name:        string,
    description: string,
    modules:     Module[],
):  Promise<GenerationResponse> =>
    createResponseFromString(await requestChatCompletion(
        completionInput(name, description, modules),
        {format: formats.code}
    ))
