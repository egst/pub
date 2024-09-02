export class ValidationError extends Error {
    readonly name: string = 'ValidationError'
}

/**
 * Schema can be created for any type except for the ValidationError.
 */
export type ValidationType = Exclude<unknown, ValidationError>

type KeyType = string | number | symbol

/**
 * Schema is defined by a validation function that either returns the validated value or a validation error.
 * This allows leveraging the TypeScript's type checks instead relying on unchecked type guards.
 * That being said, some type checks are almost impossible to implement generically with strict type checks
 * so some of the validation methods implemented here use the `as` assertions instead.
 */
export type Validator <T extends ValidationType> = (value: unknown) => T | ValidationError

// TODO: KeyType
type GenericRecord   = Record<string, unknown>
type GenericFunction = (...args: never[]) => unknown

type SchemaTuple <Ts extends ValidationType[]> = [...{[k in keyof Ts]: Schema<Ts[k]>}]

/**
 * Infer the validated type of a schema.
 */
export type SchemaType <S extends Schema<unknown>> = S extends Schema<infer T> ? T : never

type SchemaObject <T extends GenericRecord> = GenericRecord & {[k in keyof T]: Schema<T[k]>}

const isObject = (value: unknown): value is GenericRecord | null => typeof value === 'object'

/**
 * Validation schema provides a way to describe data validation
 * in a declarative manner with the option to infer the resulting type.
 *
 * Instead of declaring a type and then manually specifying the validation
 * process imperatively, start by creating a schema:
 *
 * ```TS
 * const mySchema = Schema.object({
 *     a: Schema.boolean,
 *     b: Schema.string.or(Schema.null),
 *     c: Schema.or(Schema.literal('foo'), Schema.literal('bar')),
 *     d: Schema.object({
 *         x: Schema.nullable(Schema.number),
 *         y: Schema.optional(Schema.number),
 *         z: Schema.and(
 *             Schema.record(Schema.string, Schema.string),
 *             Schema.object({foo: Schema.literal('doo')})
 *         )
 *     }),
 *     e: Schema.array(Schema.number),
 *     f: Schema.array(Schema.object({foo: Schema.string})),
 *     g: Schema.tuple(
 *         Schema.boolean,
 *         Schema.number
 *     )
 * })
 * ```
 *
 * To use the corresponding type, you can simply infer it without defining it manually:
 *
 * ```TS
 * type MyType = SchemaType<typeof mySchema>
 * ```
 *
 * For validation, you can use the methods validate, assert, parse, and parseJson:
 *
 * ```TS
 * (x: undefined) => {
 *     if (mySchema.validate(x))
 *         x // MyType
 * }
 *
 * (x: undefined) => {
 *     Schema.assert(x) // Will throw if the validation fails.
 *     x // MyType
 * }
 *
 * (x: undefined) => {
 *     const result = mySchema.parse(x)
 *     if (result instanceof ValidationError)
 *         result.message // Why the validation failed.
 *     else
 *         result // MyType
 * }
 *
 * (x: string) => {
 *     const result = mySchema.parseJson(x) // Parses the JSON, then validates.
 *     if (result instanceof ValidationError)
 *         result.message // Why the validation failed.
 *     else
 *         result // MyType
 * }
 * ```
 *
 * Note: `mySchema.assert(x)` only works for schemas with explicitly defined validation type.
 * In most cases, you have to use `Schema.assert(mySchema, x)` instead.
 */
export class Schema <T extends ValidationType> {
    constructor (
        private readonly validator: Validator<T>
    ) {}

    /**
     * Returns true if the given value satisfies the validated type.
     */
    validate (value: unknown): value is T {
        return !(this.validator(value) instanceof ValidationError)
    }

    /**
     * Throws if the given value doesn't satisfy the validated type.
     *
     * Note that this method only works for schemas with explicitly specified validation type
     * which is almost never the case, so use the static assert method instead where this is not applicable.
     *
     */
    assert (value: unknown): asserts value is T {
        const result = this.validator(value)
        if (result instanceof ValidationError)
            throw result
    }

    /**
     * Throws if the given value doesn't satisfy the validated type.
     */
    static assert <T extends ValidationType> (schema: Schema<T>, value: unknown): asserts value is T {
        schema.assert(value)
    }

    /**
     * Returns the given value if it satisfies the validated type or a validation error otherwise.
     */
    parse (value: unknown): T | ValidationError {
        return this.validator(value)
    }

