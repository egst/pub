import * as util from 'util/util'

import {ValidModule} from 'modules/module'

const responseProperties = util.text(`
    * \`status\`: One of the following strings:
      * \`success\`: Code generated successfully. Nothing to comment.
      * \`info\`: Code generated but the user should be notified about
        something important.
      * \`warning\`: Code generated but the user should be notified about
        a potential issue that might arise with this code.
      * \`error\`: Unable to fulfill user's requirements. Reasons explained in the comment.
      Don't put any other strings into \`status\`.
    * \`comments\`: If there's anything to say to the user in plain language, it must be placed here.
      Don't use unnecessary comments. Only use comments to notify the user of something important.
    * \`code\`: A valid piece of JS code and nothing else.
      It must be a valid JS code that can be evaluated.
      Don't use any surrounding characters around the code.
`)

export const codeGenerationFormat = util.text(`
    Your response must be a JSON object containing 3 properties:

    ${responseProperties}

    Example of your response:

    {
        "status": "info",
        "comments": [
            "This code might fail if the Foo dependency is not loaded."
        ],
        "code": "const foo = new Foo(bar)"
    }
`)

export const codeAdjustmentFormat = util.text(`
    Your response must be a JSON object containing 4 properties:

    ${responseProperties}
    * \`description\`: A modified description from the original input reflecting
      the performed changes.

    Example of your response:

    {
        "status": "info",
        "comments": [],
        "description": "Counter module with two buttons to increment and decrement a displayed number which starts at 0.",
        "code": "const foo = new Foo(bar)"
    }
`)

export const moduleExamples = [
    util.text(`
        Example: The user requests a counter module that has a single button
        to increment the counter that is displayed in the module. The user also
        requests that the module exposes its counter value to other modules as 'value'
        and that it dispatches a 'incremented' event whenever the counter is incremented.

        Your complete response (with parts of the code omited):

        {
            "status": "success",
            "comments": [],
            "code": "class extends window.pub.ModuleBase {...}"
        }

        Your code response:

        class extends window.pub.ModuleBase {
            init () {
                // Create the increment button:
                this._components.button = document.createElement('button')
                this._components.button.innerText = 'increment'
                this._gui.appendChild(this._components.button)

                // Create the counter display component:
                this._components.counter = document.createElement('input')
                this._components.counter.setAttribute('readonly', '')
                this._components.counter.setAttribute('value', 0)
                this._gui.appendChild(this._components.counter)

                // Expose the 'incremented' event for other modules:
                this._registerEvent('incremented')

                // Increment on click:
                this._components.button.addEventListener('click', event => this.#incrementButtonHandler(event))

                // Expose the counter value for other modules:
                this._setGetter('value', () => this.#getValue())
            }

            /** Get the current value of the counter. */
            #getValue () {
                return Number(this._components.counter.getAttribute('value'))
            }

            /** Increment the counter on click. */
            #incrementButtonHandler (event) {
                this._components.counter.setAttribute('value', this.#getValue() + 1)
                // Expose this event to other modules:
                this._dispatchEvent('incremented')
            }
        }
    `),
    util.text(`
        Example 2: The user requests another module that takes the 'value' from
        the already existing counter module, calculates its factorial and displays
        that value. The user requests that the displayed factorial value is
        recalculated and displayed again whenever the counter triggers the 'incremented'
        event.

        Your complete response (with parts of the code omited):

        {
            "status": "success",
            "comments": [],
            "code": "class extends window.pub.ModuleBase {...}"
        }

        Your code response:

        class extends window.pub.ModuleBase {
            init () {
                // Create the factorial result display component:
                this._components.result = document.createElement('input')
                this._components.result.setAttribute('readonly', '')
                this._gui.appendChild(this._components.result)

                // Recalculate the factorial when the counter module increments:
                this._modules.counter.addEventListener('incremented', () => this.#recalculate())
            }

            async run () {
                // Calculate the initial factorial value:
                this.#recalculate()
            }

            /** Calculate the factorial of the given number. */
            #factorial (n) {
                return n == 0 ? 1 : this.#factorial(n - 1) * n
            }

            /** Recalculate the factorial value and update the displayed value. */
            #recalculate () {
                const factorial = this.#factorial(this._modules.counter.get('value'))
                this._components.result.setAttribute('value', factorial)
            }
        }
    `),
    util.text(`
        Example 3: The user requests the same factorial module as in example 2
        but they mistakenly request interaction with the counter module's
        'result' value which is not exposed. The counter module does expose
        a 'value' value though. If it makes sense, you can try to use that
        value instead and notify the user of that adjustment.

        Your complete response (with parts of the code omited):

        {
            "status": "info",
            "comments": [
                "The counter module does not expose the value 'result' but it does expose the value 'value'. The value 'value' will be used instead."
            ],
            "code": "class extends window.pub.ModuleBase {...}"
        }
    `),
    util.text(`
        Example 3: The user requests the same factorial module as in example 2
        but they mistakenly request interaction with a module named 'foo'
        even though there's no such module. You can skip generating the code
        and explain to the user why you were unable to do so. Help the user
        make adjustments in their prompt or in the rest of the program to fix this issue.

        Your complete response:

        {
            "status": "error",
            "comments": [
                "There is no module named 'foo'. Please adjust the prompt to use a different module or create the 'foo' module."
            ],
            "code": "",
        }
    `),
]

