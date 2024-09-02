import * as util from 'util'

import {config} from 'config/config'

import {ChatMessage} from 'open-ai/chat-completion/chat-message'

export const requestChatCompletion = async (
    messages: ChatMessage[],
    options:  {format?: object},
): Promise<string> => {
    const response = await fetch(
        config.openAi.endpoints.chatCompletion,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.openAi.apiKey}`
            },
            body: JSON.stringify({
                model: config.openAi.models.gpt4OLatest,
                messages: messages,
                response_format: options.format,
            })
        }
    )

    const result: unknown = await response.json()

    if (
        !util.isObject(result)
        || !util.isArray(result.choices)
        || !util.isObject(result.choices[0])
        || !util.isObject(result.choices[0].message)
        || !util.isString(result.choices[0].message.content)
    )
        throw new Error(`Invalid chat completion response: ${JSON.stringify(result)}`)

    return result.choices[0].message.content
}
