import * as dom from 'util/dom'

import {ChipInput, ChipOptions}  from 'components/chip-input'
import {IconButton} from 'components/icon-button'

export class ChipInputs extends HTMLElement {
    readonly container: HTMLFieldSetElement
    readonly list:      HTMLUListElement
    readonly addButton: HTMLButtonElement

    constructor (
        readonly label:   string,
        readonly name:    string,
        readonly options: Omit<ChipOptions, 'value'>,
        ...chips:         string[]
    ) {
        super()
        this.classList.add('chip-inputs')
        this.append(
            this.container = dom.createElement({
                tag: 'fieldset',
                children: [
                    dom.createElement({
                        tag:     'legend',
                        text:    label,
                        classes: ['label'],
                    }),
                    this.list = dom.createElement({
                        tag:     'ul',
                        classes: ['list'],
                        children: chips.map(value =>
                            new ChipInput(name, {...options, value})
                        )
                    }),
                    this.addButton = dom.adjustElement(
                        new IconButton('add'),
                        {
                            classes: ['close'],
                            eventListeners: {
                                click: () => { this.addChip() }
                            }
                        }
                    )
                ]
            })
        )
    }

    addChip (): void {
        this.list.append(new ChipInput(this.name, this.options))
    }
}
