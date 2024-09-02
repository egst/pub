import {SchemaObject}     from 'util/validation'
import {SchemaObjectType} from 'util/validation'

/**
 * Any object key.
 */
export type RecordKey = string | number | symbol

/**
 * Generic object of unknown values.
 */
export type GenericRecord = Record<RecordKey, unknown>

/**
 * Check if the given value is an array.
 */
export const isArray = (value: unknown): value is unknown[] =>
    Array.isArray(value)

/**
 * Check if the given value is a boolean.
 */
export const isBoolean = (value: unknown): value is boolean =>
    typeof value === 'boolean'

/**
 * Check if the given value is a number.
 */
export const isNumber = (value: unknown): value is number =>
    typeof value === 'number'

/**
 * Check if the given value is a string.
 */
export const isString = (value: unknown): value is string =>
    typeof value === 'string'

/**
 * Check if the given value is an object.
 */
export const isObject = (value: unknown): value is GenericRecord =>
    typeof value === 'object' && value !== null

/**
 * Check if the given value is a symbol.
 */
export const isSymbol = (value: unknown): value is symbol =>
    typeof value === 'symbol'

/**
 * Check if the given value is an array of booleans.
 */
export const isArrayOfBooleans = (value: unknown): value is boolean[] =>
    isArray(value) && value.every(isBoolean)

/**
 * Check if the given value is an array of numbers.
 */
export const isArrayOfNumbers = (value: unknown): value is number[] =>
    isArray(value) && value.every(isNumber)

/**
 * Check if the given value is an array of strings.
 */
export const isArrayOfStrings = (value: unknown): value is string[] =>
    isArray(value) && value.every(isString)

/**
 * Check if the given value is an array of arrays.
 */
export const isArrayOfArrays = (value: unknown): value is unknown[][] =>
    isArray(value) && value.every(isArray)

/**
 * Check if the given value is an array of objects.
 */
export const isArrayOfObjects = (value: unknown): value is GenericRecord[] =>
    isArray(value) && value.every(isObject)

/**
 * Check if the given value is an object of booleans.
 */
export const isObjectOfBooleans = (value: unknown): value is Record<RecordKey, boolean> =>
    isObject(value) && Object.values(value).every(isBoolean)

/**
 * Check if the given value is an object of numbers.
 */
export const isObjectOfNumbers = (value: unknown): value is Record<RecordKey, number> =>
    isObject(value) && Object.values(value).every(isNumber)

/**
 * Check if the given value is an object of strings.
 */
export const isObjectOfStrings = (value: unknown): value is Record<RecordKey, string> =>
    isObject(value) && Object.values(value).every(isString)

/**
 * Check if the given value is an object of arrays.
 */
export const isObjectOfArrays = (value: unknown): value is Record<RecordKey, unknown[]> =>
    isObject(value) && Object.values(value).every(isArray)

/**
 * Check if the given value is an object of objects.
 */
export const isObjectOfObjects = (value: unknown): value is Record<RecordKey, GenericRecord> =>
    isObject(value) && Object.values(value).every(isObject)

/**
 * Any function with no information on how it can be called.
 */
type UnspecifiedFunction = (...args: never[]) => unknown

/**
 * Check if the given value is a function.
 */
export const isFunction = (value: unknown): value is UnspecifiedFunction =>
    typeof value === 'function'

/**
 * Any constructor with no information on how it can be called.
 */
type UnspecifiedConstructor <T> = abstract new (...args: never[]) => T

/**
 * Check if the given value is an object.
 */
export const isInstanceOf = <T> (value: unknown, Constructor: UnspecifiedConstructor<T>): value is T =>
    value instanceof Constructor
// TODO: This method is potentially unsafe. `isInstanceOf(value, Foo<T>)` will work with any T.
// Note: Just doing `value instanceof Foo` will result in `Foo<any>` which is also technically unsafe,
// but a strict setup of eslint should warn about any use of any. TODO: Verify this.
