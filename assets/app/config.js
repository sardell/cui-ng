angular.module('app')
.config(['$translateProvider','$locationProvider','$cuiIconProvider','$cuiI18nProvider','$stateProvider','$urlRouterProvider','$injector','localStorageServiceProvider','$paginationProvider',
function($translateProvider,$locationProvider,$cuiIconProvider,$cuiI18nProvider,$stateProvider,$urlRouterProvider,$injector,localStorageServiceProvider,$paginationProvider) {

    // This is the prefix to be used by the local storage module. Set this to whatever you'd like.
    localStorageServiceProvider.setPrefix('cui');

    // Base directory of your partials. Used to concatenate with the template name in the state definitions
    var templateBase = 'assets/app/';

    var returnCtrlAs = function(name, asPrefix) {
        // Help function to build controller as syntax
        // returnCtrlAs('test', 'new') returns 'testCtrl as newTest'
        // returnCtrlAs('test') returns 'testCtrl as test'
        return name + 'Ctrl as ' + ( asPrefix? asPrefix : '' ) + ( asPrefix? name[0].toUpperCase() + name.slice(1,name.length) : name );
    };

    // We are using UI-router in this SDK, it's better than the baked in routing option for a multitude of reasons,
    // the biggest of them being the ability to set nested states with multiple views per state.
    // See more here https://github.com/angular-ui/ui-router
    $stateProvider
   .state('index', {
        url: '/',
        templateUrl: templateBase + 'directives-showcase/directives-showcase.html',
        controller: returnCtrlAs('directives')
    });

    // This is used to remove the # from the URLs in an angular app. To be able to use this,
    // you'll require some server side config, so that every path serves the index.html file.
    // Rread more: https://github.com/angular-ui/ui-router/wiki/Frequently-Asked-Questions#how-to-configure-your-server-to-work-with-html5mode
    // $locationProvider.html5Mode(true);

    //fixes infinite digest loop with ui-router
    $urlRouterProvider.otherwise( function($injector) {
      var $state = $injector.get("$state");
      // this will be the state a user is directed to when angular can't find a match for the URL it receives.
      // You can use this to redirect to a 404 page
      $state.go('index');
    });

    if (appConfig.languages) {
        // This should not be altered, unless you want to get language files from a different location
        // than bower_components/cui-i18n/dist/cui-i18n/angular-translate/
        if (!$cuiI18nProvider) {
            throw new Error('You have languages configured in your appConfig.json file, but you don\'t have cui-i18n installed and/or injected into your config block.');
            return;
        }
        // This block of code will set language preference for you app based on the order you set them in appConfig.json
        $cuiI18nProvider.setLocaleCodesAndNames(appConfig.languages);
        var languageKeys = Object.keys($cuiI18nProvider.getLocaleCodesAndNames());

        var returnRegisterAvailableLanguageKeys = function() {
            // set unknown languages to reroute to prefered language
            var object = {'*': languageKeys[0]};
            languageKeys.forEach(function(languageKey) {
                //redirect language keys such as en_US to en or en-US to en
                object[languageKey + '*'] = languageKey;
            });
            return object;
        };

        $translateProvider
        .useLoader('LocaleLoader',{
            url: 'node_modules/@covisint/cui-i18n/dist/cui-i18n/angular-translate/',
            prefix: 'locale-',
            suffix: '.json'
        })
        .registerAvailableLanguageKeys(languageKeys, returnRegisterAvailableLanguageKeys())
        .uniformLanguageTag('java')
        .determinePreferredLanguage()
        .fallbackLanguage(languageKeys);

        $cuiI18nProvider.setLocalePreference(languageKeys);
    }

    if (appConfig.iconSets) {
        appConfig.iconSets.forEach(function(iconSet){
            $cuiIconProvider.iconSet(iconSet.name, iconSet.path, iconSet.defaultViewBox || null);
        })
    }

    // Used for results-per-page and paginate
    if (appConfig.paginationOptions){
        $paginationProvider.setPaginationOptions(appConfig.paginationOptions);
    }
    else throw new Error('You don\'t have any paginationOptions set in appConfig.json');

}]);

angular.module('app')
.run(['LocaleService','$cuiI18n','$cuiIcon','$rootScope','$state','$http','$templateCache','cui.authorization.routing','Menu',
    function(LocaleService,$cuiI18n,$cuiIcon,$rootScope,$state,$http,$templateCache,routing,Menu){

    if (appConfig.languages) {
        // This should not be altered, unless you want to get language files from
        // a different location than bower_components/cui-i18n/dist/cui-i18n/angular-translate/
        if (!$cuiI18n) {
            throw new Error('You have languages configured in your appConfig.json file, but you don\'t have cui-i18n installed and/or injected into your config block.');
            return;
        }

        var languageNameObject = $cuiI18n.getLocaleCodesAndNames();
        for(var LanguageKey in languageNameObject) {
            LocaleService.setLocales(LanguageKey, languageNameObject[LanguageKey]);
        };
    }

    if (appConfig.iconSets) {
        if (!$cuiIcon) {
            throw new Error('You have icon sets configured in your appConfig.json file, but you don\'t have cui-icons installed and/or injected into your config block.');
            return;
        }
        angular.forEach($cuiIcon.getIconSets(), function(iconSettings, namespace) {
            $http.get(iconSettings.path, {
                cache: $templateCache
            });
        });
    }

}]);
