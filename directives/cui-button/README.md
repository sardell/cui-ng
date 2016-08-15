# Cui-Button

### Description
Use the `cui-button` directive when you need a submit button that has built in success, error, and loading states.

### Usage Example

```
<cui-button
  button-click="directives.cuiButtonClick()"
  loading-if="directives.cuiButtonLoading"
  success-if="directives.cuiButtonSuccess"
  error-if="directives.cuiButtonError"
 >
  <button class="cui-button">Submit</button>
</cui-button>
```

### Optional Attributes

* `success-message`: Allows you to customize the success text.
* `error-message`: Allows you to customize the error text.
* `loading-message`: Allows you to customize the loading text.
* `disable-if`: Allows you to attach `ng-disabled` to the element itself.
