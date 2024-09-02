import {config} from 'config/config'

export class Icon extends HTMLSpanElement {
    constructor (icon: string) {
        super()
        this.classList.add(
            'icon',
            `material-symbols-${config.gui.materialIcons.iconType}`
        )
        this.icon = icon
    }

    set icon (icon: string) {
        this.innerText = icon
    }
}