    /**
     * Parses the given JSON, then returns the given value if it satisfies the validated type
     * or a validation error otherwise.
     */
    parseJson (json: string): T | ValidationError {
        let parsed: unknown
        try {
            parsed = JSON.parse(json)
        } catch (error) {
            const message = error instanceof Error
                ? error.message
                : String(error)
            throw new ValidationError(`Invalid JSON. ${message}`)
        }
        return this.validator(parsed)
    }

    /**
     * Parses the given FormData, then returns an object if it satisfies the validated type or a validation error otherwise.
     */
    parseFormData (formData: FormData): T | ValidationError {
        const data: Record<string, string | string[]> = {}
        for (const [key, value] of formData.entries()) {
            if (typeof value !== 'string')
                continue
            if (data[key] === undefined)
                data[key] = value
            else {
                if (typeof data[key] === 'string')
                    data[key] = [data[key], value]
                else
                    data[key].push(value)
            }
        }
        return this.validator(data)
    }

    /**
     * Utility schema that performs no validation.
     */
    static unknown: Schema<unknown> = new Schema<unknown>((value: unknown): unknown => value)

    /**
     * Schema for the null type.
     */
    static null: Schema<null> =
        new Schema<null>(
            (value: unknown): null | ValidationError =>
                value === null
                    ? value
                    : new ValidationError(`Expected null. Got ${typeof value}.`)
        )

    /**
     * Schema for the undefined type.
     */
    static undefined: Schema<undefined> =
        new Schema<undefined>(
            (value: unknown): undefined | ValidationError =>
                value === undefined
                    ? value
                    : new ValidationError(`Expected undefined. Got ${typeof value}.`)
        )

    /**
     * Schema for the boolean type.
     */
    static boolean: Schema<boolean> =
        new Schema<boolean>(
            (value: unknown): boolean | ValidationError =>
                typeof value === 'boolean'
                    ? value
                    : new ValidationError(`Expected boolean. Got ${typeof value}.`)
        )

    /**
     * Schema for the true type.
     */
    static true: Schema<true> = Schema.literal(true)

    /**
     * Schema for the false type.
     */
    static false: Schema<false> = Schema.literal(false)

    /**
     * Schema for the number type.
     */
    static number: Schema<number> =
        new Schema<number>(
            (value: unknown): number | ValidationError =>
                typeof value === 'number'
                    ? value
                    : new ValidationError(`Expected number. Got ${typeof value}.`)
        )

    /**
     * Schema for the string type.
     */
    static string: Schema<string> =
        new Schema<string>(
            (value: unknown): string | ValidationError =>
                typeof value === 'string'
                    ? value
                    : new ValidationError(`Expected string. Got ${typeof value}.`)
        )

    /**
     * Schema for the bigint type.
     */
    static bigInt: Schema<bigint> =
        new Schema<bigint>(
            (value: unknown): bigint | ValidationError =>
                typeof value === 'bigint'
                    ? value
                    : new ValidationError(`Expected bigint. Got ${typeof value}.`)
        )

    /**
     * Schema for the symbol type.
     */
    static symbol: Schema<symbol> =
        new Schema<symbol>(
            (value: unknown): symbol | ValidationError =>
                typeof value === 'symbol'
                    ? value
                    : new ValidationError(`Expected symbol. Got ${typeof value}.`)
        )

    /**
     * Schema for the function type.
     *
     * The validated type is a function that returns an unknown type and accepts no valid arguments.
     * This makes sure that further type restrictions are necessary before the given function can
     * be called with specific arguments or its result can be used.
     */
    static function: Schema<GenericFunction> =
        new Schema<GenericFunction>(
            (value: unknown): GenericFunction | ValidationError =>
                typeof value === 'function'
                    // Note: Type Function is not assignable to GenericFunction even though
                    // there's no possible value of type Function that wouldn't satisfy GenericFunction.
                    ? value as GenericFunction
                    : new ValidationError(`Expected function. Got ${typeof value}.`)
        )

    /**
     * Schema for a literal boolean, number, or string type, e.g. true, 'foo', or 1.
     */
    static literal <T extends boolean | number | string> (literal: T): Schema<T> {
        return new Schema(
            (value: unknown): T | ValidationError => {
                if (value === literal)
                    return value as T
                if (typeof value === typeof literal)
                    return new ValidationError(`Expected ${String(literal)}. Got ${String(value)}.`)
                return new ValidationError(`Expected ${String(literal)}. Got ${typeof value}.`)
            }
        )
    }

    /**
     * Schema for a nullable type - `T | null`.
     */
    static nullable <T extends ValidationType> (schema: Schema<T>): Schema<T | null> {
        return schema.or(Schema.null)
    }

