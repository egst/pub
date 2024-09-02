import * as dom from 'util/dom'

import {Dialog}      from 'components/dialog'
import {IconButton}  from 'components/icon-button'
import {IconHeading} from 'components/icon-heading'

import {Module} from 'modules/module'

/**
 * A dialog diplaying module details or edit forms.
 */
export class ModuleDialog <M extends Module> extends Dialog {
    readonly headerElem:  HTMLElement
    readonly titleElem:   IconHeading
    readonly closeButton: IconButton
    readonly contentElem: HTMLElement

    constructor (
        readonly module: M,
        readonly title:  string,
        readonly icon:   string
    ) {
        super()
        dom.adjustElement(
            this,
            {
                style: {
                    display:       'flex',
                    flexDirection: 'column'
                },
                children: [
                    this.headerElem = dom.createElement({
                        tag: 'header',
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
                            ),
                            this.closeButton = dom.adjustElement(
                                new IconButton('close'),
                                {
                                    eventListeners: {
                                        click: () => { this.close() }
                                    }
                                }
                            )
                        ]
                    }),
                    this.contentElem = dom.createElement({
                        tag: 'section',
                        style: {
                            display:       'flex',
                            flexDirection: 'column'
                        }
                    })
                ]
            }
        )
    }

    appendContent (...children: Element[]): void {
        this.contentElem.append(...children)
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
            this.module.gui.startLoading()
            await action()
        } finally {
            this.stopLoading()
            this.module.gui.stopLoading()
        }
    }
}
