import * as util from 'util'
import * as dom  from 'util/dom'

import {ModuleImplementationWrapper} from 'modules/module-implementation'
import {ModuleData}                  from 'modules/module-data'
import {ValidModuleData}             from 'modules/module-data'
import {InvalidModuleData}           from 'modules/module-data'
import {ModuleGui}                   from 'modules/module-gui'
import {Application}                 from 'modules/application'

import {generateImplementation} from 'modules/generation/generate-implementation'

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

    get summary (): string {
        return '' // TODO
    }

    /**
     * @thows {Error} When a module with the given name already exists.
     */
    static async create (application: Application, moduleDefinition: ModuleDefinition): Module {
        if (application.moduleExists(moduleDefinition.moduleInterface.name))
            throw new Error
        const moduleData = await generateModule(
            moduleDefinition,
            application.getOtherModuleInterfaces(moduleDefinition.moduleInterface.name)
        )
        return application.addModule(moduleData)
    }

    delete ():  void {
        this.application.deleteModule(this)
    }

    rename (name: string): Module {
        const moduleData = this.moduleData.renamed(name)
        return this.application.updateModule(this.name, moduleData)
    }

    // TODO: Probably only startLoading will be needed.
    abstract startLoading (): void
    abstract stopLoading  (): void

    async recreate (options: ModuleChangeOptions = {cascade: true}): Promise<Module> {
        const moduleData = await generateModule(
            this.moduleData.moduleDefinition,
            this.application.getOtherModuleInterfaces(this.name)
        )
        return this.application.updateModule(this.name, moduleData, {cascade: options.cascade})
    }

    async change (moduleDefinition: ModuleDefinition): Module {
        const moduleData = await generateModule(
            moduleDefinition,
            this.application.getOtherModuleInterfaces(moduleDefinition.moduleInterface.name)
        )
        return this.application.updateModule(this.name, moduleData)
    }

    async adjust (adjustmentInstructions: string): Module {
        const moduleData = await adjustModule(
            this.moduleData,
            adjustmentInstructions,
            this.application.getOtherModuleInterfaces(moduleDefinition.moduleInterface.name)
        )
        return this.application.updateModule(this.name, moduleData)
    }

    protected createHeader (...contents: Element[]): HTMLElement {
        return dom.createElement({
            classes:  ['module-header'],
            children: contents
        })
    }

    protected createTitle (): HTMLElement {
        return dom.createElement({
            tag:     'span',
            text:    this.name,
            classes: ['module-title'],
        })
    }

    protected createDeleteButton (): HTMLElement {
        return dom.adjustElement(
            new util.BasicButton('Delete'),
            {
                classes: ['module-delete'],
                eventListeners: {
                    click: () => this.openDeleteDialog()
                }
            }
        )
    }

    openInfoDialog (): void {
        const dialog = new Dialog()
        dialog.classList.add('module-edit-dialog')

        dialog.append(
            dom.createElement({
                tag:  'h1',
                text: `Module ${this.name}`
            }),
            // TODO: Show the info.
            dom.createElement({
                children: [
                    dom.adjustElement(
                        new util.BasicButton('Cancel'),
                        {
                            eventListeners: {
                                click: () => {
                                    dialog.close()
                                }
                            }
                        }
                    )
                ]
            })
        )

        dialog.showModal()
    }

    openEditDialog (): void {
        const dialog = new util.Dialog()
        dialog.classList.add('module-edit-dialog')

        const title = new util.IconHeading(`Editing module ${this.name}`)
        const startLoading = () => {
            this.fixButton.setIcon('⏳')
        }
        const stopLoading = () => {
            this.fixButton.setIcon('')
        }

        dialog.append(
            title,
            // TODO: Form(s).
            dom.createElement({
                children: [
                    dom.adjustElement(
                        new BasicButton('Apply Changes'),
                        {
                            eventListeners: [
                                click: async () => {
                                    this.startLoading()
                                    try {
                                        this.change(new ModuleDefinition(
                                            // TODO: Get data from the form.
                                        ))
                                    } finally {
                                        this.stopLoading()
                                    }
                                }
                            ]
                        }
                    ),
                    dom.adjustElement(
                        new BasicButton('Apply Adjustments'),
                        {
                            eventListeners: [
                                click: () => {
                                    this.startLoading()
                                    try {
                                        this.adjust(
                                            // TODO: Get data from the form.
                                        )
                                    } finally {
                                        this.stopLoading()
                                    }
                                }
                            ]
                        }
                    ),
                    dom.adjustElement(
                        new BasicButton('Cancel'),
                        {
                            eventListeners: [
                                click: () => {
                                    dialog.close()
                                }
                            ]
                        }
                    )
                ]
            })
        )

        dialog.showModal()
    }

    openDeleteDialog (): void {
        const dialog = new Dialog()
        dialog.classList.add('module-delete-dialog')

        dialog.append(
            dom.createElement({
                text: text(`
                    Are you sure you want to delete the module ${this.name}?
                    This could invalidate other modules that depend on it.
                `)
            }),
            dom.createElement({
                children: [
                    dom.adjustElement(
                        new BasicButton('Yes'),
                        {
                            eventListeners: [
                                click: () => {
                                    this.delete()
                                    dialog.close()
                                }
                            ]
                        }
                    ),
                    dom.adjustElement(
                        new BasicButton('Cancel'),
                        {
                            eventListeners: [
                                click: () => {
                                    dialog.close()
                                }
                            ]
                        }
                    )
                ]
            })
        )

        dialog.showModal()
    }
}

/**
 * Invalid module with a list of errors that can be fixed automatically.
 */
export class InvalidModule extends Module<InvalidModuleData> {
    async fix (): Promise<Module> {
        /*
        const moduleDefinition  = getModuleDefinition(moduleName)
        const moduleDescription = getModuleDescription(moduleName)
        const result = await moduleCodeFix(
            this.#name,
            moduleDescription,
            moduleDefinition,
            errors,
            modules,
        )
        //handleResult(result)
        setModuleDefinition(moduleName, result.code)
        */
    }
}

/**
 * Invalid module that requires additional user input to be fixed.
 */
export class PendingModule extends Module<PendingModuleData> {
    async fix (input: string): Promise<Module> {
        /*
        const moduleDefinition  = getModuleDefinition(moduleName)
        const moduleDescription = getModuleDescription(moduleName)
        const result = await moduleCodeFix(
            this.#name,
            moduleDescription,
            moduleDefinition,
            errors,
            modules,
        )
        //handleResult(result)
        setModuleDefinition(moduleName, result.code)
        */
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
        this.moduleImplementation.init()
    }

    async run (): Promise<void> {
        await this.moduleImplementation.run()
    }

    /**
     * Summary of this module's interface - exposed values and events.
     */
    /* TODO
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
    */
}

export const modules: Module[] = []

export const loadModule = (name: string): Module =>
    getModuleData(name).toModule()

export const createModule = async (name: string, description: string): Promise<Module> => {
    const moduleData = createModuleDataFromResponse(
        name,
        description,
        await generateImplementation(name, description, modules)
    )
    moduleData.store()
    return moduleData.toModule()
}

localStorage
