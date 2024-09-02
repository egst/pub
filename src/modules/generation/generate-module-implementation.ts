import {ValidModule} from 'modules/module'

import * as formats         from 'modules/generation/formats'
import * as instructions    from 'modules/generation/instructions'
import {GenerationResponse} from 'modules/generation/generation-response'

import {ChatMessage}           from 'open-ai/chat-completion/chat-message'
import {SystemMessage}         from 'open-ai/chat-completion/chat-message'
import {UserMessage}           from 'open-ai/chat-completion/chat-message'
import {requestChatCompletion} from 'open-ai/chat-completion/request-chat-completion'

export const completionInput = (
    name:        string,
    description: string,
    modules:     ValidModule[],
): ChatMessage[] => [
    new SystemMessage(instructions.codeGenerationFormat),
    new SystemMessage(instructions.codeGeneration),
    ...instructions.moduleExamples.map(example => new SystemMessage(example)),
    new SystemMessage(instructions.otherModules(modules.filter(module => module.name != name))),
    new UserMessage(description),
]

export const generateModuleImplementation = async (
    name:        string,
    description: string,
    modules:     ValidModule[],
): Promise<GenerationResponse> =>
    GenerationResponse.createFromString(await requestChatCompletion(
        completionInput(name, description, modules),
        {format: formats.moduleGeneration}
    ))
