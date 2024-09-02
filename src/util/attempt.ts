export class SuccessfulAttempt <T> {
    constructor (
        readonly value: T
    ) {}
}

export class FailedAttempt {
    constructor (
        readonly error: Error
    ) {}
}

export type Attempt <T> = SuccessfulAttempt<T> | FailedAttempt

/**
 * Attempt to perform the given action in a try..catch block.
 *
 * This can sometimes allow a nicer syntax without resorting to let variables.
 *
 * Example:
 *
 * ```TS
 * const result = attempt(() => JSON.parse(input))
 * if (result instanceof SuccessfulAttempt)
 *     result.value // string
 * else
 *     result.error // Error
 * ```
 */
export const attempt = <Value> (action: () => Value): Attempt<Value> => {
    try {
        return new SuccessfulAttempt(action())
    } catch (error) {
        return new FailedAttempt(
            error instanceof Error
                ? error
                : new Error(String(error))
        )
    }
}
