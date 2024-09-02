import {Schema}          from 'util/validation'
import {ValidationError} from 'util/validation'

import {ValidModule} from 'modules/module'

import {ChipInputs}   from 'components/chip-inputs'
import {Form}         from 'components/form'
import {Label}        from 'components/label'
import {Textarea}     from 'components/textarea'

import {ModuleDefinition} from 'modules/module-definition'
import {ModuleInterface}  from 'modules/module-interface'

import {Code}         from 'modules/components/code'
import {Comment}      from 'modules/components/comment'
import {ModuleDialog} from 'modules/components/module-dialog'

const editFormDataSchema = Schema.object({
    description: Schema.string,
    name:        Schema.string,
    values:      Schema.array(Schema.string),
    events:      Schema.array(Schema.string)
})

// TODO: Adjustment of the interface based on the textual instructions.
const adjustFormDataSchema = Schema.object({
    description: Schema.string,
})

export class EditAdjustDialog extends ModuleDialog<ValidModule> {
    readonly editForm:   HTMLFormElement
    readonly adjustForm: HTMLFormElement

    constructor (module: ValidModule) {
        super(module, module.moduleData.moduleDefinition.moduleInterface.name, 'edit')
        this.appendContent(
            this.editForm = new Form(
                'update',
                event => {
                    event.preventDefault()
                    this.update()
                },
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
                new Label('comments', 'Comments:'),
                ...module.moduleData.response.comments.map(comment => new Comment(comment)),
                new Label('code', 'Code:'),
                new Code(module.moduleData.response.code)
            ),
            this.adjustForm = new Form(
                'adjust',
                () => { this.adjust() },
                new Label('adjustment', 'Adjustments:'),
                new Textarea('description'),
            )
        )
    }

    update (): void {
        void this.withLoading(async () => {
            const parsed = editFormDataSchema.parseFormData(new FormData(this.editForm))
            if (parsed instanceof ValidationError) {
                throw parsed
            }
            await this.module.change(new ModuleDefinition(
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

    adjust (): void {
        void this.withLoading(async () => {
            const parsed = adjustFormDataSchema.parseFormData(new FormData(this.adjustForm))
            if (parsed instanceof ValidationError) {
                throw parsed
            }
            await this.module.adjust(parsed.description)
            this.close()
        })
    }
}
