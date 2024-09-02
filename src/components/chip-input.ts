import * as dom from 'util/dom'

import {IconButton} from 'components/icon-button'

export interface ChipOptions {
    value?:       string,
    placeholder?: string,
    editable?:    boolean,
    removable?:   boolean,
}

export class ChipInput extends HTMLElement {
    readonly input:        HTMLInputElement
    readonly removeButton: HTMLButtonElement

    constructor (name: string, options: ChipOptions) {
        super()
        this.classList.add('chip-input')
        this.append(
            this.input = dom.createElement({
                tag: 'input',
                details: element => {
                    element.name        = name
                    element.value       = options.value ?? ''
                    element.placeholder = options.placeholder ?? ''
                    element.readOnly    = !options.editable
                }
            }),
            this.removeButton = dom.adjustElement(
                new IconButton('close'),
                {
                    hidden: !options.removable,
                    eventListeners: {
                        click: () => { this.remove() }
                    }
                }
            )
        )
    }

    get editable () {
        return !this.input.readOnly
    }

    get removable () {
        return !this.removeButton.hidden
    }

    remove (): void {
        if (this.removable)
            super.remove()
    }
}
