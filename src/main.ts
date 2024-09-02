/*
import {reloadModules} from '/js/modules/actions.js'
import {addModule} from '/js/modules/userActions.js'

document.addEventListener('DOMContentLoaded', () => {
    reloadModules()

    document.getElementById('add-module').addEventListener('click', addModule)

    const modals = document.querySelectorAll('.modal')
    for (const closeButton of document.querySelectorAll('.close-modal')) {
        closeButton.addEventListener('click', () => {
            for (const modal of modals)
                modal.classList.add('hidden')
        })
    }
})
*/


// TODO: 'use strict' in class definitions.

/*
setModuleDefinition('factorial', text(`
    class extends window.pub.ModuleBase {
        init () {
            this._components.result = document.createElement('input')
            this._components.result.setAttribute('readonly', '')
            this._gui.appendChild(this._components.result)

            this._modules.counter.addEventListener('incremented', () => this.#recalculate())

            this._recalculate()
        }

        async run () {
            this.#recalculate()
        }

        #factorial (n) {
            return n == 0 ? 1 : this.#factorial(n - 1) * n
        }

        #recalculate () {
            const factorial = this.#factorial(this._modules.counter.get('value'))
            this._components.result.setAttribute('value', factorial)
        }
    }
`))
*/
