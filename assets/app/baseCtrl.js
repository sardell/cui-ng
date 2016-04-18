// Base ctrl is manually added with ng-controller in index.html so that all of these
// scope variables and methods are available in every state in the app

angular.module('app')
.controller('baseCtrl',['$state','Countries','Timezones','Languages','$scope','$translate','LocaleService','User','API','Menu',
function($state,Countries,Timezones,Languages,$scope,$translate,LocaleService,User,API,Menu) {
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

    base.menu = Menu;

    // This returns the current language being used by the cui-i18n library - see assets/app/providers/Languages.js
    base.getLanguageCode = Languages.getCurrentLanguageCode;

    // List of languages - see assets/app/providers/Languages.js
    base.languages = Languages.all;

    // List of countries, in whatever language we're currently using - see assets/app/providers/Countries.js
    base.countries = Countries;

    // List of timezones, in whatever language we're currently using - see assets/app/providers/Timezones.js
    base.timezones = Timezones.all;

    // This contains whatever is in the appConfig.json file, in the root of the project
    base.appConfig = appConfig;

    // Base.user is an object with entitlements (empty array if user isn't logged in or has no entitlements) and cuid (user's id if he's logged in) - see assets/app/providers/User.js
    base.user = User.user;

    base.userName = User.userName;

    // Call base.logout() to logout a user from anywhere in your app
    base.logout = API.cui.covLogout;

}]);
