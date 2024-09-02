import {SchemaType} from 'util/validation'
import {Schema}     from 'util/validation'

import {ConfigError} from 'config/config-error'

const secretsSchema = Schema.object({
    openAi: Schema.object({
        apiKey: Schema.string,
    })
})

export type Secrets = SchemaType<typeof secretsSchema>

const loadSecretsModule = async (): Promise<Record<string, unknown>> => {
    try {
        return await import('config/secrets')
    } catch (error) {
        throw new ConfigError(`Unable to load secrets: ${String(error)}`)
    }
}

export const loadSecrets = async (): Promise<Secrets> => {
    const secrets: unknown = (await loadSecretsModule()).secrets
    Schema.assert(secretsSchema, secrets)
    return secrets
}
