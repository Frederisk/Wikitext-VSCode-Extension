<!-- markdownlint-disable MD024 -->
# Change Log

All notable changes to the "Wikitext" extension will be documented in this file.

(The version marked with an asterisk(&ast;) means that the version has been adjusted internally and has not been released.)<!-- http://keepachangelog.com/ -->

## [3.7.0] - 2022-11-07

### Added

- Added apostrophe surrounding pairs.

### Changed

- VSCode minimum version requirements are now changed to 1.64.0 and above.

### Fixed

- Fixed extra line breaks when posting pages.
- Temporarily fixed incorrect bracket highlighting issue.

## [3.6.5] - 2022-07-29

### Added

- Added MediaWiki version checking in pullPage.
- Added Scribunto to lua mapping.

### Changed

- Enhanced table syntaxes.

## [3.6.4] - 2022-04-07

### Changed

- Modified how some input boxes interacts.

### Fixed

- Error with pushing changes when there is a number in the tags.
- Some errors in Wikitext syntax.

## [3.6.3] - 2022-02-05

### Added

- Now Wikitext Extension is available in Open VSX.
- Added `sanitized-css` support.
- Added more snippets.

### Changed

- Adjusted the syntax priority.
- Enhanced bracket matching.

### Fixed

- Fixed some security issues.

## [3.6.2] - 2021-12-16

### Added

- LaTeX syntax support for `<math>` tags.

### Fixed

- The syntax error that caused `<ref />` and `<nowiki />` to fail to close.

## [3.6.1] - 2021-11-27

### Added

- When page is not exist, the extension will ask if still open document to create new page.
- The post function will try to add `WikitextExtensionForVSCode` tag in the edit history.

### Fixed

- Fixed the bug that user edit summary cannot be posted.

## [3.6.0] - 2021-11-02

### Added

- Add a command to close editor without saving.
- Add the option of auto login.
- Add option to allow skip filling in page title.

### Changed

- Change the base syntax from XML(XHTML) to HTML.

### Fixed

- Remove ansi-regex dependency to potential security vulnerabilities.

## [3.5.0] - 2021-09-24

### Added

- PageInfo support for the file of CSS, JavaScript, Lua, etc.
- Added PageInfo syntax.

### Changed

- Enhanced info message of pull page function.
- Clearer error prompts.

### Fixed

- Errors about syntax.
- Some bugs of web cite method.

## [3.4.0] - 2021-07-30

### Added

- The function of pulling pages through URI.
- The function of displaying the action status through the status bar.

### Fixed

- Some typos.

## [3.3.0] - 2021-05-30

### Added

- Table caption syntax.
- `<ref>` tag synax.

### Changed

- Enhanced URI view page function.
- Some of textmate scopes.
- Turn part of the analysis into a built-in language extension that depends on VSCode such as XML and JSON.
- The extension will be activated when language is set to wikitext to speed up user commands.
- Removed unnecessary assets.

### Fixed

- Errors about XML syntax.

## [3.2.4] - 2021-03-18

### Added

- More snippets and auto closing pairs.
- Provided CSS adjustment support for Previewer.

## [3.2.3] - 2020-12-28

### Added

- Optional for transfer protocol.
- Support of pull function for old version mediawiki.

### Changed

- Adjust the conversion period of some interfaces to runtime. Incorrect JSON format will be thrown error.

### Fixed

- Some logic errors.

## [3.2.2] - 2020-12-12

### Added

- The function of quick citation to references.

### Fixed

- Some typos in the setting and command name.

## [3.2.1] - 2020-12-10

### Added

- Preview icon in the title menu bar.

### Changed

- Logic optimization and detailed problem correction. (Viewer and getHost)

### Fixed

- PAGE_INFO part is output in preview because of a mistake.

## [3.2.0] - 2020-12-08

### Added

- Categories view.

### Changed

- Optimized the packaging structure.
- URI can make extension activate now.

### Removed

- The setHost command has been removed, you should use Settings instead.

### Fixed

- CSS & image rendering.
- Some syntaxes errors, such as: Template, Patterns,Bare ampersand, and Tag Stuff.

## [3.1.1] - 2020-10-07

### Added

- Pre-added support for URI invocation, but no official functions have been added yet.

### Changed

- Disabled edit section links in preview.
- Removed some unusable code to improve performance.

### Fixed

- With PST turned on, Substituted templates, signatures, etc. can now be rendered correctly.
- Modified the operation logic of GetHost.
- Some syntaxes errors, such as: Template, Patterns,Bare ampersand, and Tag Stuff.

## [3.1.0] - 2020-10-05

### Added

- Redirect snippet.
- More Magic Words supports.
- ISBN/RFC/PMID supports.

### Changed

- Modified some command names.
- The View, Preview, and Pull functions will now first try to use the login account to execute.

### Fixed

- Fixed the problem of incomplete logout.

