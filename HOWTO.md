# How to
This is a very brief documentation about setting-up the project and some documentation about libraries used. This is by no means a full explanation
about how everything works, just personal notes to my future self in case he doesn't remember what he did here that may also be useful to others.

## Setting up
* Install the IDE of your choice to edit (mainly) Javascript files. I recommend [Visual Studio Code](https://code.visualstudio.com/).
* Install [nvm](https://github.com/nvm-sh/nvm#installing-and-updating), which is a `Node.js` version manager that we use to control which version of `node` we want to use in the project. This could be omitted, but it's usually a good idea to do this to isolate the project's version and dependencies from the global `node` installation that a user may have.
* Go to the project's root folder and run the following command to install the `node` version that the project uses:
```sh
nvm install
```
This will pick up the version defined in `.nvmrc` and install it automatically. This will also mark the version as the active `node` version for this terminal session.
* While in the root folder, install the project's dependencies:
```sh
npm install
```
This will pick all the dependencies defined in `package-lock.json` and `package.json`and install them for you.

## Environment variables
* Loaded via `.env` file in local, Check `dotenv` dependency docs for details: https://www.npmjs.com/package/dotenv
* Loaded as environment variables in CI, set them up there
* `GITHUB_TOKEN`: GitHub personal access token with no special scopes. Needed to fetch repo info with `@octokit/rest`

## Daily usage
* Set-up the `node` version with nvm for the current terminal session:
```sh
nvm use
```

If the command prompts you to install a new version, just run:
```sh
nvm install
```
and it will install and use said version for the current terminal session.
* If you want to avoid having to do the `nvm use` step every time you want to deploy, configure your shell for automatic loading of the `.nvmrc` file checking the instructions [here](https://github.com/nvm-sh/nvm#deeper-shell-integration). 
It is recommended to use the recipes that the nvm team provides (you may have to add [this fix](https://github.com/nvm-sh/nvm/pull/2167) too for `bash` shells).
* To build the README, just call
```sh
npm run generate_readme
```
`generate_readme` is a script defined in `package.json`

## Templates
* Read `mustache` docs: https://mustache.github.io/

## RSS parsing
* Seemed simple enough for our use case (getting posts from Medium). 
* Check `rss-parser` docs: https://www.npmjs.com/package/rss-parser

## Configure linting and code prettifier
* Review `ESLint` docs: https://eslint.org/docs/user-guide/getting-started
* Review `prettier` docs: https://prettier.io/docs/en/install.html
  * Add configuration in `.prettierrc.json`
  * If using ESLint, add support for `prettier`, explained in `prettier` docs
* Add the scripts to `package.json` so we can run them in a single `npm run` command

## Configure pre-commit hooks
* Review `pre-commit` docs: https://www.npmjs.com/package/pre-commit. I could have used `husky` https://www.npmjs.com/package/husky, but this seemed simple enough
* Check `lint-staged` docs: https://www.npmjs.com/package/lint-staged
* Config `lint-staged` in `package.json` so it runs commands in `js` files 
* Add `pre-commit` script in `scripts` block in `package.json` that invokes `npx lint-staged`
* Invoke `pre-commit` script in `pre-commit` block in `package.json`

## Releases and version bumping
* Version management is already bundled in `npm` with `npm-version`: https://docs.npmjs.com/cli/version. This can create a commit with metadata changes based on git tags
* Bump the version with `npm version [major|minor|patch]`
* You can set-up `preversion`, `version` and `postversion` scripts to execute tasks in these stages of version generation
* You can customize prefix addition in version, or version bump commit message with `.npmrc`: https://docs.npmjs.com/misc/config#tag-version-prefix
