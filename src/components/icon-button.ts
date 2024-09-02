import {Icon} from 'components/icon'

export class IconButton extends HTMLButtonElement {
    readonly iconElem: Icon

    constructor (icon: string) {
        super()
        this.classList.add('icon-button')
        this.append(
            this.iconElem = new Icon(icon)
        )
    }

    set icon (icon: string) {
        this.iconElem.icon = icon
    }
}
