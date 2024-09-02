import * as util from 'util'

import {ModuleInterface} from 'modules/module-interface';

export class ModuleDefinition {
    constructor (
        readonly moduleInterface: ModuleInterface,
        readonly description:     string
    ) {}

    static createFromStoredObject (data: util.GenericRecord): ModuleDefinition {
        if (!util.isObject(data.moduleInterface))
            throw new Error('Invalid module values.')
        if (!util.isString(data.description))
            throw new Error('Invalid module description.')

        return new ModuleDefinition(
            ModuleInterface.createFromStoredObject(data.moduleInterface),
            data.description,
        )
    }

    renamed (name: string): ModuleDefinition {
        return new ModuleDefinition(
            this.moduleInterface.renamed(name),
            this.description
        )
    }
}
