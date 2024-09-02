import * as dom from 'util/dom'

import {Module} from 'modules/module'

import {Form} from 'components/form'

import {ModuleDialog} from 'modules/components/module-dialog'

export class DeleteDialog extends ModuleDialog<Module> {
    constructor (module: Module) {
        super(module, module.moduleData.moduleDefinition.moduleInterface.name, 'delete')
        this.appendContent(
            new Form(
                'delete',
                () => { this.delete() },
                dom.createElement({
                    tag:  'p',
                    text: `Are you sure you want to delete the module "${module.name}?"`,
                })
            ),
        )
    }

    delete (): void {
        void this.withLoading(() => {
            this.module.delete()
            this.close()
        })
    }
}
