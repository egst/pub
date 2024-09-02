import {ModuleImplementation} from 'modules/module-implementation'

declare global {
    interface Window {
        pub: {
            ModuleImplementation: typeof ModuleImplementation,
        }
    }
}

window.pub = {
    ModuleImplementation,
}
