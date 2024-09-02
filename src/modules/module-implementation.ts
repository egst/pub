import {Attempt}       from 'util/attempt'
import {FailedAttempt} from 'util/attempt'
import {attempt}       from 'util/attempt'

import {ValidModule} from 'modules/module'

import {ValidResponse} from 'modules/generation/generation-response'

export type EventHandler = () => void

export type Getter = () => unknown

/**
 * This class serves as a base for all generated module implementations.
 * The implementations are always generated in JS, not TS.
 * That's why this class doesn't follow the same conventions as in other TS files
 * and mimics a regular JS class instead.
 */
export class ModuleImplementation {
    /**
     * Name of this module.
     */
    _name: string

    /**
     * GUI components of this module.
     */
    _components: Record<string, Element> = {}

    /**
     * Reference to the GUI object of this module.
     */
    _gui: Element

    /**
     * Event handlers for communication with other modules.
     */
    _eventHandlers: Record<string, EventHandler[]> = {}

    /**
     * Getters of public values for communication with other modules.
     */
    _getters: Record<string, Getter> = {}

    /**
     * Never override this constructor.
     */
    constructor (name: string, gui: Element) {
        this._name = name
        this._gui  = gui
        this._gui.replaceChildren()
    }

    /**
     * Initialize this module.
     *
     * Other modules are not yet available when this method is called.
     *
     * Usual actions performed in this method are:
     * - Initializing the GUI
     * - Storing references to the important GUI elements.
     * - Setting up getters for other modules to use.
     * - Registering events for other modules to use.
     * - Initial calculations that do not require interaction with other modules.
     * - Setting up event listeners on this module's GUI elements.
     */
    init (): void {}

    /**
     * Run this module.
     *
     * All other modules are now initialized and can be interacted with via the modules parameter.
     *
     * Usual actions performed in this method are:
     * - Calculations that require interaction with other modules.
     * - Calculations that depend on run-time values.
     * - Retrieving values from other modules via their getters.
     * - Settup up event listeners on other modules.
     * - Infinite loops are OK here since this method is asynchronous.
     *
     * @param modules References to all the available modules.
     */
    async run (
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        modules: Record<string, ModuleImplementation>
    ): Promise<void> {}

    /**
     * Access an exposed value of this module.
     *
     * This method is primarily intended to be used by other modules.
     */
    get (name: string): unknown {
        return this._getters[name]?.()
    }

    /**
     * Set up an event listener for an exposed event of this module.
     *
     * This method is primarily intended to be used by other modules.
     */
    addEventListener (event: string, handler: EventHandler) {
        const handlers = this._eventHandlers[event]
        if (handlers == null)
            throw new Error(`Event ${event} is not exposed in this module.`)
        handlers.push(handler)
    }

    /**
     * Set getter for an exposed value.
     */
    _setGetter (name: string, getter: Getter) {
        this._getters[name] = getter
    }

    /**
     * Register an event as exposed.
     *
     * This method must be called in the init method
     * so that other modules know that the event is exposed.
     */
    _registerEvent (event: string) {
        this._eventHandlers[event] = []
    }

    /**
     * Dispatch (trigger) an exposed event.
     *
     * This method must only be called after the event was registered
     * with the _registerEvent method.
     */
    _dispatchEvent (event: string) {
        const handlers = this._eventHandlers[event]
        if (handlers == null)
            throw new Error(`Event ${event} is not exposed in this module.`)
        for (const handler of handlers)
            handler()
    }
}

export class ModuleImplementationWrapper {
    constructor (
        readonly implementation: unknown
    ) {}

    init (errorHandler: (error: Error) => void): void {
        const result = attempt(() => {
            /* eslint-disable-next-line
               @typescript-eslint/no-explicit-any,
               @typescript-eslint/no-unsafe-call,
               @typescript-eslint/no-unsafe-member-access */
            (this.implementation as any).init()
        })
        if (result instanceof FailedAttempt)
            errorHandler(result.error)
    }

    run (modules: ValidModule[], errorHandler: (error: Error) => void): void {
        const result = attempt(() =>
            /* eslint-disable-next-line
               @typescript-eslint/no-explicit-any,
               @typescript-eslint/no-unsafe-call,
               @typescript-eslint/no-unsafe-member-access,
               @typescript-eslint/no-unsafe-return */
            (this.implementation as any).run(modules)
        )
        if (result instanceof FailedAttempt)
            errorHandler(result.error)
        else if (result.value instanceof Promise)
            result.value.catch((error: unknown) => {
                errorHandler(
                    error instanceof Error
                        ? error
                        : new Error(String(error))
                )
            })
        else
            errorHandler(new Error(
                `Invalid return type of the run method. Expected a promise. Got ${typeof result}.`
            ))
    }
}

export class ModuleImplementationConstructorWrapper {
    constructor (
        readonly Implementation: unknown
    ) {}

    static createFromResponse (response: ValidResponse): Attempt<ModuleImplementationConstructorWrapper> {
        return attempt(() => {
            return new ModuleImplementationConstructorWrapper(eval(`(${response.code})`))
        })
    }

    construct (gui: HTMLElement): Attempt<ModuleImplementationWrapper> {
        return attempt(() => {
            /* eslint-disable-next-line
               @typescript-eslint/no-explicit-any,
               @typescript-eslint/no-unsafe-call */
            const implementation: unknown = new (this.Implementation as any)(gui)
            return new ModuleImplementationWrapper(implementation)
        })
    }
}
