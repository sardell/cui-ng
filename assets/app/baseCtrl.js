// Base ctrl is manually added with ng-controller in index.html so that all of these
// scope variables and methods are available in every state in the app

angular.module('app')
.controller('baseCtrl',['$state','Countries','Timezones','Languages','$scope','$translate','LocaleService','Menu',
function($state,Countries,Timezones,Languages,$scope,$translate,LocaleService,Menu) {
    'use strict';

    var base = this;

    base.goBack = function() {
        if ($state.previous.name.name !== '') {
            $state.go($state.previous.name, $state.previous.params);
        }
        else {
            $state.go('index');
        }
    };

    base.generateHiddenPassword = function(password) {
        return Array(password.length+1).join('•');
    };

    // This returns the current language being used by the cui-i18n library - see assets/app/providers/Languages.js
    base.getLanguageCode = Languages.getCurrentLanguageCode;

    // List of languages - see assets/app/providers/Languages.js
    base.languages = Languages.all;

    // List of countries, in whatever language we're currently using - see assets/app/providers/Countries.js
    base.countries = Countries;

    // List of timezones, in whatever language we're currently using - see assets/app/providers/Timezones.js
    base.timezones = Timezones.all;

    base.menu = Menu;

}]);
