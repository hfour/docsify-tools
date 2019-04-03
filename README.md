# docsify-tools

There are some tools that make it easier to use docsify and typescript's api-extractor

### docsify-init

Usage:

    docsify-init [-r repoDir] [-d docsDir]

Initializes docsify in the specified repo and docs sub-directory. By default, the repo is the
current directory and the subdirectory is "docs".

You can use `docsify-init . .` to initialize in a pure-documentation repo.

### docsify-auto-sidebar

Generates a new _sidebar.md for docsify. You can prefix directories with a number and a dash to
control the ordering, the number and dash will not appear in the sidebar text. For example:

    1-Guides
    2-API

will result with "Guides" and "API" items in the sidebar.

Other dashes will be replaced with spaces

### generate-ts-doc

Like api-documenter, but it doesn't generate separate files for methods or properties.

    generate-ts-doc markdown -i docs/2-API -o docs/2-API
