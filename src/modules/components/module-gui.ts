import * as dom from 'util/dom'

import {IconHeading} from 'components/icon-heading'
import {IconButton}  from 'components/icon-button'

/**
 * Contrainer for a module containing basic controls and the module implementation GUI
 * that is controlled by the generated code.
 */
export class ModuleGui extends HTMLElement {
    readonly header:                  HTMLElement
    readonly titleElem:               IconHeading
    readonly moduleImplementationGui: HTMLElement

    constructor (
        readonly title: string,
        readonly icon:  string
    ) {
        super()
        this.classList.add('module-gui')
        this.append(
            this.header = dom.createElement({
                tag:     'header',
                classes: ['header'],
                style: {
                    display: 'flex',
                },
                children: [
                    this.titleElem = dom.adjustElement(
                        new IconHeading(this.title, this.icon),
                        {
                            style: {
                                flex: '1',
                            }
                        }
                    )
                ],
            }),
            this.moduleImplementationGui = dom.createElement({
                tag:     'section',
                classes: ['module-implementation-gui']
            })
        )
    }

    startLoading (): void {
        // TODO: Disable pointer events (CSS) and add disabled attribute to inputs.
        // Also consider other cases, like editable elements or elements with event listeners.
        this.titleElem.icon = 'progress_activity'
        this.titleElem.iconElem.style.animation = 'rotation 1s linear infinite'
    }

    stopLoading (): void {
        this.titleElem.icon = this.icon
        this.titleElem.iconElem.style.animation = 'none'
    }

    async withLoading (action: () => void | Promise<void>) {
        try {
            this.startLoading()
            await action()
        } finally {
            this.stopLoading()
        }
    }

    addButton (icon: string, handler: dom.EventHandler<'click'>): void {
        this.header.append(
            dom.adjustElement(
                new IconButton(icon),
                {
                    eventListeners: {
                        click: handler
                    }
                }
            )
        )
    }
}
