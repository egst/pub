TODO: Function that take `errors: string[]` should instead take `...errors: string[]`.

## Generation Response

```TS
abstract class GenerationResponse {
    readonly status: 'success'|'info'|'wraning'|'error'|'invalid'

    abstract toOriginalResponse (): string

    abstract toModuleData (moduleDefinition: ModuleDefinition): ModuleData

    createFromString (response: string): GenerationResponse {}
}

// Valid response with code.
class ValidResponse extends GenerationResponse {
    constructor (
        readonly status:      'success'|'info'|'wraning',
        readonly comments:    string[],
        readonly description: string|null,
        readonly code:        string
    ) {}

    toOriginalResponse (): string {
        // TODO: Filter out description if null.
        return JSON.stringify(this)
    }

    toModuleData (moduleDefinition: ModuleDefinition): ValidModuleData {
        return new ValidModuleData(moduleDefinition, this)
    }

    toModuleImplementation (): Constructor<ModuleImplementation> {
        const Implementation: unknown = eval(`(${this.code})`)
        if (!isSubclass(Implementation, ModuleImplementation)) {
            throw new Error
        }

        return Implementation
    }

    invalidate (errors: string[]): InvalidResponse {
        return new InvalidResponse(
            JSON.stringify(this),
            errors
        )
    }
}

// Error(s) found when processing LLM response.
// Fix can be performed with no further user input.
class InvalidResponse extends GenerationResponse {
    readonly status: 'invalid'

    constructor (
        readonly response: string,
        readonly errors:   string[]
    ) {}

    toOriginalResponse (): string {
        return this.response
    }

    toModuleData (moduleDefinition: ModuleDefinition): InvalidModuleData {
        return new InvalidModuleData(moduleDefinition, this)
    }
}

// LLM describes error(s).
// Fix requires user's input.
class PendingResponse extends GenerationResponse {
    readonly status: 'error'

    constructor (
        readonly comments: string[]
    ) {}

    toOriginalResponse (): string {
        return this.response
    }

    toModuleData (moduleDefinition: ModuleDefinition): PendingModuleData {
        return new PendingModuleData(moduleDefinition, this)
    }
}
```

## Module Data

```TS
// Described by the user.
class ModuleInterface {
    name:   string
    values: string[]
    events: string[]

    renamed (name: string): ModuleInterface {
        return new ModuleInterface(
            name,
            this.values,
            this.events,
        )
    }
}

class ModuleDefinition {
    moduleInterface: ModuleInterface
    description:     string

    renamed (name: string): ModuleInterface {
        return new ModuleDefinition(
            this.moduleInterface.renamed(name),
            this.description
        )
    }
}

class ModuleData <Response extends GenerationResponse = GenerationResponse> {
    moduleDefinition: ModuleDefinition
    response:         Response

    abstract toModule (gui: ModuleGui): Module<ModuleData<Response>>

    abstract renamed (name: string): ModuleData<Response>
}

class ValidModuleData extends ModuleData<ValidResponse> {
    toModule (gui: ModuleGui): Module {
        const Implementation = attempt(() => this.response.toModuleImplementation())

        if (Implementation instanceof FailedAttempt)
            return this.response
                .invalidate([Implementation.error])
                .toModuleData(this.moduleDefinition)
                .toModule(gui)

        const implementation = attemp(() => new Implementation.value(gui.moduleImplementationGui))

        if (implementation instanceof FailedAttempt)
            return this.response
                .invalidate(['Failed to construct.', implementation.error]) // TODO: Better error message.
                .toModuleData(this.moduleDefinition)
                .toModule(gui)

        return new ValidModule(
            this,
            implementation.value
        )
    }

    invalidate (errors: string[]): InvalidModuleData {
        return new InvalidModuleData(
            this.moduleDefinition,
            this.response.invalidate(errors)
        )
    }
}

class InvalidModuleData extends ModuleData<InvalidResponse> {
    toModule (gui: ModuleGui): InvalidModule {
        return new InvalidModule(this, gui)
    }
}

class PendingModuleData extends ModuleData<PendingResponse> {
    toModule (gui: ModuleGui): PendingModule {
        return new PendingModule(this, gui)
    }
}
```

