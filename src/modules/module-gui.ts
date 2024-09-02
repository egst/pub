import * as util from 'util'

export class ModuleGui extends HTMLElement {
    readonly moduleImplementationGui: HTMLElement

    constructor () {
        super()
        this.classList.add('module-gui')
        this.moduleImplementationGui = util.createElement({
            classes: ['module-implementation-gui']
        })
        this.append(this.moduleImplementationGui)
    }

    appendAbove (...elements: Element[]): void {
        for (const element of elements) {
            this.insertBefore(element, this.moduleImplementationGui)
        }
    }

    appendBelow (...elements: Element[]): void {
        this.append(...elements)
    }
}
