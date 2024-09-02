import * as util from 'util/util'

import {Application}                 from 'modules/application'
import {ModuleData}                  from 'modules/module-data'
import {ValidModuleData}             from 'modules/module-data'
import {InvalidModuleData}           from 'modules/module-data'
import {PendingModuleData}           from 'modules/module-data'
import {ModuleDefinition}            from 'modules/module-definition'
import {ModuleImplementationWrapper} from 'modules/module-implementation'

import {ModuleGui} from 'modules/components/module-gui'

import {adjustModuleImplementation}   from 'modules/generation/adjust-module-implementation'
import {fixModuleImplementation}      from 'modules/generation/fix-module-implementation'
import {generateModuleImplementation} from 'modules/generation/generate-module-implementation'

interface ModuleChangeOptions {
    cascade?: boolean
}

export abstract class Module <Data extends ModuleData = ModuleData> {
    constructor (
        readonly application: Application,
        readonly moduleData:  Data,
        readonly gui:         ModuleGui
    ) {}

    get name (): string {
        return this.moduleData.moduleDefinition.moduleInterface.name
    }

    get description (): string {
        return this.moduleData.moduleDefinition.description
    }

    get values (): string[] {
        return this.moduleData.moduleDefinition.moduleInterface.values
    }

    get events (): string[] {
        return this.moduleData.moduleDefinition.moduleInterface.events
    }

    /**
     * @thows {Error} When a module with the given name already exists.
     */
    static async create (application: Application, moduleDefinition: ModuleDefinition): Promise<Module> {
        // TODO: cascade - this could fix some modules.
        const name = moduleDefinition.moduleInterface.name
        if (application.moduleExists(name))
            throw new Error
        const response = await generateModuleImplementation(
            name,
            moduleDefinition.description,
            application.getOtherModules(name)
        )
        const moduleData = response.toModuleData(moduleDefinition)
        return application.addModule(moduleData)
    }

    delete ():  void {
        this.application.deleteModule(this)
    }

    rename (name: string): Module {
        const moduleData = this.moduleData.renamed(name)
        return this.application.updateModule(this.name, moduleData)
    }

    async recreate (options: ModuleChangeOptions = {cascade: true}): Promise<Module> {
        const moduleDefinition = this.moduleData.moduleDefinition
        const response = await generateModuleImplementation(
            this.name,
            moduleDefinition.description,
            this.application.getOtherModules(this.name)
        )
        const moduleData = response.toModuleData(moduleDefinition)
        return this.application.updateModule(this.name, moduleData, {cascade: options.cascade})
    }

    async change (moduleDefinition: ModuleDefinition): Promise<Module> {
        const response = await generateModuleImplementation(
            this.name,
            moduleDefinition.description,
            this.application.getOtherModules(moduleDefinition.moduleInterface.name)
        )
        const moduleData = response.toModuleData(moduleDefinition)
        return this.application.updateModule(this.name, moduleData)
    }
}

/**
 * Invalid module with a list of errors that can be fixed automatically.
 */
export class InvalidModule extends Module<InvalidModuleData> {
    async fix (): Promise<Module> {
        const moduleDefinition = this.moduleData.moduleDefinition
        const response = await fixModuleImplementation(
            moduleDefinition.moduleInterface.name,
            moduleDefinition.description,
            this.moduleData.response,
            this.application.getOtherModules(moduleDefinition.moduleInterface.name)
        )
        const moduleData = response.toModuleData(moduleDefinition)
        return this.application.updateModule(this.name, moduleData)
    }
}

/**
 * Invalid module that requires additional user input to be fixed.
 */
export class PendingModule extends Module<PendingModuleData> {
    async fix (moduleDefinition: ModuleDefinition): Promise<Module> {
        return this.change(moduleDefinition)
    }
}

/**
 * Valid module that can be initialized and run.
 */
export class ValidModule extends Module<ValidModuleData> {
    constructor (
        application:                   Application,
        moduleData:                    ValidModuleData,
        gui:                           ModuleGui,
        readonly moduleImplementation: ModuleImplementationWrapper
    ) {
        super(application, moduleData, gui)
    }

    init (): void {
        this.moduleImplementation.init(error => {
            this.application.updateModule(this.name, this.moduleData.invalidate([
                'Run-time error in the init method.',
                String(error),
            ]))
        })
    }

    run (): void {
        this.moduleImplementation.run(
            this.application.validModules,
            error => {
                this.application.updateModule(this.name, this.moduleData.invalidate([
                    'Run-time error in the run method.',
                    String(error),
                ]))
            }
        )
    }

    activate (): void {
        this.init()
        this.run()
    }

    /**
     * Summary of this module's interface - exposed values and events.
     */
    get summary (): string {
        const values = this.values.map(value => `* ${value}`).join('\n')
        const events = this.events.map(event => `* ${event}`).join('\n')
        return util.text(`
            ${this.name}:
                exposed values:
                    ${values}
                exposed events:
                    ${events}
        `)
    }

    async adjust (adjustmentInstructions: string): Promise<Module> {
        const moduleDefinition = this.moduleData.moduleDefinition
        const response = await adjustModuleImplementation(
            this.moduleData.moduleDefinition.moduleInterface.name,
            moduleDefinition.description,
            adjustmentInstructions,
            this.moduleData.response,
            this.application.getOtherModules(moduleDefinition.moduleInterface.name)
        )
        const moduleData = response.toModuleData(moduleDefinition)
        return this.application.updateModule(this.name, moduleData)
    }
}
