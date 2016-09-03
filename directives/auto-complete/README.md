# Auto-complete

[Demo](http://cui-ng.run.covisintrnd.com/#/) | [More docs](http://ghiden.github.io/angucomplete-alt/) 

Auto-complete is a directive that enables type-ahead for any type of data. Extracted from [here.](http://ghiden.github.io/angucomplete-alt/)

## Usage Example

In your angular controller
```javascript
    .factory('getCountries',['$http',function($http){
        return function(locale){
            return $http.get('node_modules/@covisint/cui-i18n/dist/cui-i18n/angular-translate/countries/' + locale + '.json');
        };
    }])
    
    //and then in the controller
    var setCountries=function(language){
        if(language.indexOf('_')>-1){
            language=language.split('_')[0];   
        }
        getCountries(language)
        .then(function(res){
            app.countries=res.data;
        })
        .catch(function(err){
            console.log(err);
        });
    }

    $scope.$on('languageChange',function(e,args){
        setCountries(args);
    });

    setCountries($translate.proposedLanguage());
```

In your markup
```html
    <div auto-complete input-name="country" pause="100" selected-object="app.organization.country" local-data="app.countries" search-fields="name" title-field="name" minlength="1" input-class="cui-input" match-class="highlight" auto-match="true" field-required="app.organization.country" input-changed="app.organization.country"></div>
```