import * as util from 'util'

export class ModuleInterface {
    constructor (
        readonly name:   string,
        readonly values: string[],
        readonly events: string[]
    ) {}

    static createFromStoredObject (data: util.GenericRecord): ModuleInterface {
        if (!util.isString(data.name))
            throw new Error('Invalid module name.')
        if (!util.isArrayOfStrings(data.values))
            throw new Error('Invalid module values.')
        if (!util.isArrayOfStrings(data.events))
            throw new Error('Invalid module events.')

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