export const moduleAdjustmentExamples = [
    util.text(`
        Example: The user had originally requested a counter module that has a single button
        to increment the counter that is displayed in the module.

        User's original module description:

        A counter module with a single button that increments a displayed value.

        Later, the user requested an adjustment:

        Add another button to decrement the displayed number.

        Your new response (with parts of the code omitted):

        {
            "status": "success",
            "comments": [],
            "description": "A counter module with two buttons that increment and decrement a displayed value."
            "code": "class extends window.pub.ModuleBase {...}"
        }
    `),
    util.text(`
        Example: The user had originally requested a counter module that has a single button
        to increment the counter that is displayed in the module.

        User's original module description:

        A counter module with a single button that increments a displayed value.

        Later, the user requested an adjustment:

        Start the counter at 1.

        Your new response (with parts of the code omitted):

        {
            "status": "success",
            "comments": [],
            "description": "A counter module with a single button that increments a displayed value starting at 1."
            "code": "class extends window.pub.ModuleBase {...}"
        }
    `)
]

export const otherModules = (modules: ValidModule[]) =>
    util.text(`
        All of the other available modules are listed below with their exposed values and events.
        If the user requests interaction with another module's values or events
        that are not exposed there, either try to use a value/event with a similar name
        or produce an error. In both cases, notify the user about that issue and explain it.
    `) +
    '\n\n' +
    modules.map(module => module.summary).join('\n\n')

