import * as util from 'util'

import {ModuleData}           from 'modules/module-data'
import {ValidModuleData}      from 'modules/module-data'
import {InvalidModuleData}    from 'modules/module-data'
import {PendingModuleData}    from 'modules/module-data'
import {ModuleDefinition}     from 'modules/module-definition'
import {ModuleImplementation, ModuleImplementationConstructorWrapper} from 'modules/module-implementation'

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

export abstract class GenerationResponse {
    abstract readonly status: Status

    abstract toOriginalResponse (): string

    abstract toModuleData (moduleDefinition: ModuleDefinition): ModuleData

    /**
     * Validate a generic object that represents a GenerationResponse without static type information.
     *
     * This is used to retrieve responses from local storage where all type information is lost.
     */
    static createResponseFromStoredObject (response: util.GenericRecord): GenerationResponse {
        if (!util.isString(response.status))
            throw new Error('Invalid response status.')

        if (response.status === 'invalid') {
            if (!util.isString(response.response))
                throw new Error('Invalid response.')

            if (!util.isArrayOfStrings(response.errors))
                throw new Error('Invalid response errors.')

            return new InvalidResponse(
                response.response,
                response.errors
            )
        } else if (response.status === 'error') {
            if (!util.isArrayOfStrings(response.comments))
                throw new Error('Invalid response comments.')

            return new PendingResponse(
                response.comments
            )
        } else if (util.isKey(response.status, ValidStatus)) {
            if (!util.isArrayOfStrings(response.comments))
                throw new Error('Invalid response errors.')

            if (!util.isString(response.code))
                throw new Error('Invalid response code.')

            return new ValidResponse(
                ValidStatus[response.status],
                response.comments,
                response.code
            )

        } else {
            throw new Error('Invalid response status.')
        }
    }

    /**
     * Parse and validate an LLM response.
     *
     * Validation errors do not throw any errors. Instead, InvalidResponse is returned
     * so that it can be further handled and possibly fixed as needed by the LLM.
     */
    static createResponseFromString (response: string): GenerationResponse {
        const parsed = util.attempt((): unknown => JSON.parse(response))

        if (parsed instanceof util.FailedAttempt) {
            return new InvalidResponse(response, [invalidResponseMessage(String(parsed.error))])
        }

        if (!util.isObject(parsed.value))
            return new InvalidResponse(response, [invalidResponseMessage()])

        if (parsed.value.status === undefined)
            return new InvalidResponse(response, [invalidResponseMessage('Missing status.')])

        parsed.value.comments ??= []
        if (!util.isArrayOfStrings(parsed.value.comments))
            return new InvalidResponse(response, [invalidResponseMessage('Invalid comments.')])

        if (util.isKey(parsed.value.status, ValidStatus)) {
            if (!util.isString(parsed.value.code))
                return new InvalidResponse(response, [invalidResponseMessage('Invalid code.')])

            return new ValidResponse(
                ValidStatus[parsed.value.status],
                parsed.value.comments,
                parsed.value.code,
            )
        } else if (parsed.value.status === 'error') {
            return new PendingResponse(
                parsed.value.comments,
            )
        } else {
            return new InvalidResponse(response, [invalidResponseMessage('Invalid status.')])
        }
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
    public readonly status = 'error' as const;

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
