# Password validation
Version 1.0


## Description
Password validation is an angular directive made for use with [ngMessages](https://docs.angularjs.org/api/ngMessages/directive/ngMessages) to easily display errors validating a password field.

NOTE: If you need more customized password validation rules use [`custom-error`](https://github.com/thirdwavellc/cui-ng/tree/master/directives/custom-error).

## How to use

* You must have the `cui-ng` module injected as a dependency into your angular app
* Use it in a password input field
```html  
<input type="password" name="password" ng-model="app.password" ng-required="true" 
ng-class="{'error-class': signOn.password.$touched && signOn.password.$invalid}" 
password-validation="app.passwordPolicies"></input>

<div ng-messages="signOn.password.$error" ng-messages-multiple ng-if="signOn.password.$invalid">
   <div ng-messages-include="assets/angular-templates/password-messages.html"></div>
</div>
```
(Note: this assumes that you have your input wrapped in a form with `name="signOn"`, however you can name it differentely, just replace every occurence of `signOn` with your new name.)

The div appended with the ng-messages attribute uses the ng-messages directive to display the errors, ng-if ensures that they are only shown when the field is invalid.

`app.passwordPolicies` is an array that looks like this
```js
  app.passwordPolicies=[
      {
          'allowUpperChars':true,
          'allowLowerChars':true,
          'allowNumChars':true,
          'allowSpecialChars':true,
          'requiredNumberOfCharClasses':3
      },
      {
          'disallowedChars':'^&*)(#$'
      },
      {
          'min':8,
          'max':18
      }
  ];
```


## password-messages.html

This file will contain the markup shown for each error message. Use this to build your own. (check [ngMessages](https://docs.angularjs.org/api/ngMessages/directive/ngMessages) docs for more instructions)

### The errors that the password-validation directive passes are:

* `lowercaseNotAllowed` - if `allowLowerChars` is false and there's a lowercase letter present.
* `uppercaseNotAllowed` - if `allowUpperChars` is false and there's an uppercase letter present.
* `specialNotAllowed` - if `allowSpecialChars` is false and there's a special char present.
* `numberNotAllowed` - if `allowNumChars` is false and there's a number present.
* `disallowedChars` - if any of the chars in `disallowedChars` is present.
* `length` - if the length requirements aren't met
<br/>
* `lowercase`,`uppercase`,`special` and `number` are passed if the password doesn't contain the corresponding chars.
<br/> Use this with `complex` (checks if the required number of char classes is met) for more customizable messages.
(note: `lowercase`,`uppercase`,`special` and `number` will not passed as errors if they are not allowed in the policies. Code your ng-messages markup accordingly.)


```html
<p>Passwords must:</p>

<div ng-message="lowercaseNotAllowed">
    <div class="circle" ng-class="signOn.password.$error.lowercaseNotAllowed ? '': 'green'"></div>
    not have any lowercase letters
</div>
<div ng-message="uppercaseNotAllowed">
    <div class="circle" ng-class="signOn.password.$error.uppercaseNotAllowed ? '': 'green'"></div>
    not have any upper case letters
</div>
<div class="cui-error__message" ng-message="numberNotAllowed">
    <div class="circle" ng-class="signOn.password.$error.uppercaseNotAllowed ? '': 'green'"></div>
    not have any numbers
</div>
<div class="cui-error__message" ng-message="specialNotAllowed">
    <div class="circle" ng-class="signOn.password.$error.specialNotAllowed ? '': 'green'"></div>
    not have any special symbols (ex: ! * + )
</div>
<div class="cui-error__message" ng-message="disallowedChars">
    <div class="circle" ng-class="signOn.password.$error.disallowedChars ? '': 'green'"></div>
    not contain any of the following chars: ^&*)(#$
</div>

<div class="cui-error__message">
    <div class="circle" ng-class="signOn.password.$error.length ? '': 'green'"></div>
        have between 8-18 characters<br/><br/>
</div>
<div class="cui-error__message">have 3 of the following:<br/>
    <div class="cui-error__message">
        <div class="circle" ng-class="signOn.password.$error.lowercase ? '': 'green'"></div>
        at least one lower case letter
    </div>
    <div class="cui-error__message">
        <div class="circle" ng-class="signOn.password.$error.uppercase ? '': 'green'"></div>
        at least one upper case letter
    </div>
    <div class="cui-error__message">
        <div class="circle" ng-class="signOn.password.$error.number ? '': 'green'"></div>
        at least one number
    </div>
    <div class="cui-error__message">
        <div class="circle" ng-class="signOn.password.$error.special ? '': 'green'"></div>
        at least 1 special symbol<br/> (ex: ! * + )
    </div>
</div>


```

## Change Log 1/15/2016

* Now accepts the value of `password-validation` passed as a variable directly (`password-validation="app.policies"`) vs. as a pointer to the variable that needs to be compiled and then parsed as a string (`password-validation="{{app.policies}}"`).
* Fixed attributes passing validation rules when the input was empty and not touched (no more need to set the ng-model to an empty string).
