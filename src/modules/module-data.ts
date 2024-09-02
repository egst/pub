import * as util from 'util'

import {Module}                                 from 'modules/module'
import {PendingModule}                          from 'modules/module'
import {ValidModule}                            from 'modules/module'
import {InvalidModule}                          from 'modules/module'
import {Application}                            from 'modules/application'
import {ModuleGui}                              from 'modules/module-gui'
import {ModuleDefinition}                       from 'modules/module-definition'
import {ModuleImplementationConstructorWrapper} from 'modules/module-implementation'

import {GenerationResponse} from 'modules/generation/generation-response'
import {ValidResponse}      from 'modules/generation/generation-response'
import {InvalidResponse}    from 'modules/generation/generation-response'
import {PendingResponse}    from 'modules/generation/generation-response'

export abstract class ModuleData <Response extends GenerationResponse = GenerationResponse> {
    constructor (
        readonly moduleDefinition: ModuleDefinition,
        readonly response:         Response
    ) {}

    static createFromStoredObject (data: util.GenericRecord): ModuleData {
        if (!util.isObject(data.moduleDefinition))
            throw new Error('Invalid module definition.')
        if (!util.isObject(data.response))
            throw new Error('Invalid module generation response.')

        return GenerationResponse.createResponseFromStoredObject(data.response)
            .toModuleData(ModuleDefinition.createFromStoredObject(data.moduleDefinition))
    }

    /* TODO: Move to Application or ModuleStorage
    store (): void {
        const allData = localStorage.getItem(key)
        if (allData === null)
            throw new Error('Missing module data.')

        const parsed: unknown = JSON.parse(allData)
        if (!util.isObject(parsed))
            throw new Error('Invalid module data.')

        parsed[this.moduleInterface.name] = this

        localStorage.setItem(key, JSON.stringify(parsed))
    }

    delete (): void {
        deleteModuleData(this.moduleInterface.name)
    }
    */

    abstract toModule (application: Application, gui: ModuleGui): Module

    abstract renamed (name: string): ModuleData<Response>
}

export class ValidModuleData extends ModuleData<ValidResponse> {
    toModule (application: Application, gui: ModuleGui): Module {
        const implementationConstructor = ModuleImplementationConstructorWrapper.createFromResponse(this.response)

        if (implementationConstructor instanceof util.FailedAttempt)
            return this.response
                .invalidate([String(implementationConstructor.error)])
                .toModuleData(this.moduleDefinition)
                .toModule(application, gui)

        const implementation = implementationConstructor.value.construct(gui.moduleImplementationGui)

        if (implementation instanceof util.FailedAttempt)
            return this.response
                .invalidate(['Failed to construct.', String(implementation.error)]) // TODO: Better error message.
                .toModuleData(this.moduleDefinition)
                .toModule(application, gui)

        return new ValidModule(
            application, this, gui,
            implementation.value
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
}

export class PendingModuleData extends ModuleData<PendingResponse> {
    toModule (application: Application, gui: ModuleGui): PendingModule {
        return new PendingModule(application, this, gui)
    }
}

const key = 'pub-module-data'

export const prepareModuleDataStorage = (): void => {
    const data = localStorage.getItem(key)
    if (data === null)
        localStorage.setItem(key, '{}')
}

export const deleteAllModuleData = (): void => {
    localStorage.setItem(key, '{}')
}

export const getAllModuleData = (): Record<string, ModuleData> => {
    const allData = localStorage.getItem(key)
    if (allData === null)
        throw new Error('Missing module data.')

    const parsed: unknown = JSON.parse(allData)
    if (!util.isObjectOfObjects(parsed))
        throw new Error('Invalid module data.')

    return util.objectMap(parsed, (data, name) => [name, createModuleDataFromStoredObject(name, data)])
}

export const getModuleData = (name: string): ModuleData => {
    const allData = localStorage.getItem(key)
    if (allData === null)
        throw new Error('Missing module data.')

    const parsed: unknown = JSON.parse(allData)
    if (!util.isObject(parsed))
        throw new Error('Invalid module data.')

    const data: unknown = parsed[name]
    if (data === undefined)
        throw new Error('Missing module data.')
    if (!util.isObject(data))
        throw new Error('Invalid module data.')

    return createModuleDataFromStoredObject(name, data)
}

export const deleteModuleData = (name: string): void => {
    const allData = localStorage.getItem(key)
    if (allData === null)
        throw new Error('Missing module data.')

    const parsed: unknown = JSON.parse(allData)
    if (!util.isObject(parsed))
        throw new Error('Invalid module data.')

    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete parsed[name]

    localStorage.setItem(key, JSON.stringify(parsed))
}

prepareModuleDataStorage()
