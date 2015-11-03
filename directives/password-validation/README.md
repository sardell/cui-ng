# Password validation
Version 1.0


### Description
Password validation is an angular directive made for use with [ngMessages](https://docs.angularjs.org/api/ngMessages/directive/ngMessages) to easily display errors validating a password field.

### Usage Example
#### Markup

```html
   <input type="password" name="<password input name>" ng-required="true" password-validation></input>
   <div class="cui-error__password" ng-messages="<formName>.<password input name>.$error" ng-messages-multiple ng-if="<formName>.<password input name>.$invalid">
      <div ng-messages-include="password-messages.html"></div>
    </div>
```
##### password-messages.html

```html
<p>Passwords must:</p>
<div class="cui-error__message" ng-message="lowercase">have at least 1 lower case letter</div>
<div class="cui-error__message" ng-message="uppercase">have at least 1 upper case letter</div>
<div class="cui-error__message" ng-message="number">have at least 1 number</div>
<div class="cui-error__message" ng-message="length">have between 8-20 characters</div>
<div class="cui-error__message" ng-message="complex">have at least 1 special symbol (ex: ! * + )</div>
```
