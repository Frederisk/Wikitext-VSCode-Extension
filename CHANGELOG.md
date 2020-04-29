# Change Log

All notable changes to the "Wikitext" extension will be documented in this file.

The version marked with an asterisk(&ast;) means that the version has been adjusted internally and has not been released.
<!-- Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file. -->

## [Unreleased]
- Improve the advanced features of Wikitext preview.
- Adjust the UI to make it easier for users to use Wikitext preview.
- Find and fix more syntax highlighting issues.

## [2.1.0] - 2020-04-29
## Added
- Added more snippets and bracket support.

## Changed 
- Changed the minimum version requirements.
- Added rule to capture keyword.operator.
- Improve syntax for internal link and template.

## Fixed
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
