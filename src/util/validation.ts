export class ValidationError extends Error {
    readonly name: string = 'ValidationError'
}

type ValidationType = Exclude<unknown, ValidationError>

type KeyType = string | number | symbol

type Validator <T extends ValidationType> = (value: unknown) => T | ValidationError

// TODO: string | number | symbol keys
type GenericRecord   = Record<string, unknown>
type GenericFunction = (...args: never[]) => unknown

export type SchemaType <S extends Schema<unknown>> = S extends Schema<infer T> ? T : never

type SchemaObject <T extends GenericRecord> = GenericRecord & {[k in keyof T]: Schema<T[k]>}

export class Schema <T extends ValidationType> {
    constructor (
        private readonly validator: Validator<T>
    ) {}

    parse (value: unknown): T | ValidationError {
        return this.validator(value)
    }

    validate (value: unknown): value is T {
        return !(this.validator(value) instanceof ValidationError)
    }

    assert (value: unknown): asserts value is T {
        const result = this.validator(value)
        if (result instanceof ValidationError)
            throw result
    }

    static null: Schema<null> =
        new Schema<null>(
            (value: unknown): null | ValidationError =>
                value === null
                    ? value
                    : new ValidationError(`Expected null. Got ${typeof value}.`)
        )

    static undefined: Schema<undefined> =
        new Schema<undefined>(
            (value: unknown): undefined | ValidationError =>
                value === undefined
                    ? value
                    : new ValidationError(`Expected undefined. Got ${typeof value}.`)
        )

    static boolean: Schema<boolean> =
        new Schema<boolean>(
            (value: unknown): boolean | ValidationError =>
                typeof value === 'boolean'
                    ? value
                    : new ValidationError(`Expected boolean. Got ${typeof value}.`)
        )

    static number: Schema<number> =
        new Schema<number>(
            (value: unknown): number | ValidationError =>
                typeof value === 'number'
                    ? value
                    : new ValidationError(`Expected number. Got ${typeof value}.`)
        )

    static string: Schema<string> =
        new Schema<string>(
            (value: unknown): string | ValidationError =>
                typeof value === 'string'
                    ? value
                    : new ValidationError(`Expected string. Got ${typeof value}.`)
        )

    static bigint: Schema<bigint> =
        new Schema<bigint>(
            (value: unknown): bigint | ValidationError =>
                typeof value === 'bigint'
                    ? value
                    : new ValidationError(`Expected bigint. Got ${typeof value}.`)
        )

    static symbol: Schema<symbol> =
        new Schema<symbol>(
            (value: unknown): symbol | ValidationError =>
                typeof value === 'symbol'
                    ? value
                    : new ValidationError(`Expected symbol. Got ${typeof value}.`)
        )

    static function: Schema<GenericFunction> =
        new Schema<GenericFunction>(
            (value: unknown): GenericFunction | ValidationError =>
                typeof value === 'function'
                    // Note: Type Function is not assignable to GenericFunction even though
                    // there's no possible value of type Function that wouldn't satisfy GenericFunction.
                    ? value as GenericFunction
                    : new ValidationError(`Expected function. Got ${typeof value}.`)
        )

    static object <T extends GenericRecord> (
        definition: SchemaObject<T> = {} as SchemaObject<T>
    ): Schema<T> {
        // Note: The native typeof check results in the object type which kinda sucks.
        // This guard makes the rest of the code more readable.
        const isObject = (value: unknown): value is GenericRecord | null => typeof value === 'string'
        return new Schema(
            (value: unknown): T | ValidationError => {
                if (value === null)
                    return new ValidationError(`Expected object. Got null.`)
                if (!isObject(value))
                    return new ValidationError(`Expected object. Got ${typeof value}.`)
                for (const key in definition) {
                    if (!(key in value))
                        return new ValidationError(`Missing object key: ${key}.`)
                    const propertyResult = definition[key]?.parse(value[key])
                    if (propertyResult instanceof ValidationError)
                        return new ValidationError(
                            `Wrong object property type for the key ${key}. ${propertyResult.message}`
                        )
                }
                // Note: I haven't been able to come up with a reasonable way to do this without the assertion.
                return value as T
            }
        )
    }

    static record <K extends KeyType, T extends ValidationType> (
        keySchema: Schema<K>, valueSchema: Schema<T>
    ): Schema<Record<K, T>> {
        return new Schema(
            (value: unknown): Record<K, T> | ValidationError => {
                for (const key in value) {
                    const keyResult = keySchema.parse(key)
                    if (key instanceof ValidationError)
                        return new ValidationError
                }
            }
        )
    }

    static or <T extends ValidationType, U extends ValidationType> (
        firstSchema: Schema<T>, secondSchema: Schema<U>
    ): Schema<T | U> {
        return new Schema(
            (value: unknown): T | U | ValidationError => {
                const firstResult  = firstSchema.parse(value)
                const secondResult = secondSchema.parse(value)
                if (firstResult instanceof ValidationError && secondResult instanceof ValidationError)
                    return new ValidationError(
                        `Value does not satisfy any of the following:\n${firstResult.message}\n${secondResult.message}`
                    )
                if (firstResult instanceof ValidationError)
                    return firstResult
                return secondResult
            }
        )
    }

    static and <T extends ValidationType, U extends ValidationType> (
        firstSchema: Schema<T>, secondSchema: Schema<U>
    ): Schema<T & U> {
        return new Schema(
            (value: unknown): (T & U) | ValidationError => {
                const firstResult  = firstSchema.parse(value)
                const secondResult = secondSchema.parse(value)
                if (firstResult instanceof ValidationError)
                    return firstResult
                if (secondResult instanceof ValidationError)
                    return secondResult
                return secondResult
            }
        )
    }

    or <U extends ValidationType> (schema: Schema<U>): Schema<T | U> {
        return Schema.or(this, schema)
    }

    and <U extends ValidationType> (schema: Schema<U>): Schema<T & U> {
        return Schema.and(this, schema)
    }
}

type Foo = 'foo'|'bar'
type X = {[k: `foo-${Foo}`]: number}

//const f = (x: Record<string, string> & {foo: number}) => {
const f = (x: {[x: string]: string} & {foo: number}) => {
    x.foo = 1
    x.bar = 2
}
