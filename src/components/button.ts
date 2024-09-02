export class Button extends HTMLButtonElement {
    constructor (text: string) {
        super()
        this.classList.add('button')
        this.text = text
    }

    set text (text: string) {
        this.innerText = text
    }
}
