import {Schema}          from 'util/validation'
import {ValidationError} from 'util/validation'

import {PendingModule} from 'modules/module'

import {ChipInputs}   from 'components/chip-inputs'
import {Form}         from 'components/form'
import {Label}        from 'components/label'
import {Textarea}     from 'components/textarea'

import {ModuleDefinition} from 'modules/module-definition'
import {ModuleInterface}  from 'modules/module-interface'

import {Comment}      from 'modules/components/comment'
import {ModuleDialog} from 'modules/components/module-dialog'

const editFormDataSchema = Schema.object({
    description: Schema.string,
    name:        Schema.string,
    values:      Schema.array(Schema.string),
    events:      Schema.array(Schema.string)
})

export class PendingEditDialog extends ModuleDialog<PendingModule> {
    readonly form: HTMLFormElement

    constructor (module: PendingModule) {
        super(module, module.moduleData.moduleDefinition.moduleInterface.name, 'edit')
        this.appendContent(
            this.form = new Form(
                'update',
                event => {
                    event.preventDefault()
                    this.update()
                },
                new Label('comments', 'Comments:'),
                ...module.moduleData.response.comments.map(comment => new Comment(comment)),
                new Label('name', 'Name:'),
                new Textarea('name', module.moduleData.moduleDefinition.moduleInterface.name),
                new Label('description', 'Description:'),
                new Textarea('description', module.moduleData.moduleDefinition.description),
                new Label('values', 'Values:'),
                new ChipInputs(
                    'Values:',
                    'values',
                    {
                        placeholder: 'value',
                        editable:    true,
                        removable:   true,
                    },
                    ...module.moduleData.moduleDefinition.moduleInterface.values
                ),
                new Label('events', 'Events:'),
                new ChipInputs(
                    'Events:',
                    'events',
                    {
                        placeholder: 'event',
                        editable:    true,
                        removable:   true,
                    },
                    ...module.moduleData.moduleDefinition.moduleInterface.events
                ),
            )
        )
    }

    update (): void {
        void this.withLoading(async () => {
            const parsed = editFormDataSchema.parseFormData(new FormData(this.form))
            if (parsed instanceof ValidationError) {
                throw parsed
            }
            await this.module.fix(new ModuleDefinition(
                new ModuleInterface(
                    parsed.name,
                    parsed.values,
                    parsed.events
                ),
                parsed.description
            ))
            this.close()
        })
    }
}
