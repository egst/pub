export class Label extends HTMLLabelElement {
    constructor (target: string, text: string) {
        super()
        this.classList.add('label')
        this.text   = text
        this.target = target
    }

    set text (text: string) {
        this.innerText = text
    }

    set target (target: string) {
        this.setAttribute('for', target)
    }
}
