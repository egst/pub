import {loadSecrets} from 'config/secrets-module'

const secrets = await loadSecrets()

interface Config {
    openAi: {
        apiKey: string,
        endpoints: {
            chatCompletion: string
        },
        models: {
            [model: string]: string
        }
    },
    modules: {
        maxFixAttempts: number,
    },
    gui: {
        materialIcons: {
            iconType: 'outlined' | 'rounded'
        }
    }
}

export const config: Config = {
    openAi: {
        apiKey: secrets.openAi.apiKey,
        endpoints: {
            chatCompletion: 'https://api.openai.com/v1/chat/completions',
        },
        models: {
            gpt4O: 'gpt-4o',
            gpt4OLatest: 'gpt-4o-2024-08-06',
            gpt35Turbo: 'gpt-3.5-turbo',
        }
    },
    modules: {
        maxFixAttempts: 2,
    },
    gui: {
        materialIcons: {
            iconType: 'outlined',
        }
    }
}
