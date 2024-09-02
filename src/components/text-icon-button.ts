import * as dom from 'util/dom'

import {Icon} from 'components/icon'

export class TextIconButton extends HTMLButtonElement {
    readonly iconElem: Icon
    readonly textElem: HTMLSpanElement

    constructor (text: string, icon: string) {
        super()
        this.classList.add('icon-button')
        this.append(
            this.textElem = dom.createElement({
                tag:     'span',
                text:    text,
                classes: ['text']
            }),
            this.iconElem = new Icon(icon)
        )
    }

    set icon (icon: string) {
        this.iconElem.icon = icon
    }

    set text (text: string) {
        this.textElem.innerText = text
    }
}
