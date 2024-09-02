export class BasicButton extends HTMLButtonElement {
    constructor (text: string) {
        super()
        this.classList.add('basic-button')
        this.innerText = text
    }
}
