import {Schema} from 'util/validation'

import {ModuleInterface} from 'modules/module-interface'

const moduleDefinitionSchema = Schema.object({
    moduleInterface: Schema.object(),
    description: Schema.string,
})

export class ModuleDefinition {
    constructor (
        readonly moduleInterface: ModuleInterface,
        readonly description:     string
    ) {}

    static createFromStoredObject (data: Record<string, unknown>): ModuleDefinition {
        Schema.assert(moduleDefinitionSchema, data)

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
