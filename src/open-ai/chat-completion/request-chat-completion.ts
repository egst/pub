import {Schema} from 'util/validation'

import {config} from 'config/config'

import {ChatMessage} from 'open-ai/chat-completion/chat-message'

const responseSchema = Schema.object({
    choices: Schema.tuple(
        Schema.object({
            message: Schema.object({
                content: Schema.string
            })
        })
    )
})

export const requestChatCompletion = async (
    messages: ChatMessage[],
    options:  {format?: object},
): Promise<string> => {
    const response = await fetch(
        config.openAi.endpoints.chatCompletion,
        {
            method: 'POST',
            headers: {
                'Content-Type':  'application/json',
                'Authorization': `Bearer ${config.openAi.apiKey}`
            },
            body: JSON.stringify({
                model:           config.openAi.models.gpt4OLatest,
                messages:        messages,
                response_format: options.format,
            })
        }
    )

    const result: unknown = await response.json()

    Schema.assert(responseSchema, result)

    return result.choices[0].message.content
}
