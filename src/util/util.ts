/**
 * Multi-line text literal.
 * Indentation up to the start of the first line is removed.
 * Trailing whitespace is removed.
 *
 * Example:
 *
 * ```TS
 *   text(`
 *     lorem ipsum
 *       dolor sit
 *     amet adipiscing
 *   `)
 * ```
 *
 * The above will result in:
 *
 * ```TS
 * 'lorem ipsum\n  dolor sit\namet adipiscing'
 * ```
 */
export const text = (str: string) => {
    const lines = str.split('\n')
    if (lines[1] === undefined)
        return str
    const indent = /^\s*/.exec(lines[1])?.[0].length
    return lines.map(line => line.slice(indent)).join('\n').trim()
}

/**
 * Map over an object's values.
 *
 * The keys are kept the same and always considered to be strings.
 * Symbol keys are ignored.
 *
 * Example:
 *
 * ```TS
 * objectMap({foo: 2}, value => value * 2)
 * ```
 *
 * The above will result in:
 *
 * ```TS
 * {foo: 4}
 * ```
 */
export const objectMap = <Value, Key extends string, MappedValue> (
    value: Record<Key, Value>,
    transformation: (value: Value) => MappedValue
):  Record<Key, MappedValue> =>
    objectKeyMap(value, (key, value) => [key, transformation(value)])

/**
 * Map over an object's values and keys.
 *
 * The keys are always considered to be strings.
 * Symbol keys are ignored.
 *
 * Example:
 *
 * ```TS
 * objectMap({foo: 2}, (key, value) => ['_' + key, value * 2])
 * ```
 *
 * The above will result in:
 *
 * ```TS
 * {_foo: 4}
 * ```
 */
export const objectKeyMap = <Value, Key extends string, MappedKey extends Key, MappedValue> (
    value: Record<Key, Value>,
    transformation: (key: Key, value: Value) => [MappedKey, MappedValue]
):  Record<MappedKey, MappedValue> =>
    Object.fromEntries(
        Object.entries(value).map(([key, value]) => transformation(key as Key, value as Value))
    ) as Record<MappedKey, MappedValue>

/**
 * Filter based on object's values.
 *
 * The keys are kept the same and always considered to be strings.
 * Symbol keys are ignored.
 *
 * Example:
 *
 * ```TS
 * objectFilter({foo: 1, bar: 2}, value => value % 2 === 0)
 * ```
 *
 * The above will result in:
 *
 * ```TS
 * {bar: 2}
 * ```
 */
export const objectFilter = <Value, Key extends string, FilteredValue extends Value> (
    value: Record<Key, Value>,
    predicate: (value: Value) => value is FilteredValue
):  Record<Key, FilteredValue> =>
    objectKeyFilter(value, (_, value) => predicate(value))

/**
 * Filter based on object's keys and values.
 *
 * The keys are always considered to be strings.
 * Symbol keys are ignored.
 *
 * Example:
 *
 * ```TS
 * objectFilter({foo: 1, bar: 2, _baz: 4}, (key, value) => value % 2 === 0 && !key.startsWith('_'))
 * ```
 *
 * The above will result in:
 *
 * ```TS
 * {bar: 2}
 * ```
 */
export const objectKeyFilter = <Value, Key extends string, FilteredKey extends Key, FilteredValue extends Value> (
    value: Record<Key, Value>,
    predicate: (key: string, value: Value) => value is FilteredValue
):  Record<FilteredKey, FilteredValue> =>
    Object.fromEntries(
        Object.entries(value).filter(([key, value]) => predicate(key, value as Value))
    ) as Record<string, FilteredValue>
