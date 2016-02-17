# Class toggle
Version 1.0

### Description
Class toggle allows you to easily toggle a class on an element from any user interaction (input, click, etc.) on that element or any of it's children.

### Usage Example
#### Markup
```html
  <div class="my-div class-toggle" toggled-class="my-div--bold" ng-click="toggleClass()">
    <span>I will be bold when you click anywhere in this element.</span>
  </div>
```

`class-toggle` can be added to the element as a class (same as example above) or as the name of that tag (meaning you can use `<class-toggle></class-toggle> rather than <div></div>`).

### How it works / features
Everytime `toggleClass()` gets fired from an element inside of the directive the `toggled-class` class will toggle. You also get a scope variable called `toggled` that you can use to manipulate other elements within the expandable (if toggled is true, it means that the element has the toggled-class).
You can also use `toggleOn()` or `toggleOff()` to only add or remove the class from the element, respectively.
