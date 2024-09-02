import * as type from 'util/type'

import {schema, SchemaType} from 'util/validation'

import {ConfigError} from 'config/config-error'

const secretsSchema = schema({
    openAi: {
        apiKey: type.isString,
    }
})

export type Secrets = SchemaType<typeof secretsSchema>

/*
TODO: Validation error messages.
function validateSecrets (value: unknown): asserts value is Secrets {
    if (!type.isObject(value))
        throw new ConfigError('Missing secrets')
    if (!type.isObject(value.openAi))
        throw new ConfigError('Missing Open AI secrets')
    if (!type.isObject(value.openAi.apiKey))
        throw new ConfigError('Missing Open AI API key secret')
}
*/

const loadSecretsModule = async (): Promise<type.GenericRecord> => {
    try {
        return await import('config/secrets') as type.GenericRecord
    } catch (error) {
        throw new ConfigError(`Unable to load secrets: ${String(error)}`)
    }
}

export const loadSecrets = async (): Promise<Secrets> => {
    const secrets: unknown = (await loadSecretsModule()).secrets
    /*
    if (!secretsSchema.validate(secrets)) {
        throw new ConfigError('Invalid secrets.')
    }
    */
    secretsSchema.assert(secrets)
    return secrets
}
