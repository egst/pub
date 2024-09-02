import * as dom from 'util/dom'

export class IconHeading extends HTMLHeadingElement {
    readonly icon: HTMLElement

    constructor (text: string, icon?: string) {
        super()
        this.classList.add('icon-button')
        this.icon = dom.createElement({
            tag: 'span',
            details: element => {
                element.classList.add('icon')
            }
        })
        this.append(
            dom.createElement({
                tag: 'span',
                details: element => {
                    element.innerText = text
                }
            }),
            this.icon
        )
        if (icon !== undefined) {
            this.setIcon(icon)
        }
    }

    setIcon (icon: string): void {
        this.icon.innerText = icon
    }
}

// TODO: Mixin for Icon* elements.
