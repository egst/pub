## Abstract

Experience:

People are able to use chat based interaction with LLMs
to create simple scripts for personal utilities and automations
with a GUI performing actions like file and document manipulation,
content generation etc.

Problems:

1. It requires a lot of tuning and feedback for adjustments and fixes.
2. It becomes very difficult to expand and maintain as the complexity of the utility grows.

Solutions:

1. Incorporate feedback from the user and runtime and/or compilation errors into the process.
2. Separate the program into self-contained modules with defined interface.

## Modules

Each module is contained in a GUI box that can be resized,
dragged and positioned in the layout of the final program.
Each module defines it's input, output and state.

## Implementation & Runtime

The first version will be implemented as a web application
and later it can be ported to a native Deno application.


