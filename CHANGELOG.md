# CUI-NG Changelog

## Unreleased

### Added
* Added `custom-error-loading` attribute in the `custom-error` showcase example.

### Changed


### Fixed
* Fixed `custom-error` optional `custom-error-loading` attribute not working properly.


## [1.10.0] - 2016-10-10

### Added
* CUI-Paginate: By default, pagination will not display if results are below the first value in the interval array in app-config.json.

### Changed
* CUI-Paginate: paginationOptions now takes an object instead of an array.
* Adds new table of contents screen to use instead of side menus.
* Minor general styling for table of contents.
* Covisint logo on header.
* Added consistent documentation links to each directive demo.
* Paginate now hides itself if the results are less than the first item in the paginationOptions object.
* Directory restructure
    * Moved all directive showcase files into their own folders in `assets/app/directives-showcase/components`.
    * Each directive demo has their own state and controller instead of utilizing one master controller.
    * Demo factories are now split into their own files in `assets/app/directives-showcase/factories`.
    * Index has been broken down into more manageable files inside `assets/common-templates/index/`.
* Disabled side menus as they were not used anymore.
* Extracted directive demo styling into own scss files.
* Disables snap menu mouse dragging.

### Fixed
* Fixes browserSync grunt task to reload on all important markup files.
* Fixes match directive game not working properly.
* Fixes custom-error directive showcase error by removing the loader functionality for now.


## [1.9.20] - 2016-09-20

### Changed
* CUI-Paginate: Removes the default unicode characters (`<` and `>`) in favor of background images.

### Added
* CUI-Wizard: Adds new optional attribute `dirty-validation`. This revolves around showing input field errors when they are `$dirty` instead
of the default of `$touched`. This also done not work with an `ng-messages-include=""`. This sets all input fields as `$dirty` when clicking the next button.
