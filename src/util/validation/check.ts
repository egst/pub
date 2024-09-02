import {Schema}         from 'util/validation'
import {ValidationType} from 'util/validation'

const check = <T extends ValidationType> (schema: Schema<T>) =>
    (value: unknown): value is T => schema.validate(value)

export const isBoolean = check(Schema.boolean)

export const isNumber = check(Schema.number)

export const isBigInt = check(Schema.bigInt)

export const isString = check(Schema.string)

export const isSymbol = check(Schema.symbol)

export const isFunction = check(Schema.function)

export const isArray = check(Schema.array())

export const isObject = check(Schema.object())
