import {ModuleData} from 'modules/module-data'

// TODO: Store history. (later)
// TODO: updateModuleData can rename the module.

export interface ModuleStorage {
    deleteAllModuleData (): void

    getAllModuleData (): ModuleData[]

    getModuleData (name: string): ModuleData

    getModuleData (name: string): void

    addModuleData (moduleData: ModuleData): void

    updateModuleData (name: string, moduleData: ModuleData): void

    deleteModuleData (name: string): void

    moduleDataExists (name: string): boolean
}
