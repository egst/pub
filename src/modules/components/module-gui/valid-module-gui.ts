import {ValidModule} from 'modules/module'

import {ModuleGui}  from 'modules/components/module-gui'

import {DeleteDialog}     from 'modules/components/dialog/delete-dialog'
import {EditAdjustDialog} from 'modules/components/dialog/edit-adjust-dialog'
import {InfoDialog}       from 'modules/components/dialog/info-dialog'

export class ValidModuleGui extends ModuleGui {
    constructor (readonly module: ValidModule) {
        super(module.name, 'deployed_code')
        this.addButton('info',   () => { this.info() })
        this.addButton('edit',   () => { this.edit() })
        this.addButton('delete', () => { this.delete() })
    }

    info (): void {
        new InfoDialog(this.module).show()
    }

    edit (): void {
        new EditAdjustDialog(this.module).show()
    }

    delete (): void {
        new DeleteDialog(this.module).show()
    }
}