    /**
     * Schema for an optional type - `T | undefined`.
     */
    static optional <T extends ValidationType> (schema: Schema<T>): Schema<T | undefined> {
        return schema.or(Schema.undefined)
    }

    /**
     * Schema for a key of the given object or enum.
     */
    static keyOf <T extends GenericRecord> (enumeration: T): Schema<keyof T> {
        return new Schema(
            (value: unknown): keyof T | ValidationError => {
                if (typeof value !== 'string' && typeof value !== 'number')
                    return new ValidationError(`Expected key. Got ${typeof value}.`)
                if (!(value in enumeration))
                    return new ValidationError(
                        `Expected key ${Object.keys(enumeration).join(' | ')}. Got ${String(value)}.`
                    )
                // Note: I haven't been able to come up with a reasonable way to do this without the assertion.
                return value as keyof T
            }
        )
    }

    /**
     * Schema for an object type with explicitly specified properties or a generic record.
     */
    static object <T extends GenericRecord> (
        definition: SchemaObject<T> = {} as SchemaObject<T>
    ): Schema<T> {
        // Note: The native typeof check results in the object type which kinda sucks.
        // This guard makes the rest of the code more readable.
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

    /**
     * Schema for an object type with specified key and value types.
     */
    static record <K extends KeyType, T extends ValidationType> (
        keySchema: Schema<K>, valueSchema: Schema<T>
    ): Schema<Record<K, T>> {
        return new Schema(
            (value: unknown): Record<K, T> | ValidationError => {
                if (value === null)
                    return new ValidationError(`Expected object. Got null.`)
                if (!isObject(value))
                    return new ValidationError(`Expected object. Got ${typeof value}.`)
                for (const key in value) {
                    const keyResult = keySchema.parse(key)
                    if (keyResult instanceof ValidationError)
                        return new ValidationError(`Unexpected record key type. ${keyResult.message}`)
                    const valueResult = valueSchema.parse(value[key])
                    if (valueResult instanceof ValidationError)
                        return new ValidationError(`Unexpected record value type. ${valueResult.message}`)
                }
                // Note: I haven't been able to come up with a reasonable way to do this without the assertion.
                return value as Record<K, T>
            }
        )
    }

    /**
     * Schema for an array type with specified value type.
     */
    static array <T extends ValidationType> (
        valueSchema: Schema<T> = Schema.unknown as Schema<T>
    ): Schema<T[]> {
        return new Schema(
            (value: unknown): T[] | ValidationError => {
                if (!Array.isArray(value))
                    if (value !== null && typeof value === 'object')
                        return new ValidationError(`Expected array. Got non-array object.`)
                    else
                        return new ValidationError(`Expected array. Got ${typeof value}.`)
                for (const element of value) {
                    const result = valueSchema.parse(element)
                    if (result instanceof ValidationError)
                        return new ValidationError(`Unexpected array value type. ${result.message}`)
                }
                // Note: I haven't been able to come up with a reasonable way to do this without the assertion.
                return value as T[]
            }
        )
    }

    /**
     * Schema for an array type with specified value type.
     */
    static tuple <Ts extends ValidationType[]> (...valueSchemas: SchemaTuple<Ts>): Schema<Ts> {
        return new Schema(
            (value: unknown): Ts | ValidationError => {
                if (!Array.isArray(value))
                    if (value !== null && typeof value === 'object')
                        return new ValidationError(`Expected array. Got non-array object.`)
                    else
                        return new ValidationError(`Expected array. Got ${typeof value}.`)
                if (value.length !== valueSchemas.length)
                    return new ValidationError(
                        `Expected array with ${String(valueSchemas.length)} elements. Got ${String(value.length)}.`
                    )
                for (const key in valueSchemas) {
                    const result = valueSchemas[key].parse(value[key])
                    if (result instanceof ValidationError)
                        return new ValidationError(
                            `Unexpected array value type on the position ${key}. ${result.message}`
                        )
                }
                // Note: I haven't been able to come up with a reasonable way to do this without the assertion.
                return value as Ts
            }
        )
    }

    /**
     * Schema for a union of types.
     */
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

    /**
     * Schema for an intersection of types.
     */
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
                // Note: I haven't been able to come up with a reasonable way to do this without the assertion.
                return value as T & U
            }
        )
    }

    /**
     * Schema for a union of types.
     */
    or <U extends ValidationType> (schema: Schema<U>): Schema<T | U> {
        return Schema.or(this, schema)
    }

    /**
     * Schema for an intersection of types.
     */
    and <U extends ValidationType> (schema: Schema<U>): Schema<T & U> {
        return Schema.and(this, schema)
    }
}
