import {FailedAttempt} from 'util/attempt'
import {Schema}        from 'util/validation'

import {Application}                            from 'modules/application'
import {InvalidModule}                          from 'modules/module'
import {Module}                                 from 'modules/module'
import {PendingModule}                          from 'modules/module'
import {ValidModule}                            from 'modules/module'
import {ModuleDefinition}                       from 'modules/module-definition'
import {ModuleImplementationConstructorWrapper} from 'modules/module-implementation'

import {ModuleGui} from 'modules/components/module-gui'

import {GenerationResponse} from 'modules/generation/generation-response'
import {InvalidResponse}    from 'modules/generation/generation-response'
import {PendingResponse}    from 'modules/generation/generation-response'
import {ValidResponse}      from 'modules/generation/generation-response'

const moduleDataSchema = Schema.object({
    moduleDefinition: Schema.object(),
    response:         Schema.object(),
})

export abstract class ModuleData <Response extends GenerationResponse = GenerationResponse> {
    constructor (
        readonly moduleDefinition: ModuleDefinition,
        readonly response:         Response
    ) {}

    static createFromStoredObject (data: Record<string, unknown>): ModuleData {
        Schema.assert(moduleDataSchema, data)
        return GenerationResponse.createResponseFromStoredObject(data.response)
            .toModuleData(ModuleDefinition.createFromStoredObject(data.moduleDefinition))
    }

    toStoredObject (): Record<string, unknown> {
        return {
            moduleDefinition: this.moduleDefinition,
            response:         this.response
        }
    }

    abstract toModule (application: Application, gui: ModuleGui): Module

    abstract renamed (name: string): ModuleData<Response>
}

export class ValidModuleData extends ModuleData<ValidResponse> {
    toModule (application: Application, gui: ModuleGui): Module {
        const implementationConstructor = ModuleImplementationConstructorWrapper.createFromResponse(this.response)

        if (implementationConstructor instanceof FailedAttempt)
            return this.response
                .invalidate([String(implementationConstructor.error)])
                .toModuleData(this.moduleDefinition)
                .toModule(application, gui)

        const implementation = implementationConstructor.value.construct(gui.moduleImplementationGui)

        if (implementation instanceof FailedAttempt)
            return this.response
                .invalidate(['Failed to construct.', String(implementation.error)]) // TODO: Better error message.
                .toModuleData(this.moduleDefinition)
                .toModule(application, gui)

        return new ValidModule(
            application, this, gui,
            implementation.value
        )
    }

    renamed (name: string): ValidModuleData {
        return new ValidModuleData(
            this.moduleDefinition.renamed(name),
            this.response
        )
    }

    invalidate (errors: string[]): InvalidModuleData {
        return new InvalidModuleData(
            this.moduleDefinition,
            this.response.invalidate(errors)
        )
    }
}

export class InvalidModuleData extends ModuleData<InvalidResponse> {
    toModule (application: Application, gui: ModuleGui): InvalidModule {
        return new InvalidModule(application, this, gui)
    }

    renamed (name: string): InvalidModuleData {
        return new InvalidModuleData(
            this.moduleDefinition.renamed(name),
            this.response
        )
    }
}

export class PendingModuleData extends ModuleData<PendingResponse> {
    toModule (application: Application, gui: ModuleGui): PendingModule {
        return new PendingModule(application, this, gui)
    }

    renamed (name: string): PendingModuleData {
        return new PendingModuleData(
            this.moduleDefinition.renamed(name),
            this.response
        )
    }
}
