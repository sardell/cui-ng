# CUI-NG Changelog

## Unreleased

### Added
* Adds new table of contents screen to use instead of side menus.
* Minor general styling for table of contents.

### Changed
* Directory restructure
    * Moved all directive showcase files into their own folders in `assets/app/directives-showcase/components`.
    * Each directive demo has their own state and controller instead of utilizing one master controller.
    * Demo factories are now split into their own files in `assets/app/directives-showcase/factories`.
    * Index has been broken down into more manageable files inside `assets/common-templates/index/`.
* Disabled side menus as they were not used anymore.

### Fixed
* Fixes browserSync grunt task to reload on all important markup files.


## [1.9.20] - 2016-09-20

### Changed
* CUI-Paginate: Removes the default unicode characters (`<` and `>`) in favor of background images.

### Added
* CUI-Wizard: Adds new optional attribute `dirty-validation`. This revolves around showing input field errors when they are `$dirty` instead
of the default of `$touched`. This also done not work with an `ng-messages-include=""`. This sets all input fields as `$dirty` when clicking the next button.
