import * as type from 'util/type'

export class ValidationError extends Error {}

type ValidationType = Exclude<unknown, ValidationError>

type Validator <T extends ValidationType> = (value: unknown) => T | ValidationError

type GenericRecord = Record<string, unknown>

// TODO: string | number | symbol keys
type SchemaObject <O extends GenericRecord> = {
    [key in keyof O]: Schema<O[key]>
}

class Schema <T extends ValidationType> {
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

    or <U extends ValidationType> (schema: Schema<U>): Schema<T | U> {
        return new Schema(
            (value: unknown): T | U | ValidationError =>
                this.validate(value) || schema.validate(value)
                    ? value
                    : new ValidationError // TODO
        )
    }

    and <U extends ValidationType> (schema: Schema<U>): Schema<T & U> {
        return new Schema(
            (value: unknown): (T & U) | ValidationError =>
                this.validate(value) && schema.validate(value)
                    ? value
                    : new ValidationError // TODO
        )
    }

    /*
    static string: Schema<string> =
        new Schema(
            (value: unknown): string | ValidationError =>
                typeof value === 'string'
                    ? value
                    : new ValidationError(`Expected string. Got ${typeof value}.`)
        )

    static number: Schema<number> =
        new Schema(
            (value: unknown): number | ValidationError =>
                typeof value === 'number'
                    ? value
                    : new ValidationError(`Expected number. Got ${typeof value}.`)
        )
   */

    static object <T extends GenericRecord> (
        definition: Partial<SchemaObject<T>> = {}
    ): Schema<T> {
        return new Schema(
            (value: unknown): T | ValidationError => {
                if (value === null)
                    return new ValidationError(`Expected object. Got null.`)
                if (typeof value !== 'object')
                    return new ValidationError(`Expected object. Got ${typeof value}.`)
                let result = {}
                for (const validator of Object.values(definition)) {
                    const v = definition[key].parse(1)
                    result = {
                    /*
                    if (key in value) {
                        const x = value[key]
                    }
                    if (!(key in value))
                        return new ValidationError(`Missing key ${key}.`)
                    */
                }
                //return value
            }
        )
    }
}

type Foo <T> = {
    [key in keyof T]: Schema<T[key]>
}

const foo: Foo<any> = {} // OK
const bar: Foo<object> = {} // OK

const f = <T> (foo: Partial<Foo<T>> = {}) => {} // Error: Type '{}' is not assignable to type 'Foo<T>'.
