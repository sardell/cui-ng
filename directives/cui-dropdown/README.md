# CUI-Dropdown
Version 1.0


### Description
Cui-dropdown generates a dropdown with the help of tether.

### Usage Example

```html
  <cui-dropdown options="app.options" return-value="option.name" display-value="(option.name | cuiI18n)" ng-model="app.selectedOption"></cui-dropdown>
```

### Optional attributes

 * `class`: (default 'cui-input') Class or classes to be applied to the div that holds the selected value
 * `dropdown-class`: (default 'cui-dropdown') Class to be applied to the dropdown
 * `dropdown-item-class`: (default 'cui-dropdown__item') Class to be applied to each item in the dropdown
 * `attachment`: (default 'top middle') Tether attachment
 * `target-attachment`: (default 'bottom middle') Tether target attachment
 * `offset`: (default '0 0') Tether offset
 * `returnValue`: (default 'option') This is what gets assigned to ng-model. If left default it passes the whole object that got selected.
 * `displayValue`: (defaul 'option') This is what gets shown in the dropdown and in the box that holds the current value. Can be any property from the selected object (`display-value="option.name"`) or even use a filter (`display-value="(option.name | cuiI18n)"`). NOTE: If you are using a filter follow the parenthesis syntax.
