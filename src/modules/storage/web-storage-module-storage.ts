import {Schema}          from 'util/validation'
import {ValidationError} from 'util/validation'

import {ModuleData}    from 'modules/module-data'
import {ModuleStorage} from 'modules/module-storage'

const storageSchema = Schema.record(Schema.string, Schema.object())

type StorageMap = Map<string, Record<string, unknown>>

/**
 * Module storage using the web storage API (e.g. local storage) to store all module data.
 * Uses the local storage by default, but other underlying storage can be specified in the constructor.
 */
export class WebStorageModuleStorage implements ModuleStorage {
    private static readonly key: string = 'pub-module-data'

    constructor (
        readonly storage: Storage = localStorage
    ) {
        this.init()
    }

    deleteAllModuleData (): void {
        this.reset()
    }

    getAllModuleData (): ModuleData[] {
        const allData = this.get()

        return [...allData.values()].map(data => ModuleData.createFromStoredObject(data))
    }

    getModuleData (name: string): ModuleData {
        const allData = this.get()

        const data = allData.get(name)
        if (data === undefined)
            throw new Error('Missing module data.')

        return ModuleData.createFromStoredObject(data)
    }

    addModuleData (moduleData: ModuleData): void {
        const allData = this.get()

        const name = moduleData.moduleDefinition.moduleInterface.name
        if (allData.has(name))
            throw new Error(`Module ${name} already exists.`)

        allData.set(name, moduleData.toStoredObject())

        this.set(allData)
    }

    updateModuleData (name: string, moduleData: ModuleData): void {
        const allData = this.get()

        if (!allData.has(name))
            throw new Error(`Module ${name} doesn't exists.`)

        const newName = moduleData.moduleDefinition.moduleInterface.name
        if (newName !== name)
            allData.delete(name)

        allData.set(name, moduleData.toStoredObject())

        this.set(allData)
    }

    deleteModuleData (name: string): void {
        const allData = this.get()

        allData.delete(name)

        this.set(allData)
    }

    moduleDataExists (name: string): boolean {
        const allData = this.get()

        return allData.has(name)
    }

    private set (value: StorageMap): void {
        this.storage.setItem(WebStorageModuleStorage.key, JSON.stringify(Object.fromEntries(value.entries())))
    }

    private get (): StorageMap {
        const allData = this.storage.getItem(WebStorageModuleStorage.key)
        if (allData === null)
            throw new Error('Missing module data.')

        const parsed = storageSchema.parseJson(allData)
        if (parsed instanceof ValidationError)
            throw parsed

        return new Map(Object.entries(parsed))
    }

    private reset (): void {
        this.set(new Map)
    }

    private init (): void {
        const allData = this.storage.getItem(WebStorageModuleStorage.key)
        if (allData === null)
            this.reset()
    }
}
