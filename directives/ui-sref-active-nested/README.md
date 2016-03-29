# Ui-sref-active-nested
Version 1.0


## Description
Like [ui-sref-active](http://angular-ui.github.io/ui-router/site/#/api/ui.router.state.directive:ui-sref-active) but applies to sibbling states as well (requires UI-router).

## How to use

```html
    <span class="cui-desktop-menu__option" ui-sref="applications.myApplications" ui-sref-active-nested="active">Link to my apps</span>
```

This will apply the class `active` to the element everytime the user is in the state "applications" or any child state of applications (sibblings of applications.myApplications).
