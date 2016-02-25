# cuiI18n filter
Version 1.0

### Description
This filter parses an array of internationalized names and decides which to display, based on the user's language and the [$cuiI18n](https://github.com/thirdwavellc/cui-ng/tree/master/providers/$cuiI18n) provider's language preference array.


### Usage Example

```js
    service.name=[
        {
            lang:'en_US',
            text:'FooBar'
        },
        {
            lang:'pt_PT',
            text:'Portuguese FooBar.'
        }
    ];
```

```html
  <span ng-bind="service.name | cui18n"></span>
```
