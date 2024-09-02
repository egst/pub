export class Textarea extends HTMLTextAreaElement {
    constructor (name: string, text: string = '') {
        super()
        this.classList.add('label')
        this.text = text
        this.name = name
    }

    set text (text: string) {
        this.innerText = text
    }
}
