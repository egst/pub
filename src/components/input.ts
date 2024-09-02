export class Input extends HTMLInputElement {
    constructor (name: string, text: string, type: string = 'text') {
        super()
        this.classList.add('label')
        this.text = text
        this.name = name
        this.type = type
    }

    set text (text: string) {
        this.innerText = text
    }
}
