import * as util from 'util'

import {Module}          from 'modules/module'
import {ValidModule}     from 'modules/module'
import {InvalidModule}   from 'modules/module'
import {PendingModule}   from 'modules/module'
import {ModuleStorage}   from 'modules/module-storage'
import {ModuleGui}       from 'modules/module-gui'
import {ModuleData}      from 'modules/module-data'
import {ModuleInterface} from 'modules/module-interface'

interface ModuleChangeOptions {
    cascade?: boolean
}

export class Application {
    modules: Map<string, Module> = new Map<string, Module>
    readonly modulesContainer: HTMLElement

    constructor (
        readonly moduleStorage: ModuleStorage,
        readonly rootContainer: HTMLElement
    ) {
        this.modulesContainer = util.createElement({
            parent: this.rootContainer
        })
    }

    get validModules (): ValidModule[] {
        return [...this.modules.values()]
            .filter(module => module instanceof ValidModule)
    }

    load (): void {
        this.modules.clear()
        const allModuleData = this.moduleStorage.getAllModuleData()
        this.clearModulesContainer()
        for (const moduleData of allModuleData) {
            const module = moduleData.toModule(this, this.createModuleContainer())
            this.modules.set(module.name, module)
        }
    }

    init (): void {
        for (const module of this.validModules)
            this.initModule(module)
    }

    run (): void {
        for (const module of this.validModules)
            this.runModule(module)
    }

    activate (): void {
        this.init()
        this.run()
    }

    getOtherModuleInterfaces (name: string): ModuleInterface[] {
        // TODO: Avoid fetching the filtered module completely.
        // TODO: Could this be taken from this.modules directly?
        return this.moduleStorage
            .getAllModuleData()
            .filter(moduleData => moduleData.moduleDefinition.moduleInterface.name !== name)
            .map(moduleData => moduleData.moduleDefinition.moduleInterface)
    }

    getOtherModules (name: string): Module[] {
        return [...this.modules.values()]
            .filter(module => module.name !== name)
    }

    moduleExists (name: string): boolean {
        // TODO: Instead check if it exists in this.modules?
        return this.moduleStorage.moduleDataExists(name)
    }

    addModule (
        moduleData: ModuleData,
        options:    ModuleChangeOptions = {cascade: true}
    ): Module {
        this.moduleStorage.addModuleData(moduleData)
        const module = moduleData.toModule(this, this.createModuleContainer())
        this.modules.set(module.name, module)
        if (options.cascade)
            void this.recreateOtherBrokenModulesAndActivate(module.name)
        else if (module instanceof ValidModule)
            this.activateModule(module)
        return module
    }

    updateModule (
        name:       string,
        moduleData: ModuleData,
        options:    ModuleChangeOptions = {cascade: true}
    ): Module {
        const oldModule = this.modules.get(name)
        if (oldModule === undefined)
            throw new Error(`Module ${name} doesn't exist.`)
        this.moduleStorage.updateModuleData(name, moduleData)
        const module = moduleData.toModule(this, oldModule.gui)
        this.modules.delete(name)
        this.modules.set(module.name, module)
        if (options.cascade)
            void this.recreateOtherModulesAndActivate(module.name)
        else if (module instanceof ValidModule)
            this.activateModule(module)
        return module
    }

    deleteModule (
        module:  Module,
        options: ModuleChangeOptions = {cascade: true}
    ): void {
        module.gui.remove()
        this.moduleStorage.deleteModuleData(module.name)
        this.modules.delete(module.name)
        if (options.cascade)
            void this.recreateOtherModulesAndActivate(module.name)
    }

    // TODO: What about async module name changes?
    // TODO: Build module dependency and reload dependant modules only.
    // TODO: What about cycles?

    private initModule (module: ValidModule): void {
        module.moduleImplementation.init(error => {
            this.updateModule(module.name, module.moduleData.invalidate([
                'Run-time error in the init method.',
                String(error),
            ]))
        })
    }

    private runModule (module: ValidModule): void {
        module.moduleImplementation.run(error => {
            this.updateModule(module.name, module.moduleData.invalidate([
                'Run-time error in the run method.',
                String(error),
            ]))
        })
    }

    private activateModule (module: ValidModule): void {
        this.initModule(module)
        this.runModule(module)
    }

    private async recreateOtherModulesAndActivate (name: string): Promise<void> {
        await Promise.all(
            this.getOtherModules(name)
                .map(module => module.recreate({cascade: false}))
        )
        this.activate()
    }

    private async recreateOtherBrokenModulesAndActivate (name: string): Promise<void> {
        await Promise.all(
            this.getOtherModules(name)
                .filter(module => module instanceof InvalidModule || module instanceof PendingModule)
                .map(module => module.recreate({cascade: false}))
        )
        this.activate()
    }

    private clearModulesContainer (): void {
        this.modulesContainer.replaceChildren()
    }

    private createModuleContainer (): ModuleGui {
        return util.adjustElement(new ModuleGui, {
            parent: this.modulesContainer,
        })
    }

    loadGui (): void {
        // TODO
    }
}
