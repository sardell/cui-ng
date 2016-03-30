# CUI Avatar
Version 1.0


### Description
Cui-avatar is a directive that inserts the user's avatar into the background of the div it's applied to.

### Usage Example
```html
  <div cui-avatar="app.appUser.avatar" cui-avatar-names="app.appUser.names" cui-avatar-color-class-prefix="avatar-color" cui-avatar-color-count="3"></div>
```

* `app.appUser.avatar` - A link to the user's image. If defined, the directive will wait until the image is loaded and then it will compile a new element nested in the cui-avatar element, with the following markup: `<div class="cui-avatar__image-container"></div>`. It then applies the image as the background-image of this new element.
* `app.appUser.names` <optional> - Array of names that you want the initials displayed for. It will create an element inside of the cui-avatar element with this markup `<div class="cui-avatar__initials">Initials Here</div>`.
* `cui-avatar-color-class-prefix` <optional> - Prefix for a class to be applied to the cui-avatar element. Useful in case you want to define a modifier class, like `cui-avatar--colorX`, where X is a number from 1 to `cui-avatar-color-count`. Note that if you define the `cui-avatar-color-class-prefix` attribute you must also define `cui-avatar-color-count="3">`.

## Change Log 1/14/2016

* Now accepts user-avatar as a variable directly, rather than a string with the object. (No more double curly brackets)

## Change Log 3/28/2016

* Major re-work; Now accepts the user's names and displays his initials until his avatar is loaded.

## Change Log 3/30/2016

* New optional attributes:
   * `cui-avatar-cuiI18n-filter` - if cui-avatar-names is an array of internationalized languages pass this attribute.
   * `cui-avatar-max-num-initials` - the max number of initials to display (by default is 2).
* Now takes a user's email ( with the cui-avatar-email attribute ), if that user has a gravatar account and a custom avatar set, it will use that avatar as the image to display.