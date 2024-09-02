export class Dialog extends HTMLDialogElement {
    constructor (...children: Element[]) {
        super()
        this.classList.add('dialog')
        this.append(...children)
    }

    show (): void {
        this.showModal()
    }
}
