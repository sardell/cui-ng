# On-enter
Version 1.0


## Description
Fires a certain function when the element it's applied on receive an 'enter' keypress.

## How to use

```html
<input on-enter="doStuff"/>
```

```javascript
$scope.doStuff=function(){
  // logic here
};
```

If the input it's put on has an ng-model, the current value of that variable is passed as an argument to the on-enter function.