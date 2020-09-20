# Wikitext Markup Language Support for Visual Studio Code

[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](https://raw.githubusercontent.com/Frederisk/Wikitext-VSCode-Extension/master/LICENSE.txt)
[![Twitter: @rwfholme](https://img.shields.io/badge/twitter-%40rwfholme-blue)](https://twitter.com/rwfholme)
[![VSMarket: wikitext](https://img.shields.io/badge/Visual%20Studio%20Market-wikitext-blueviolet)](https://marketplace.visualstudio.com/items?itemName=RoweWilsonFrederiskHolme.wikitext)
[![Github: wikitext](https://img.shields.io/badge/Github-wikitext-green)](https://github.com/Frederisk/Wikitext-VSCode-Extension)
[![Build status](https://ci.appveyor.com/api/projects/status/25okygmf42atyvi0?svg=true)](https://ci.appveyor.com/project/Frederisk/wikitext-vscode-extension)
[![CodeFactor](https://www.codefactor.io/repository/github/frederisk/wikitext-vscode-extension/badge)](https://www.codefactor.io/repository/github/frederisk/wikitext-vscode-extension)

This Visual Studio Code Extension provides support of Wikitext Markup language. With this extension, you can more easily discover your grammatical problems through the marked and styled text. The plugin is based on MediaWiki's Wikitext standard, but the rules are somewhat stricter, which helps users write text that is easier to read and maintain.

Of course, the development of this extension is short, and there may be some errors in operation and labeling. If you find a problem, please report it to me immediately for resolution.

## NEW FEATURES

- Now you can modify the website content by logging in directly in VSCode! Enter the settings page, search Wikitext and find the username and password items, and fill in them. Then press `F1` in the text editor, select `Write your page to the website`!

- Obtain the Wikitext source code directly in VSCode according to the page name without opening the web page. Press `F1` and select `Read page to edit` to use this function.

- Browse the page by entering the page name. Press `F1` then select `View the page`.

## Features

- Color and style annotations of Wikitext can make it easier for users to intuitively find problems in writing grammatical formats. <br />
<img src="./.asset/Code-mainPage.png" width="500"/>

- Automatic matching and closing of simple parentheses reduces unnecessary double typing. <br />
<img src="./.asset/Code-video.gif" width="500"/>

- The special comment syntax\(`<!--#region-->`&`<!--#endregion-->`\) can folds the code for easy reading. <br />
<img src="./.asset/Code-region.gif" width="500"/>

- Press `Ctrl + Shift + V` directly in the Wikitext content to get a parsed preview of Wikitext in the currently active text editor.<br />
<img src="./.asset/Code-previewer.gif" width="500">

- Enter `@[name]` to get a snippet of wikitext. Such as `@table`, `@region`, `@title`...<br />
<img src="./.asset/Code-snippets.gif" width="500">

## Requirements

Please ensure that your VSCode version is higher than 1.43.0, this version requirements may change in the future.

Generally speaking, make sure that your VSCode is always the latest version.

## Release Notes

- The push and pull features for editing. Now you can modify the website content by logging in directly in VSCode.
- Added support for header parsing in Perviewer.
- Added View Page feature.
- Added the javascript toggle switch support for Previewer and API Path Setting.
- Javascript support for Previewer is disabled by default.
- Support for Redirect rendering and some other magic words.
- All of Behaviour Switches will now act as `constant.language` instead of `keywords`.
- Adjusted the program structure and optimized performance.
- Improved some functions.
- Corrected some programming logic errors.

## Special Thanks

### The help of

[caltaojihun](https://github.com/caltaojihun), [Jason Williams](https://github.com/jasonwilliams), [quicktype](https://github.com/quicktype)
<!-- ## Extension Settings
Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.
For example:
This extension contributes the following settings:
* `myExtension.enable`: enable/disable this extension
* `myExtension.thing`: set to `blah` to do something -->
<!-- ## Known Issues
Calling out known issues can help limit users opening duplicate issues against your extension. -->