export const codeGeneration = util.text(`
    You are supposed to implement a simple module in JS based on user's requirements
    that will be a part of a possibly larger application and might interact with other modules.

    The class must extend the window.pub.ModuleBase class which defines the following:
    * A \`constructor\` method that initializes all necessary references.
      NEVER override the constructor. Treat it as final.
    * A protected \`_components\` property that will contain an object
      with references to all GUI components of this module.
    * A protected \`_gui\` property that will contain a reference to
      the GUI root node of this module.
    * A protected \`_modules\` property that will contain an object
      with references to all other modules (including this one).
    * A public \`init\` method wtih no parameters that does nothing by default.
    * A public async \`run\` method with no parameters that does nothing by default.
    * A \`cosntructor\` method with two parameters: \`gui\` and \`modules\`
      that assigns these two into the respective protected properties of the same name.
    * A public \`get\` function with one parameter \`name\` that
      allows other modules to access public data of this module with the given name.
    * A protected \`_setGetter\` method with two parameters \`name\` and \`getter\` that
      allows exposing data with the given name of this module to other modules
      via the given getter function. The getter function will be called when
      another module requests the respective public data with the public \`get\` method.
    * A public \`addEventListener\` with two parameters \`event\` and \`handler\` that
      allows other modules to listen to public events with the given name (\`event\`)
      on this module with the given handler function.
    * A protected \`_registerEvent\` method with one parameter \`event\`
      that will expose the given event to other modules. This method only registers
      that module name to be used with \`_dispatchEvent\` and \`addEventListener\`.
      Always call this method to register any event in the \`init\` method
      BEFORE it might be dispatched with \`_dispatchEvent\` in the future.
    * A protected \`_dispatchEvent\` method with one parameter \`event\`
      that will call all the event listener handlers added by other modules
      for the given event. Other modules may call \`addEventListener\` on this module
      and this module can call \`_dispatchEvent\` to trigger that event.

    ModuleBase class definition:

    window.pub.ModuleBase = class {
        _name
        _gui
        _modules
        _components = {}
        _eventHandlers = {}
        _getters = {}

        constructor (name, gui, modules) {
            this._name = name
            this._gui = gui
            this._modules = modules
            // Clear this module's GUI:
            this._gui.replaceChildren()
        }

        init () {}

        async run () {}

        get (name) {
            return this._getters[name]?.()
        }

        addEventListener (event, handler) {
            const handlers = this._eventHandlers[event]
            if (handlers == null)
                throw new Error(\`Event \${event} is not exposed in this module.\`)
            handlers.push(handler)
        }

        _setGetter (name, getter) {
            this._getters[name] = getter
        }

        _registerEvent (event) {
            this._eventHandlers[event] = []
        }

        _dispatchEvent (event) {
            const handlers = this._eventHandlers[event]
            if (handlers == null)
                throw new Error(\`Event \${event} is not exposed in this module.\`)
            for (const handler of handlers)
                handler()
        }
    }

    The class that you generate represents the functionality of a single module
    of a larger application. The user will describe how this module behaves
    and how it interacts with other modules.

    Any functionality the user requests must be performed in the \`run\` or \`init\` method.
    Only the necessary initialization must be performed in the \`init\` method which must terminate.
    Other functionality must be implemented in the \`run\` method.
    Any computation that works with exposed events and/or values of this and/or other modules
    must be performed in the \`run\` method because those events and values might not be ready in the \`init\` method.
    The \`init\` method will be run once to initialize the module.
    The \`run\` method will be run once after the initialization of all modules
    and may run indefinitely. In some cases the \`run\` method doesn't need to
    perform any actions. Use the \`run\` method to perform actions that need
    all the other modules to be initialized (if any interaction with other modules is required).

    If the user wants to interact wtih data or events from other modules, access it
    via the modules property: \`this._modules[moduleName]...\`. Only use the
    \`get\` and \`addEventListener\` methods on other modules.
    Never access any private or protected properties or methods.

    All the event listeners must use handlers defined as private methods of the class
    with names ending in \`Handler\` that one parameter: \`event\`
    that will reference event that triggered the handler.
    In this module you can use the \`_dispatchEvent\` method to trigget the event
    and it will call all the handlers that other modules might have set up
    with a call to the \`addEventListener\` method on this module from the outside.
    Avoid using \`addEventListener\` in this module on itself. It is mainly
    intended to be used by other modules to listen to events on this module.

    Define other helper methods as needed and always make them private (prefixed with #).

    If the user requests any GUI components, initialize them in the \`init\` method.
    Treat the \`gui\` property as a DOM node representing the GUI of the module
    and create any HTML elements in it as necessary.
    Store all relevant GUI components as the user describes them in the \`_components\`
    property: \`this._components[componentName] = document.createElement('input')\`
    and insert them into the GUI: \`this._gui.appendChild(this._components[componentName])\`.

    Comment separate parts of the code based on how the user conceptualizes their individual requirements.

    What to avoid:

    NEVER generate anything before or after the class definition.
    Do NOT use any surrounding characters.
    Do NOT provide any examples of use.
    Only generate the class definition.
    NEVER implement (override) the constructor method.
    The constructor is defined by the base class and is final.
`)

export const codeFix = util.text(`
    The module definition that you generated produces errors.
    Fix the module definition and respond with the same format as before:
    a valid anonymous JS class definition and nothing else.

    Try to clean up the class definition.
    Remove a constructor if present. It should NEVER be defined.
    Remove any surrounding code or non-code characters.
    Only keep the class definition.

    Respond with a 'success', 'info' or 'warning' status unless
    you were unable to generate a fixed code.
    Do NOT respond with an 'error' status if you fix the previous errors.

    The user will list the errors they've encountered.
`)

export const codeAdjustment = util.text(`
    The user requested an adjustment of a previously generated module.
    Generate an adjusted module and a new description that includes that adjustment.
`)
