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

* `success-message`, `error-message`, and `loading-message` all allow you to customize the text when the button is in that respective state. You are able to pass in regular text, a scope variable, or translated variables into these attributes.
	* Text Example: `success-message="Submit Successful!"`
	* Scope Variable Example: `success-message="{{scope.varibale}}"`
	* Translated Variable Example: `success-message="{{cui-success}}"`
* `disable-if`: Allows you to attach `ng-disabled` to the element itself.
