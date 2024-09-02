# Code Style Conventions

## Snake Case File Names

All files & directories must be named with `snake-case` except for:

* `node_modules`

## No Default Exports

All exports must be named.

## Avoid Import Aliases

Imports shouldn't be renamed.

## No Relative Imports

All imports must be absolute.

```TS
import {Bar} from 'foo/bar' // OK
import {Bar} from './bar'   // Wrong
import {Bar} from '../bar'  // Wrong
```

## Naming

All types and classes (constructor functions) must be named
with `PascalCase`. All other values (including functions,
constants, and enum cases) must be named with `camelCase`.

```TS
class Foo {}
interface Bar {}
type FooBar = Foo | Bar

const foo = new Foo
let bar: Bar = {}
const f = () => new Foo
enum Goo {
    doo,
    koo
}
```

## Imports Order

TODO

## Use Only Arrow Functions

Only arrow functions (`() => {}`) must be used.

Never use function definition statements (`function f () {}`)
or expressions (`function () {}`).

Traditional class methods syntax is OK including getters and setters.

## Avoid Semicolons

Do not end statements with a semicolon unless they're on the same line.

In cases where a semicolon is necessary, put it on the beginning of a line.
Avoid these cases though, they're almost never necessary.

```TS
foo
;(bar)

foo
;[bar]
```

## Avoid Multiple Statements on a Single Line

Short statements on a same line might be OK in some cases but generally avoid them.

```TS
const f = () => { foo(); return bar }
```

## Prefer Const over Let

Only use `let` when absolutely necessary.

Prefer helper functions that return that value right away.

```TS
// Avoid:
let x
try {
    x = JSON.parse(foo)
} catch (error) {
    handle(error)
}
process(x)

// Prefer:
const parse = (foo) => {
    try {
        return JSON.parse(foo)
    } catch (error) {
        handle(error)
    }
}
const x = parse(foo)
process(x)
```

## Avoid Any

Avoid the `any` type unless absolutely necessary.

Prefer `unknown` or `never`.

```TS
// OK:
const parsed: unknown = JSON.parse(foo)

// Avoid:
const foo = (f: (...args: any[]) => any) => {
    const x: number = f(1, 'foo') // No errors because of any.
}

// OK:
const foo = (f: (...args: never[]) => unknown) => {
    f(1, 'foo') // Error: Cannot assign number or string to never.
    const x: number = f() // Error: Cannot assign unknown to number.
}

// OK:
const foo = (f: (number, string) => number) => {
    const x: number = f(1, 'foo')
}
```

## Function Definition Spacing

```TS
const f = (foo: Foo, bar: Bar): Baz => {
    // ...
}

class Foo {
    bar (goo: Goo): Doo {
        // ...
    }

    get doo (): Doo {
        // ...
    }

    goo: (): Goo => {
        // ...
    }
}
```

## Operators Spacing

```TS
const foo = bar === 'bar'
    && !baz
    && !bap
```
