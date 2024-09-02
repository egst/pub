import {PendingModule} from 'modules/module'

import {ModuleGui}  from 'modules/components/module-gui'

import {DeleteDialog}      from 'modules/components/dialog/delete-dialog'
import {PendingEditDialog} from 'modules/components/dialog/pending-edit-dialog'

export class PendingModuleGui extends ModuleGui {
    constructor (readonly module: PendingModule) {
        super(module.name, 'sync_problem')
        this.addButton('edit',   () => { this.edit() })
        this.addButton('delete', () => { this.delete() })
    }

    edit (): void {
        new PendingEditDialog(this.module).show()
    }

    delete (): void {
        new DeleteDialog(this.module).show()
    }
}