## [3.0.0] - 2020-09-20

### Added

- Added View Page feature.

### Changed

- Improved some functions.

## [2.3.0]\* - 2020-08-09

### Added

- Support for Redirect rendering.
- Support for some other magic words.
- The push and pull features for editing. Now you can modify the website content by logging in directly in VSCode.
- API Path Setting.
- Support for header parsing in Previewer.
- Javascript toggle switch support for Previewer.

### Changed

- All of Behaviour Switches will now act as `constant.language` instead of `keywords`.
- Adjusted the program structure and optimized performance.
- Javascript support for Previewer is disabled by default.

### Fixed

- Corrected some programming logic errors.

## [2.2.1] - 2020-07-10

### Added

- Added more snippets.

### Changed

- Now, the setting of host have been migrated to the Settings page.

### Fixed

- Fixed some typos and other details.
- Fixed an issue where the dialog for changing host would not appear.

## [2.2.0] - 2020-05-19

### Added

- Added the support of JSON for Graph and Templatedata tags.
- Support preparation for CSS.

### Changed

- Changed the rendering of word conversion.

### Fixed

- Bold and italic closing conditions.

## [2.1.2]\* - 2020-05-13

### Fixed

- Some typos.

## [2.1.1] - 2020-05-13

### Added

- Nowiki tags support.

### Fixed

- Some rendering issues.

## [2.1.0] - 2020-04-29

### Added

- Added more snippets and bracket support.

### Changed

- Changed the minimum version requirements.
- Added rule to capture keyword.operator.
- Improve syntax for internal link and template.

### Fixed

- Fixed Some typos.
- Fixed pattern for tag issues.
- Fixed Some mistakes of Template.

## [2.0.1]\* - 2020-04-04

### Fixed

- Some mistakes of Template and Internal Link rendering.

## [2.0.0] - 2020-03-30

### Added

- Wikitext preview now supports host changes.
- Added support for some code snippets.
- Added several parenthesis auto-closing rules.

### Changed

- Changed preview API from flow-parsoid-utils to parse.

### Security

- Updated minimist to prevent a known security vulnerability.

### Fixed

- Fixed some issues with brackets closing automatically.
- Fixed some rendering issues in table syntax.

## [1.1.3]\* - 2020-03-14

### Added

- Chinese Wikipedia Wikitext preview via flow-parsoid-utils feature has been added.

## [1.1.2]\* - 2020-02-23

### Added

- Node.js & WebPack environments.
- `Hello World` test command.

### Fixed

- Some mistakes of Template arguments rendering.

## [1.1.1] - 2020-02-22

### Added

- Added support for Signature.

### Fixed

- Fixed an issue where the Template name rendering function was removed.
- Space characters are no longer needed between Magic Words.

## [1.1.0] - 2020-02-18

### Added

- Added the extension icon.
- Added more description of this extension.

### Fixed

- Addressed some issue with template and internal link rendering.

## [1.0.0] - 2020-02-06

### Added

- Initial Release.
- Published to GitHub.
- Added new extended name support.

## [0.6.1]\* - 2020-02-02

### Fixed

- Fixed some mistakes about license.

## [0.6.0]RC - 2020-02-02

- Candidate Release.

### Added

- Added some useful auto-closing content.

### Changed

- Open source under the MIT license.

## [0.5.0]&alpha; - 2020-02-02

- Alpha Release.

### Added

- Special support for chinese charcters.

## [0.4.0]\* - 2020-02-02

### Added

- Wrote the __README__ File.
- Added Table support.
- Color rendering support for template content.

### Fixed

- Fixed some errors of Internal Link.

### Changed

- Adjusted rendering order.

## [0.3.0]\* - 2020-02-01

### Added

- Add External Link support.

### Fixed

- Fixed some errors of Internal Link.

## [0.2.0]\* - 2020-01-31

### Added

- Wikitext Internal Link now supports with richer color markers.
- List highlight.
- Support for bold and italics.

### Changed

- The heading no longer closes automatically, and there must be at least one content character in the heading.

### Fixed

- In XHTML block comments, \\--\[^>\]\\ no longer reports an error.
- Fixed some rendering syntax errors.

## [0.1.1]\* - 2020-01-30

### Added

- Added Wikitext Template support.
- Added Wikitext Internal Link support.

### Changed

- Revised parsing of comments.

## [0.1.0]\* - 2020-01-29

### Added

- Added support for XHTML.
- Updated __CHANGELOG__ file. After that, the file will be continuously updated.

## [0.0.1]\* - 2020-01-28

### Added

- Built for Visual Studio Code ^1.41.0.
- Establish basic language support.

<!--
Added 新功能。
Changed 現有功能的更改。
Deprecated 用於即將刪除的功能。
Removed 現在刪除了功能。
Fixed 任何錯誤修復。
Security 以防出現漏洞。
-->