## Module Implementation

```TS
export type EventHandler = () => void
export type Getter       = () => unknown

class ModuleImplementation {
    _gui:           HTMLElement
    _eventHandlers: Record<string, EventHandler[]> = {}
    _getters:       Record<string, Getter>         = {}
    _components:    Record<string, Element>        = {}

    constructor (gui: HTMLElement) {
        this._gui  = gui
        this._gui.replaceChildren()
    }

    init (): void {}
    async run (): void {}
    get (name: string): unknown
    addEventListener (event: string, handler: EventHandler): void {}
    _setGetter (name: string, getter: Getter): void {}
    _registerEvent (event: string): void {}
    _dispatchEvent (event: string): void {}
}
```

## Module Storage

```TS
class ModuleStorage {
    constructor (
        readonly storage: Storage
    ) {}

    // TODO: Store history. (later)

    deleteAllModuleData (): void {}
    getAllModuleData (): ModuleData {}
    getModuleData (name: string): ModuleData {}
    getModuleData (name: string): void {}
    addModuleData (moduleData: ModuleData): void {}
    // TODO: updateModuleData can rename the module.
    updateModuleData (name: string, moduleData: ModuleData): void {}
    deleteModuleData (name: string): void {}
    moduleDataExists (name: string): bool {}
}
```

## Module GUI

```TS
class ModuleGui extends HTMLElement {
    readonly moduleImplementationGui: HTMLElement

    constructor () {
        super()
        this.classList.add('module-gui')
        this.moduleImplementationGui = createElement({
            classes: ['module-implementation-gui']
        })
        this.append(this.moduleImplementationGui)
    }

    appendAbove (...elements: Element[]): void {
        for (const element of elements) {
            this.insertBefore(element, this.moduleImplementationGui)
        }
    }

    appendBelow (...elements: Element[]): void {
        this.append(...elements)
    }
}
```

## Application

```TS
class Application {
    modules: Record<string, Module> = []

    constructor (
        readonly moduleStorage: ModuleStorage
    ) {}

    get validModules (): Record<string, ValidModule> {
        return objectFilter(
            this.modules
            module => module instanceof ValidModule
        )
    }

    load (): void {
        this.modules = []
        const allModuleData = this.moduleStorage.getAllModuleData()
        const container // TODO: Create or clear the container element.
        for (const moduleData of allModuleData) {
            const gui // TODO: Create and append a module GUI element.
            const module = moduleData.toModule(gui)
            this.modules[module.name] = module
        }
    }

    init (): void {
        for (const module of this.validModules) {
            try {
                module.init()
            } catch (error) {
                this.updateModule(module.name, module.moduleData.invalidate([
                    'Run-time error in the init method.',
                    error,
                ]))
            }
        }
    }

    run (): void {
        const runAsync = async (module: Module) => {
            try {
                await module.run()
            } catch (error) {
                this.updateModule(module.name, module.moduleData.invalidate([
                    'Run-time error in the run method.',
                    error,
                ]))
            }
        }
        for (const module of this.validModules) {
            runAsync(module)
        }
    }

    getOtherModuleInterfaces (name: string): ModuleInterface[] {
        // TODO: Avoid fetching the filtered module completely.
        // TODO: Could this be taken from this.modules directly?
        return this
            .getAllModuleData()
            .filter(moduleData => moduleData.moduleDefinition.moduleInterface.name !== name)
            .map(moduleData => moduleData.moduleDefinition.moduleInterface)
    }

    getOtherModules (name: string): Module[] {
        return Object
            .values(this.modules)
            .filter(module => module.name !== name)
    }

    moduleExists (name: string): bool {
        // TODO: Instead check is it exists in this.modules?
        return this.moduleStorage.moduleDataExists(name)
    }

    addModule (moduleData: ModuleData, {cascade: boolean = true}): Module {
        this.moduleStorage.addModuleData(moduleData)
        const gui // TODO: Create and insert a module GUI element.
        const module = moduleData.toModule(gui)
        this.modules[module.name] = module
        if (cascade)
            this.recreateOtherBrokenModules(module.name)
        return module
    }

    updateModule (name: string, moduleData: ModuleData, {cascade: boolean = true}): Module {
        this.moduleStorage.updateModuleData(name, moduleData)
        const module = modduleData.toModule(this.modules[name].gui)
        delete this.modules[name]
        this.modules[module.name] = module
        if (cascade)
            this.recreateOtherModules(module.name)
        return module
    }

    deleteModule (module: Module, {cascade: boolean = true}): void {
        module.gui // TODO: Remove the element.
        this.moduleStorage.deleteModuleData(module.name)
        delete this.modules[name]
        if (cascade)
            this.recreateOtherModules(module.name)
    }

    // TODO: What about async module name changes?

    // TODO: Build module dependency and reload dependant modules only.
    // TODO: What about cycles?

    private recreateOtherModules (name: string): void {
        for (const module of this.getOtherModules(name))
            module.recreate({cascade: false})
    }

    private recreateOtherBrokenModules (name: string): void {
        for (const module of this.getOtherModules(name))
            if (module instanceof InvalidModule || module instanceof PendingModule)
                module.recreate({cascade: false})
    }

    loadGui (): void {
        // TODO
    }
}
```

