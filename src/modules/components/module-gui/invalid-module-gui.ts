import {InvalidModule} from 'modules/module'

import {ModuleGui}  from 'modules/components/module-gui'

import {DeleteDialog} from 'modules/components/dialog/delete-dialog'

export class InvalidModuleGui extends ModuleGui {
    constructor (readonly module: InvalidModule) {
        super(module.name, 'error')
        this.addButton('fix',    () => { this.fix() })
        this.addButton('delete', () => { this.delete() })
    }

    fix (): void {
        void this.withLoading(async () => {
            await this.module.fix()
        })
    }

    delete (): void {
        new DeleteDialog(this.module).show()
    }
}
