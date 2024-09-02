import * as dom from 'util/dom'

import {Module}          from 'modules/module'
import {ValidModule}     from 'modules/module'
import {InvalidModule}   from 'modules/module'
import {PendingModule}   from 'modules/module'
import {ModuleData}      from 'modules/module-data'
import {ModuleInterface} from 'modules/module-interface'
import {ModuleStorage}   from 'modules/module-storage'

import {ModuleGui} from 'modules/components/module-gui'

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
        this.modulesContainer = dom.createElement({
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
            module.init()
    }

    run (): void {
        for (const module of this.validModules)
            module.run()
    }

    activate (): void {
        this.init()
        this.run()
    }

    getOtherModuleInterfaces (name: string): ModuleInterface[] {
        return this.getOtherModules(name)
            .map(module => module.moduleData.moduleDefinition.moduleInterface)
    }

    getOtherModules (name: string): ValidModule[] {
        return this.validModules
            .filter(module => module.name !== name)
    }

    moduleExists (name: string): boolean {
        return this.modules.has(name)
    }

    addModule (
        moduleData: ModuleData,
        options:    ModuleChangeOptions = {cascade: true}
    ): Module {
        const name = moduleData.moduleDefinition.moduleInterface.name
        if (this.moduleExists(name))
            throw new Error(`Module ${name} already exists.`)
        this.moduleStorage.addModuleData(moduleData)
        const module = moduleData.toModule(this, this.createModuleContainer())
        this.modules.set(name, module)
        if (options.cascade)
            void this.recreateOtherBrokenModulesAndActivate(name)
        else if (module instanceof ValidModule)
            module.activate()
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
            module.activate()
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
        return dom.adjustElement(new ModuleGui, {
            parent: this.modulesContainer,
        })
    }

    loadGui (): void {
        // TODO
    }
}
