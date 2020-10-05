# Change Log

All notable changes to the "Wikitext" extension will be documented in this file.

The version marked with an asterisk(&ast;) means that the version has been adjusted internally and has not been released.
<!-- Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file. -->

## [Todo List]

- Improve the advanced features of Wikitext preview.
- Adjust the UI to make it easier for users to use Wikitext preview.
- Find and fix more syntax highlighting issues.
- Add the function of quick citation to references.

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
- Support for header parsing in Perviewer.
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

- Fixed some typo and other details.
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

- Built for Visual Studio Code ^1.41.0
- Establish basic language support.

<!--
Added 新功能。
Changed 現有功能的更改。
Deprecated 用於即將刪除的功能。
Removed 現在刪除了功能。
Fixed 任何錯誤修復。
Security 以防出現漏洞。
-->
