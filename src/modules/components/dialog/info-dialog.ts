import * as dom from 'util/dom'

import {ValidModule} from 'modules/module'

import {ModuleDialog} from 'modules/components/module-dialog'

export class InfoDialog extends ModuleDialog<ValidModule> {
    constructor (module: ValidModule) {
        super(module, module.moduleData.moduleDefinition.moduleInterface.name, 'info')
        this.appendContent(
            dom.createElement({
                tag:  'h2',
                text: 'Description:',
            }),
            dom.createElement({
                text: module.moduleData.moduleDefinition.description
            }),
            dom.createElement({
                tag:  'h2',
                text: 'Values:',
            }),
            ...module.moduleData.moduleDefinition.moduleInterface.values.map(value =>
                dom.createElement({
                    text: value
                }),
            ),
            dom.createElement({
                tag:  'h2',
                text: 'Events:',
            }),
            ...module.moduleData.moduleDefinition.moduleInterface.events.map(event =>
                dom.createElement({
                    text: event
                }),
            ),
            dom.createElement({
                tag:  'h2',
                text: 'Comments:',
            }),
            ...module.moduleData.response.comments.map(comment =>
                dom.createElement({
                    text: comment
                }),
            ),
            dom.createElement({
                tag:  'h2',
                text: 'Code:',
            }),
            dom.createElement({
                text: module.moduleData.response.code
            }),
        )
    }
}
