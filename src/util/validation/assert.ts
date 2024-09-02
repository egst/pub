import {Schema}         from 'util/validation'
import {ValidationType} from 'util/validation'

const assert = <T extends ValidationType> (schema: Schema<T>) =>
    (value: unknown): asserts value is T => {
        schema.assert(value)
    }

export const isBoolean = assert(Schema.boolean)

export const isNumber = assert(Schema.number)

export const isBigInt = assert(Schema.bigInt)

export const isString = assert(Schema.string)

export const isSymbol = assert(Schema.symbol)

export const isFunction = assert(Schema.function)

export const isArray = assert(Schema.array())

export const isObject = assert(Schema.object())
