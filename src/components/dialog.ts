export class Dialog extends HTMLDialogElement {
    constructor (...children: Element[]) {
        super()
        this.append(...children)
    }
}
