import {ModuleData} from 'modules/module-data';

export class ModuleStorage {
    constructor (
        readonly storage: Storage
    ) {}

    // TODO: Store history. (later)

    deleteAllModuleData (): void {}
    getAllModuleData (): ModuleData[] {}
    getModuleData (name: string): ModuleData {}
    getModuleData (name: string): void {}
    addModuleData (moduleData: ModuleData): void {}
    // TODO: updateModuleData can rename the module.
    updateModuleData (name: string, moduleData: ModuleData): void {}
    deleteModuleData (name: string): void {}
    moduleDataExists (name: string): boolean {}
}
