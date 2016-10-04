# CUI-NG Changelog

## Unreleased

### Added
* CUI-Paginate: By default, pagination will not display if results are below the first value in the interval array in app-config.json.

### Changed
* CUI-Paginate: paginationOptions now takes an object instead of an array.

## [1.9.20] - 2016-09-20

### Changed
* CUI-Paginate: Removes the default unicode characters (`<` and `>`) in favor of background images.

### Added
* CUI-Wizard: Adds new optional attribute `dirty-validation`. This revolves around showing input field errors when they are `$dirty` instead
of the default of `$touched`. This also done not work with an `ng-messages-include=""`. This sets all input fields as `$dirty` when clicking the next button.
