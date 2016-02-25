# $cuiI18n provider
Version 1.0


### Description
This provider serves a way of setting a list of prefered languages to use as fallback in case the internationalized name array does not have the language the user is currently using (served by the cui-i18n library). This will feed our [cuiI18n filter](https://github.com/thirdwavellc/cui-ng/tree/master/filters/cuiI18n) the information it needs to make the decision on which name to display.

### Usage Example

```javascript
  angular.module('app',['cui-ng','translate']
  .config(['$cuiI18nProvider',function($cuiI18nProvider){
    $cuiI18nProvider.setLocalePreference(['en_US','pt_PT']);
  }])
```