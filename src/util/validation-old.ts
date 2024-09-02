import * as type from 'util/type'

export class ValidationError extends Error {}

/**
 * Validation schema.
 *
 * Determines the validated type and provides the run-time validation check.
 */
export abstract class Schema <T> {
    abstract validate (value: unknown): value is T
    abstract assert   (value: unknown): asserts value is T
}

/**
 * Schema definition based on a function that performs the run-time validation check.
 *
 * Example:
 *
 * ```TS
 * const mySchemaValidator: SchemaValidator<string> =
 *     (value: unknown): value is string => typeof value === 'string'
 * ```
 */
export type SchemaValidator <T> = (value: unknown) => value is T

/**
 * Schema definition based on an object that describes the validated
 * object's properties with nested schema definitions.
 *
 * Example:
 *
 * ```TS
 * const mySchemaObject: SchemaObject = {
 *     foo: (value: unknown): value is string => typeof value === 'string',
 *     bar: myOtherSchema,
 *     baz: {
 *         boo: myOtherSchema,
 *     }
 * }
 * ```
 */
export type SchemaObject = {[x: type.RecordKey]: SchemaDefinition}

/**
 * Schema can be defined using a schema directly, a schema validator function or a schema object.
 */
export type SchemaDefinition = Schema<any> | SchemaValidator<any> | SchemaObject

/**
 * Get the resultig type of a schema.
 *
 * Example:
 *
 * ```TS
 * type MyType = SchemaType<typeof mySchema>
 * ```
 */
export type SchemaType <S extends Schema<any>> = S extends Schema<infer T> ? T : never

/**
 * Get the resulting type of a schema object definition.
 */
type SchemaObjectType <O extends SchemaObject> = {
    [K in keyof O]: SchemaDefinitionType<O[K]>
}

/**
 * Get the resulting type of a schema validator definition.
 */
type SchemaValidatorType <V> = V extends SchemaValidator<infer T> ? T : never;

/**
 * Get the resulting type of a schema definition.
 */
type SchemaDefinitionType <D extends SchemaDefinition> =
    D extends Schema<any>
        ? SchemaType<D> :
    D extends SchemaValidator<any>
        ? SchemaValidatorType<D> :
    D extends SchemaObject
        ? SchemaObjectType<D> : never

/**
 * Get the schema type of a schema definition.
 */
type DefinitionSchema <D extends SchemaDefinition> = Schema<SchemaDefinitionType<D>>

/**
 * Create a schema from a schema validator definition.
 */
const validatorSchema = <T> (schemaValidator: SchemaValidator<T>): Schema<T> =>
    new class extends Schema<T> {
        validate (value: unknown): value is T {
            return schemaValidator(value)
        }
        assert (value: unknown): asserts value is T {
            if (!schemaValidator(value))
                throw new ValidationError(`Unexpected value of type: ${typeof value}.`)
        }
    }

/**
 * Create a schema from a schema object definition.
 */
const objectSchema = <O extends SchemaObject> (schemaObject: O): Schema<SchemaObjectType<O>> =>
    new class extends Schema<SchemaObjectType<O>> {
        validate (value: unknown): value is SchemaObjectType<O> {
            if (!type.isObject(value))
                return false
            for (const [key, nestedSchemaDefinition] of Object.entries(schemaObject))
                if (!schema(nestedSchemaDefinition).validate(value[key]))
                    return false
            return true
        }
        assert (value: unknown): asserts value is SchemaObjectType<O> {
            if (!type.isObject(value))
                throw new ValidationError(`Unexpected value of type: ${typeof value}. Expected object.`)
            for (const [key, nestedSchemaDefinition] of Object.entries(schemaObject)) {
                try {
                    const x = value[key]
                    const a: (value: unknown) => asserts value is SchemaObjectType<O> = schema(nestedSchemaDefinition).assert
                    a(x)
                    //schema(nestedSchemaDefinition).assert(value[key])
                } catch (error) {
                    throw new ValidationError(`Unexpected value of type: ${typeof value}. Expected object.`)
                }
            }
        }
    }

/**
 * Create a schema from a schema definition.
 */
export const schema = <D extends SchemaDefinition> (
    definition: D
): DefinitionSchema<D> =>
    definition instanceof Schema
        ? definition :
    type.isObject(definition)
        ? objectSchema(definition)
        : validatorSchema(definition)
