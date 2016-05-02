#Off-click

[Extracted from here](https://github.com/TheSharpieOne/angular-off-click). It's like click, but when you don't click on your element.

### How to use
Here we have a slide out navigation div that will appear when the user clicks a button. We want the div to go away when they click off of it (`off-click`).  We also want to make sure the button that triggers the div to open, also does initial close it (`off-click-filter`).
```html
<button id="nav-toggle" off-click-filter="#slide-out-nav">Show Navigation</button>
<div id="slide-out-nav" ng-show="showNav" off-click="showNav = false" off-click-if="showNav">
    ...
</div>
```

The `off-click` attribute is the expression or function that will execute each time the user doesn't click on your element (or filter)<br />

The optional `off-click-if` attribute is an expression that will determine if the `off-click` should trigger or not.

The optional `off-click-filter` attribute is meant to be applied to elements that should _not_ trigger the off-click they point to, and should be a comma separated list of selectors (ex. `off-click-filter=".test-class,#test-id"`) that points at the elements that the `off-click` was added to.<br /> (In this example the button doesn't trigger the off-click on the element with the id `slide-out-nav`.
