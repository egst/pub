import {Application} from 'modules/application'

import {WebStorageModuleStorage} from 'modules/storage/web-storage-module-storage'

document.addEventListener('DOMContentLoaded', () => {
    const rootContainer = document.querySelector('body')
    if (rootContainer === null) {
        console.error('Missing root container element.')
        return
    }

    const app = new Application(
        new WebStorageModuleStorage(localStorage),
        rootContainer
    )

    app.load()
    app.activate()
})