## Module Generation

```TS
const generateModule = async (
    moduleDefinition:      ModuleDefinition,
    otherModuleInterfaces: ModuleInterface[]
): ModuleData => {
    // TODO: requestModuleGeneration
    const module = GenerationResponse
        .createFromString(
            await requestModuleGeneration(
                moduleDefinition,
                application.getOtherModuleInterfaces(moduleDefinition.moduleInterface.name)
            )
        )
        .toModuleData(moduleDefinition)
}

const adjustModule = async (
    moduleData:             ModuleData,
    adjustmentInstructions: string,
    otherModuleInterfaces:  ModuleInterface[]
): ModuleData => {
    // TODO: requestModuleAdjustment
    const module = GenerationResponse
        .createFromString(
            await requestModuleAdjustment(
                moduleData.moduleDefinition,
                otherModuleInterfaces,
                moduleData.response.toOriginalResponse(),
                adjustmentInstructions,
            )
        )
        .toModuleData(moduleDefinition)
}

const fixModule = async (
    moduleData:            InvalidModuleData,
    otherModuleInterfaces: ModuleInterface[]
): ModuleData => {
    // TODO: requestModuleFix
    const module = GenerationResponse
        .createFromString(
            await requestModuleFix(
                moduleData.moduleDefinition,
                otherModuleInterfaces,
                moduleData.response.toOriginalResponse(),
                moduleData.response.errors,
            )
        )
        .toModuleData(moduleDefinition)
}
```

## Module

