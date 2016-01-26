# angular-match

Extracted from [angular-match](https://github.com/neoziro/angular-match/blob/master/README.md);

Validate if two inputs match the same value.

## Usage

```html
<form class="signupForm">
    <input type="password" name="password" ng-model="password">
    <input type="password" name="repeatPassword" match="password">

    <div ng-show="myForm.repeatPassword.$error.match">Password do not match!</div>
</form>
```

## Change Log 1/26/2016

* Now sets error even when the field it's used on is undefined (untouched or not valid)