import ModuleImplementation from 'modules/ModuleImplementation'

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