```TS
type ModuleParameters = [Data, ModuleGui, Application]

class Module <Data extends ModuleData = ModuleData> {
    constructor (
        readonly moduleData:  Data,
        readonly gui:         ModuleGui,
        readonly application: Application
    ) {}

    get name        (): string   { return this.moduleData.moduleInterface.name }
    get description (): string   { return this.moduleData.description }
    get values      (): string[] { return this.moduleData.moduleInterface.values }
    get events      (): string[] { return this.moduleData.moduleInterface.events }
    get summary     (): string   { /* TODO */ }

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

    async recreate (): Module {
        const moduleData = await generateModule(
            this.moduleDefinition,
            this.application.getOtherModuleInterfaces(moduleDefinition.moduleInterface.name)
        )
        return this.application.updateModule(this.name, moduleData)
    }

    // TODO: On update, recreate all other modules (they could have been broken).
    // TODO: On create, recreate all other broken (pending, and maybe invalid) modules (they could have been fixed).

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

    protected createHeader (...contents: Element): HTMLElement {
        return createElement({
            classes:  ['module-header'],
            children: contents
        })
    }

    protected createTitle (): HTMLElement {
        return createElement({
            tag:     'span',
            text:    this.name,
            classes: ['module-title'],
        })
    }

    protected createDeleteButton (): HTMLElement {
        return adjustElement(
            new BasicButton('Delete'),
            {
                classes: ['module-delete']
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
            createElement({
                tag:  'h1',
                text: `Module ${this.name}`
            }),
            // TODO: Show the info.
            createElement({
                children: [
                    adjustElement(
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

    openEditDialog (): void {
        const dialog = new Dialog()
        dialog.classList.add('module-edit-dialog')

        const title = new IconHeading(`Editing module ${this.name}`)
        const startLoading = () => {
            this.fixButton.setIcon('⏳')
        }
        const stopLoading = () => {
            this.fixButton.setIcon('')
        }

        dialog.append(
            title,
            // TODO: Form(s).
            createElement({
                children: [
                    adjustElement(
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
                    adjustElement(
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
                    adjustElement(
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
            createElement({
                text: text(`
                    Are you sure you want to delete the module ${this.name}?
                    This could invalidate other modules that depend on it.
                `)
            }),
            createElement({
                children: [
                    adjustElement(
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
                    adjustElement(
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

class InvalidModule extends ModuleData<InvalidModuleData> {
    readonly fixButton: IconButton

    constructor (...args: ModuleParameters) {
        super(...args)
        this.fixButton = this.createFixButton()
        this.createGui()
    }

    async fix (): Module {
        const module = await fixModule(
            this.moduleData,
            this.application.getOtherModuleInterfaces(moduleDefinition.moduleInterface.name)
        )
        return this.application.updateModule(this.name, module)
    }

    private createFixButton (): IconButton {
        return adjustElement(
            new IconButton('Fix', '⚠️'),
            {
                classes: ['module-fix'],
                eventListeners: {
                    click: () => this.performFix()
                }
            }
        )
    }

    private createGui () {
        this.gui.appendAbove(
            this.createHeader(
                this.createTitle(),
                this.fixButton,
                this.createDeleteButton(),
            )
        )
    }

    private performFix (): void {
        this.fixButton.setIcon('⏳')
        this.fix()
    }
}

class PendingModule extends ModuleData<PendingModuleData> {
    constructor (...args: ModuleParameters) {
        super(...args)
        this.createGui()
    }

    private createGui () {
        this.gui.appendAbove(
            this.createHeader(
                this.createTitle(),
                new IconButto adjustElement(
                    ('Edit', '⚠️'),
                    {
                        classes: ['module-edit'],
                        eventListeners: {
                            click: () => this.openEditDialog()
                        }
                    }
                )
                this.createDeleteButton(),
            )
        )
    }
}

class ValidModule extends ModuleData<ValidModuleData> {
    constructor (
        ...args: ModuleParameters,
        readonly moduleImplementation: ModuleImplementation
    ) {
        super(...args)
        this.createGui()
    }

    get code (): string { return this.moduleData.response.code }

    init (): void {
        this.moduleImplementation.init()
    }

    async run (): void {
        await this.moduleImplementation.run()
    }

    private createGui () {
        this.gui.appendAbove(
            this.createHeader(
                this.createTitle(),
                adjustElement(
                    new BasicButton('Info'),
                    {
                        classes: ['module-info'],
                        eventListeners: {
                            click: () => this.openInfoDialog()
                        }
                    }
                )
                adjustElement(
                    new BasicButton('Edit'),
                    {
                        classes: ['module-edit'],
                        eventListeners: {
                            click: () => this.openEditDialog()
                        }
                    }
                )
                this.createDeleteButton(),
            )
        )
    }
}
```

## Initialization

```TS
const moduleStorage = new ModuleStorage(localStorage)
const application   = new Application(moduleStorage)

application.load()
application.init()
application.run()
```
