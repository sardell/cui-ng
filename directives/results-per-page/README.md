# Results Per Page Directive
Version 1.0

## Description
Results Per Page is an angular directive made to be used with ngPagination.

## How to use
* You must have the `cui-ng` module injected as a dependency into your angular app.

**Basic HTML Use**
```
<results-per-page selected="app.currentSelectedValue"></results-per-page>
```
  * Pass in a scope variable to selected that will hold the current selected value.

**Custom Classes**
```
<results-per-page wrapper-class="wrapperDivClass" select-class="selectElementClass" selected="app.currentSelectedValue"></results-per-page>
```
  * Passing in ```wrapper-class="wrapperDivClass"``` will apply this class name to the wrapper div.
  * Passing in ```wrapper-class="selectElementClass"``` will apply this class name to the select element.

**Note**: If no custom class names are passed they will default to:
  * ```wrapper-class="cui-select-wrapper"```
  * ```select-class="cui-select"```
