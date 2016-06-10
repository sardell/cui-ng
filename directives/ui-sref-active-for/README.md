# Ui-sref-active-for
Version 1.0


## Description
Apply class to the element if the state of the app is nested or equal to the attribute passed (can disregard ui-sref completely)

## How to use

```html
    <span class="cui-desktop-menu__option" ui-sref-active-for="state" ui-sref-active-classes="active, other-active-class">Link to my apps</span>
```

This will apply the classes `active` and `other-active-class` to the element everytime the user is in the state "state" or any of it's child states.
