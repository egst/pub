import 'pub' // window.ModuleImplementation

import * as util from 'util'

import {ModuleImplementation} from 'modules/module-implementation'

export const evaluateDefinition = (definition: string): ModuleImplementation => {
    const Module: unknown = eval(`(${definition})`)
    if (!util.isSubclass(Module, ModuleImplementation)) {
        throw new Error('Wrong type of module implementation. It must extend window.ModuleImplementation.');
    }

    return Module
}
