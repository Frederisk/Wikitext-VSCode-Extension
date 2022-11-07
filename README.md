<!-- markdownlint-disable MD033 -->
# Wikitext Markup Language Support Extension for Visual Studio Code

[![VSMarket: wikitext extension](https://vsmarketplacebadge.apphb.com/version/RoweWilsonFrederiskHolme.Wikitext.svg?color=blueviolet&logo=visual-studio-code&style=?style=for-the-badge)](https://marketplace.visualstudio.com/items?itemName=RoweWilsonFrederiskHolme.wikitext)
[![Open VSX: wikitext extension](https://img.shields.io/open-vsx/v/RoweWilsonFrederiskHolme/Wikitext?color=purple&label=Open%20VSX)](https://open-vsx.org/extension/RoweWilsonFrederiskHolme/wikitext)
[![GitHub: wikitext extension](https://img.shields.io/badge/GitHub-wikitext-yellow)](https://github.com/Frederisk/Wikitext-VSCode-Extension)
[![Toolhub: wikitext extension](https://img.shields.io/badge/Toolhub-wikitext_extension-36C)](https://toolhub.wikimedia.org/tools/wikitext-vscode-extension)

[![Build status](https://ci.appveyor.com/api/projects/status/25okygmf42atyvi0?svg=true)](https://ci.appveyor.com/project/Frederisk/wikitext-vscode-extension)
[![GitHub Actions CodeQL](https://github.com/Frederisk/Wikitext-VSCode-Extension/actions/workflows/codeql-analysis.yml/badge.svg/)](https://github.com/Frederisk/Wikitext-VSCode-Extension/actions?query=workflow%3ACodeQL)
[![CodeFactor Status](https://www.codefactor.io/repository/github/frederisk/wikitext-vscode-extension/badge)](https://www.codefactor.io/repository/github/frederisk/wikitext-vscode-extension)

[![Twitter: @rwfholme](https://img.shields.io/badge/twitter-%40rwfholme-blue)](https://twitter.com/rwfholme)
[![Patreon Donate](https://img.shields.io/badge/donate-patreon-orange)](https://www.patreon.com/rwfholme)

This Visual Studio Code Extension provides support of Wikitext Markup language. With this extension, you can more easily discover your grammatical problems through the marked and styled text. The plugin is based on MediaWiki's Wikitext standard, but the rules are somewhat stricter, which helps users write text that is easier to read and maintain.

Of course, the development of this extension is short, and there may be some errors in operation and labeling. If you find a problem, please report it to me immediately for resolution.

If you get help with this project, give this project a star or recommend it to others, thanks!😸

## Enhancement Tool: [Wikitext-Extension-Gadget](https://github.com/Frederisk/Wikitext-Extension-Gadget)

- Now you can add [Wikitext Extension Gadget](https://github.com/Frederisk/Wikitext-Extension-Gadget) as a user gadget on your wiki site. And you will get a button to open VSCode directly in your browser to edit the page!

    Go to the gadget's repository page to learn more.

    <img alt="Wikitext Extension Gadget" src="https://user-images.githubusercontent.com/29837738/127597149-5f44306a-a9ee-461a-8022-bd39f8ce3852.gif" width="768"/>

## Features

- Color and style annotations of Wikitext can make it easier for users to intuitively find problems in writing grammatical formats.

    <img alt="Code main page" src="https://user-images.githubusercontent.com/29837738/120096683-7a217900-c15f-11eb-9f9c-b4d77ecce486.png" width="768"/>

- Automatic matching and closing of simple parentheses reduces unnecessary double typing.

    <img alt="Code video" src="https://user-images.githubusercontent.com/29837738/120096717-a6d59080-c15f-11eb-9921-e5555de74f29.gif" width="768"/>

- The special comment syntax\(`<!--#region-->`&`<!--#endregion-->`\) can folds the code for easy reading.

    <img alt="Code region" src="https://user-images.githubusercontent.com/29837738/120096736-c076d800-c15f-11eb-8f70-7cfdd73a3307.gif" width="768"/>

- Press `Ctrl + Shift + V` or click the Preview icon in the title menu bar directly in the Wikitext content to get a parsed preview of Wikitext in the currently active text editor.

    <img alt="Code previewer" src="https://user-images.githubusercontent.com/29837738/120096761-ddaba680-c15f-11eb-8d14-f0705f7d39ba.gif" width="768">

- Enter `@[name]` to get a snippet of wikitext. Such as `@table`, `@region`, `@title`...

    <img alt="Code snippets" src="https://user-images.githubusercontent.com/29837738/120096799-0af85480-c160-11eb-8a34-f47603a41935.gif" width="768">

- You can modify the website content by logging in directly in VSCode! Enter the settings page, search Wikitext and find the username and password items, and fill in them. Then press `F1` in the text editor, select `Post your page to the website`!

- Obtain the Wikitext source code directly in VSCode according to the page name without opening the web page. Press `F1` and select `Pull page to edit` to use this function.

- Browse the page by entering the page name. Press `F1` then select `View the page`.

## Release Notes

- Added apostrophe surrounding pairs.
- VSCode minimum version requirements are now changed to 1.64.0 and above.
- Fixed extra line breaks when posting pages.
- Temporarily fixed incorrect bracket highlighting issue.

## Usage

### Usage Requirements

Please ensure that your VSCode version is higher than 1.64.0, this version requirements may change in the future.

Generally, make sure that your VSCode is always the latest version.

## Development

### Development Requirements

- [Node.js](https://nodejs.org) (with npm) at least v16.

### How to build this extension yourself

Firstly, clone this repository and change directory to the repository, then install VS Code Extension Manager and other packages:

```bash
npm install -g yarn vsce # VS Code Extension Manager
yarn install # Install devDependencies
```

Package this project and you will get a `.vsix` file:

```bash
vsce package --yarn # Package Extension with yarn
```

This is it!

## Special Thanks

- [caltaojihun](https://github.com/caltaojihun)
- [Jason Williams](https://github.com/jasonwilliams)
- [quicktype](https://github.com/quicktype)
- [dj radon](https://github.com/djradon)

<!-- ## Extension Settings
Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.
For example:
This extension contributes the following settings:
* `myExtension.enable`: enable/disable this extension
* `myExtension.thing`: set to `blah` to do something -->
<!-- ## Known Issues
Calling out known issues can help limit users opening duplicate issues against your extension. -->
