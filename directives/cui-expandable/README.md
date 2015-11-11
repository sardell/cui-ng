# CUI expandable
Version 1.0


### Description
Cui-expandable is an angular directive that allows for the easy creation of an element that collapses.

### Usage Example
#### Markup
```html
  <cui-expandable class="expanded">
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

  &.expanded {
    >cui-expandable-body {
      max-height: 500px;
    }
  }
}
```
Note: These SCSS rules allow you to set a class on the `cui-expandable` element to show the expanded view by default. (`class="expanded"`)

### How it works / features
Everytime `toggleExpand()` gets fired from an element inside of the directive the `expanded` class will toggle. This, coupled with css rules allows the user to expand or collapse the view.
