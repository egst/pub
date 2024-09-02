import {Schema}          from 'util/validation'
import {ValidationError} from 'util/validation'

import {InvalidModuleData} from 'modules/module-data'
import {ModuleData}        from 'modules/module-data'
import {PendingModuleData} from 'modules/module-data'
import {ValidModuleData}   from 'modules/module-data'
import {ModuleDefinition}  from 'modules/module-definition'

export enum ValidStatus {
    success = 'success',
    info    = 'info',
    warning = 'warning'
}

type Status = ValidStatus | 'error' | 'invalid'

const invalidResponseMessage = (message?: string): string =>
    [
        'Invalid JSON response.',
        message,
        `Expected: {status: 'success'|'info'|'warning'|'error', comments?: string[], code?: string}`,
    ].filter(message => message !== undefined).join(' ')

const validResponseSchema = Schema.object({
    status:   Schema.keyOf(ValidStatus),
    comments: Schema.array(Schema.string),
    code:     Schema.string
})

const invalidResponseSchema = Schema.object({
    status:   Schema.literal('invalid'),
    response: Schema.string,
    errors:   Schema.array(Schema.string)
})

const errorResponseSchema = Schema.object({
    status:   Schema.literal('error'),
    comments: Schema.array(Schema.string)
})

const responseSchema =
    validResponseSchema
        .or(invalidResponseSchema)
        .or(errorResponseSchema)

export abstract class GenerationResponse {
    abstract readonly status: Status

    abstract toOriginalResponse (): string

    abstract toModuleData (moduleDefinition: ModuleDefinition): ModuleData

    /**
     * Validate a generic object that represents a GenerationResponse without static type information.
     *
     * This is used to retrieve responses from local storage where all type information is lost.
     */
    static createResponseFromStoredObject (response: Record<string, unknown>): GenerationResponse {
        Schema.assert(responseSchema, response)

        if (response.status === 'invalid') {
            return new InvalidResponse(
                response.response,
                response.errors
            )
        }

        if (response.status === 'error') {
            return new PendingResponse(
                response.comments
            )
        }

        return new ValidResponse(
            ValidStatus[response.status],
            response.comments,
            response.code
        )
    }

    /**
     * Parse and validate an LLM response.
     *
     * Validation errors do not throw any errors. Instead, InvalidResponse is returned
     * so that it can be further handled and possibly fixed as needed by the LLM.
     */
    static createFromString (response: string): GenerationResponse {
        const parsed = responseSchema.parseJson(response)
        //const parsed = util.attempt((): unknown => JSON.parse(response))

        if (parsed instanceof ValidationError) {
            return new InvalidResponse(response, [invalidResponseMessage(parsed.message)])
        }

        if (parsed.status === 'invalid') {
            return new InvalidResponse(
                parsed.response,
                parsed.errors
            )
        }

        if (parsed.status === 'error') {
            return new PendingResponse(
                parsed.comments
            )
        }

        return new ValidResponse(
            ValidStatus[parsed.status],
            parsed.comments,
            parsed.code
        )
    }
}

/**
 * Response from an LLM containing a generated piece of code.
 */
export class ValidResponse extends GenerationResponse {
    /**
     * @param comments Additional comments for the generated code.
     */
    constructor (
        readonly status:   ValidStatus,
        readonly comments: string[],
        readonly code:     string
    ) {
        super()
    }

    toOriginalResponse (): string {
        // TODO: Filter out description if null.
        return JSON.stringify(this)
    }

    toModuleData (moduleDefinition: ModuleDefinition): ValidModuleData {
        return new ValidModuleData(moduleDefinition, this)
    }

    invalidate (errors: string[]): InvalidResponse {
        return new InvalidResponse(
            JSON.stringify(this),
            errors
        )
    }
}

/**
 * Response from an LLM that is invalid or leads to an invalid module implementation.
 * The included errors can be used to regenerate the response with no further user input.
 */
export class InvalidResponse extends GenerationResponse {
    readonly status = 'invalid' as const

    /**
     * @param response The original response that was determined to be invalid.
     * @param errors   Errors that were caused by the invalid response.
     */
    constructor (
        public readonly response: string,
        public readonly errors:   string[],
    ) {
        super()
    }

    toOriginalResponse (): string {
        return this.response
    }

    toModuleData (moduleDefinition: ModuleDefinition): InvalidModuleData {
        return new InvalidModuleData(moduleDefinition, this)
    }
}

/**
 * Response from an LLM that didn't generate any code.
 * Reasons why it wasn't generated are explained in the comments.
 * Fix requires user's input.
 */
export class PendingResponse extends GenerationResponse {
    public readonly status = 'error' as const

    /**
     * @param comments Comments explaning why the model was unable to generate any code.
     */
    constructor (
        public readonly comments: string[]
    ) {
        super()
    }

    toOriginalResponse (): string {
        return JSON.stringify(this)
    }

    toModuleData (moduleDefinition: ModuleDefinition): PendingModuleData {
        return new PendingModuleData(moduleDefinition, this)
    }
}
