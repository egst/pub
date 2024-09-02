# Code Style Conventions

## Snake Case File Names

All files & directories must be named with `snake-case` except for:

* `node_modules`

## No Default Exports

All exports must be named.

## Avoid Import Aliases

Imports shouldn't be renamed.

## Avoid Aggregate Exports

Prefer exporting individual items over aggregating them to simulate namespaces.

```TS
export { // Wrong
    foo: ...,
    bar: ...
}

export const foo = ... // OK
export const bar = ... // OK
```

To avoid importing each item individually, import them all with an alias:

```TS
import * as foobar from 'foobar'

foobar.foo
foobar.bar
```

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

* Separate into sections with empty lines by the last directory.
* Put sections for special directories first, in the following order:
  1. util
  2. config
* Sort the sections by the import path up to the last directory.
* Put asterisk imports first in each section.
* Sort the imports in the sections by the file name, then by the imported item.
* Align imports horizontaly by the `from` keyword.
* Use full paths relative to the `src/` directory.
* Use single quotes.
* Import one item at a time.
* Don't put spaces inside the braces.
* Name asterisk imports the same as the file name.
* Resolve conflicts as necessary.

```TS
import * as dom  from 'util/dom'
import * as util from 'util/util'
import {Schema}  from 'util/validation'

import * as check from 'util/validation/check'

import {Config}      from 'config/config'
import {ConfigError} from 'config/config-error'

import {Doo} from 'doo'

import * as bab from 'goo/bab'
import {Baz}    from 'goo/baz'

import {Boo} from 'goo/bap/boo'

import * as bap from 'koo/bap'
import * as dap from 'koo/dap'
import {Bar}    from 'koo/bar'
import {Foo}    from 'koo/foo'
```

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
