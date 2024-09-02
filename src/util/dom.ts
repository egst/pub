type EventType = keyof HTMLElementEventMap
type EventHandler <Type extends EventType = EventType> =
    (this: HTMLElement, event: HTMLElementEventMap[Type]) => any
type EventListenersRecord = {[Type in EventType]?: EventHandler<Type>}

interface ElementAdjustmentOptions {
    details?:        (element: HTMLElement) => void,
    text?:           string,
    classes?:        string[],
    children?:       Element[],
    parent?:         Node,
    eventListeners?: EventListenersRecord
}

/**
 * Adjust an existing HTML element.
 *
 * The passed element is mutated and also returned.
 * This can sometimes allow a nicer syntax without creating helper variables.
 *
 * For some of the commonly used HTMLElement API, you can use dedicated options.
 * For other API, you can use the details option to perform any change in a passed function.
 *
 * Example:
 *
 * adjustElement(
 *     new Button,
 *     text: 'Click me!',
 *     classes: ['button', 'primary'],
 *     children: [new Icon],
 *     parent: [container],
 *     eventListeners: {
 *         click: event => { event.preventDefault() }
 *     },
 *     details: element => {
 *         element.style.color = 'white'
 *     }
 * )
 */
export const adjustElement = <Target extends HTMLElement> (
    element: Target,
    options: ElementAdjustmentOptions,
): Target => {
    if (options.details !== undefined)
        options.details(element)
    if (options.text !== undefined)
        element.innerText = options.text
    if (options.classes !== undefined)
        element.classList.add(...options.classes)
    if (options.children !== undefined)
        element.replaceChildren(...options.children)
    if (options.parent !== undefined)
        options.parent.appendChild(element)
    if (options.eventListeners !== undefined)
        for (const [type, listener] of Object.entries(options.eventListeners))
            element.addEventListener(
                type     as EventType,
                listener as EventHandler
            )
    return element
}

/**
 * Create an HTML element and adjust it if needed.
 *
 * @see adjustElement
 *
 * Example:
 *
 * createElement({
 *     tag: 'p',
 *     text: 'lorem ipsum'
 * })
 *
 * createElement({
 *     // <div> by default.
 *     children: [new Button]
 * })
 */
export const createElement = (options: {tag?: string} & ElementAdjustmentOptions) => {
    return adjustElement(
        document.createElement(options.tag ?? 'div'),
        options
    )
}
