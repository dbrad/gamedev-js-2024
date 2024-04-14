# Gamedev.js 2024 jam entry by David Brad

# About this project
- This project is written in TypeScript, and transpiled using the [esbuild](https://esbuild.github.io/) package.
- This project's build tools require [node.js](https://nodejs.org/en/download/) v20.5.1 or higher.
- This project makes use of the [yarn](https://yarnpkg.com/getting-started) package manager.
    - https://yarnpkg.com/getting-started/install
- The build tools are meant to be run on Windows, using a bash-like terminal such as Git Bash or WSL.

## This project uses a makefile to streamline the various build commands:
- ```make install``` - Installs all dependencies, and unzips some build tools from the tools.7z file included.
- ```make uninstall``` - Removes build folders, dist folders, node_modules, and tools.
- ```make dev``` - Development build process, puts the build into watch mode, and serves the game from "http://localhost:3000/".
- ```make release``` - Release build process, this will perform a single minified transpile, inline all code into the index.html, and zip the index.html and any other assets into "/dist/game.zip".
- ```make butler-deploy``` - Calls the itch.io "butler" CLI to upload the game.zip file to the itch.io project defined in the makefile.

<br />
<hr />
<br />

## Gamedev.js 2024 Jam Entry
### Copyright © 2024 David Brad
<br />
