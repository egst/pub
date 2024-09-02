import * as dom from 'util/dom'

import {Icon} from 'components/icon'

export class IconHeading extends HTMLHeadingElement {
    readonly iconElem: Icon
    readonly textElem: HTMLSpanElement

    constructor (text: string, icon: string) {
        super()
        this.classList.add('icon-heading')
        this.append(
            this.iconElem = new Icon(icon),
            this.textElem = dom.createElement({
                tag:     'span',
                text:    text,
                classes: ['text']
            })
        )
    }

    set icon (icon: string) {
        this.iconElem.icon = icon
    }

    set text (text: string) {
        this.textElem.innerText = text
    }
}
