# CUI expandable
Version 1.0


### Description
Cui-expandable is an angular directive that allows for the easy creation of an element that collapses.

### Usage Example
#### Markup
```html
  <cui-expandable expanded="true">
    <cui-expandable-title ng-click="toggleExpand()">
      Not expanded
    </cui-expandable-title>
    <cui-expandable-body>
      Expanded
    </cui-expandable-body>
  </cui-expandable>
```
#### SCSS
```sass
cui-expandable {
  &-body {
    max-height: 0;
    overflow: hidden;
    transition: all 200ms ease-in-out;
  }

  &[expanded="true"] {
    >cui-expandable-body {
      max-height: 500px;
    }
  }
}
```
Note: These SCSS rules allow you to set an attribute on the `cui-expandable` element to show the expanded view by default. (`expanded="true"`)

### How it works / features
Everytime `toggleExpand()` gets fired from an element inside of the directive the `expanded` attribute will toggle. This, coupled with css rules allows the user to expand or collapse the view.
