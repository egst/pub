import * as dom from 'util/dom'

import {Button} from 'components/button'

export class Form extends HTMLFormElement {
    readonly submitButton: HTMLButtonElement

    constructor (submit: string, handler: dom.EventHandler<'submit'>, ...children: Element[]) {
        super()
        this.classList.add('form')
        this.append(
            ...children,
            this.submitButton = new Button(submit)
        )
        this.addEventListener('submit', handler)
    }
}
