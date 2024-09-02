import * as dom from 'util/dom'

/**
 * Element displaying the generated module implementation code.
 */
export class Code extends HTMLPreElement {
    readonly codeElem: HTMLElement

    constructor (code: string) {
        super()
        this.classList.add('code')
        this.append(
            this.codeElem = dom.createElement({
                tag:  'code',
                text: code
            })
        )
    }

    set code (code: string) {
        this.codeElem.innerText = code
    }
}
