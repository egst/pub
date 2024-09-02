import {Schema} from 'util/validation'

const moduleInterfaceSchema = Schema.object({
    name:   Schema.string,
    values: Schema.array(Schema.string),
    events: Schema.array(Schema.string)
})

/**
 * Module's interface that is visible to the other modules.
 *
 * Modules can access other modules by their name and retrieve their exposed values and listen to their events.
 */
export class ModuleInterface {
    constructor (
        readonly name:   string,
        readonly values: string[],
        readonly events: string[]
    ) {}

    static createFromStoredObject (data: Record<string, unknown>): ModuleInterface {
        Schema.assert(moduleInterfaceSchema, data)

        return new ModuleInterface(
            data.name,
            data.values,
            data.events,
        )
    }

    renamed (name: string): ModuleInterface {
        return new ModuleInterface(
            name,
            this.values,
            this.events,
        )
    }
}
