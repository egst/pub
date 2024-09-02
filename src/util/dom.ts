type HtmlTagName = keyof HTMLElementTagNameMap
type HtmlElement <Tag extends HtmlTagName | undefined> = Tag extends HtmlTagName
    ? HTMLElementTagNameMap[Tag]
    : HTMLDivElement

type EventType = keyof HTMLElementEventMap
export type EventHandler <Type extends EventType = EventType> =
    (this: HTMLElement, event: HTMLElementEventMap[Type]) => unknown
type EventListenersRecord = {[Type in EventType]?: EventHandler<Type>}

type CssDeclaration = Omit<Partial<CSSStyleDeclaration>, 'length' | 'parentRule'>
type CssProperty = keyof CssDeclaration

interface ElementAdjustmentOptions <Elem extends HTMLElement> {
    details?:        (element: Elem) => void,
    text?:           string,
    value?:          string,
    classes?:        string[],
    children?:       Element[],
    parent?:         Node,
    eventListeners?: EventListenersRecord,
    style?:          CssDeclaration,
    hidden?:         boolean
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
 * ```TS
 * adjustElement(
 *     new Button,
 *     text: 'Click me!',
 *     value: 'Value',
 *     classes: ['button', 'primary'],
 *     children: [new Icon],
 *     parent: [container],
 *     eventListeners: {
 *         click: event => { event.preventDefault() }
 *     },
 *     style: {
 *         backgroundColor: 'black',
 *         color: 'white'
 *     },
 *     hidden: true,
 *     details: element => {
 *         element.style.color = 'white'
 *     }
 * )
 * ```
 */
export const adjustElement = <Target extends HTMLElement> (
    element: Target,
    options: ElementAdjustmentOptions<Target>,
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
    if (options.style !== undefined)
        for (const [property, value] of Object.entries(options.style))
            // TODO
            element.style[property] = value
    if (options.hidden === true)
        element.hidden = true
    return element
}

/**
 * Create an HTML element and adjust it if needed.
 *
 * @see adjustElement
 *
 * Example:
 *
 * ```TS
 * createElement({
 *     tag: 'p',
 *     text: 'lorem ipsum'
 * })
 *
 * createElement({
 *     // <div> by default.
 *     children: [new Button]
 * })
 * ```
 */
export const createElement = <Tag extends HtmlTagName | undefined = undefined> (
    options: {tag?: Tag} & ElementAdjustmentOptions<HtmlElement<Tag>>
): HtmlElement<Tag> => {
    return adjustElement(
        document.createElement(options.tag ?? 'div') as HtmlElement<Tag>,
        options
    )
}
