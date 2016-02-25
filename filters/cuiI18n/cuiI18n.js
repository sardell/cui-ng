angular.module('cui-ng')
.filter('cuiI18n',['LocaleService','$cuiI18n',function(LocaleService,$cuiI18n){
    return function(languageObjectArray){
        return $cuiI18n.getInternationalizedName(LocaleService.getLocaleCode(),languageObjectArray);
    }
}]);