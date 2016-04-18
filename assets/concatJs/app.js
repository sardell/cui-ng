(function(angular){
    'use strict';

    $.get('./appConfig.json',function (configData) {
        var appConfig=configData;

        angular.element(document).ready(function () {
            angular.module('app',['translate','ngMessages','cui.authorization','cui-ng','ui.router','snap','LocalStorageModule']);


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
    // the auth state is used for authentication purposes.
    .state('auth', {
        url: '/auth',
        abstract:true
    })
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
            url: 'bower_components/cui-i18n/dist/cui-i18n/angular-translate/',
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
        if (!$cuiIconProvider) {
            throw new Error('You have icon sets configured in your appConfig.json file, but you don\'t have cui-icons installed and/or injected into your config block.');
            return;
        }
        appConfig.iconSets.forEach(function(iconSet){
            $cuiIconProvider.iconSet(iconSet.name, iconSet.path, '0 0 160 60');
        })
    }

    // Used for results-per-page and paginate
    $paginationProvider.setPaginationOptions([10,25,50,100]);

}]);

angular.module('app')
.run(['LocaleService','$cuiI18n','$cuiIcon','$rootScope','$state','$http','$templateCache','User','cui.authorization.routing','Menu','API',
    function(LocaleService,$cuiI18n,$cuiIcon,$rootScope,$state,$http,$templateCache,User,routing,Menu,API){

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

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
        // cui Auth
        API.handleCovAuthResponse(event, toState, toParams, fromState, fromParams);
        // determines if user is able to access the particular route we're navigation to
        routing($rootScope, $state, toState, toParams, fromState, fromParams, User.getEntitlements());
        // for menu handling
        Menu.handleStateChange(toState.menu);
    });

    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        // this is for base.goBack()
        $state.previous = {};
        $state.previous.name = fromState;
        $state.previous.params = fromParams;
    });

}]);


angular.module('app')

.factory('user',['$rootScope',function($rootScope) {
    return {
        getUser: function() {
            return $rootScope.appUser;
        },
        setUser: function(user) {
            $rootScope.appUser = user;
        }
   };
}])

.factory('fakeApi',['$q','$timeout',function($q,$timeout) {
    return {
        checkIfUsernameAvailable: function(username) {
            var deferred = $q.defer();
            $timeout(function() {
                deferred.resolve(username !== 'Steven.Seagal');
            }, 600);
            return deferred.promise;
        }
    };
}])

.factory('words',['$http',function($http) {
    return {
        get: function() {
            return $http.get('http://randomword.setgetgo.com/get.php');
        }
    };
}])

.controller('directivesCtrl',['$rootScope','$state','$stateParams','user','$timeout','localStorageService','$scope','$translate','fakeApi','$interval','words',
        'CuiPasswordPolicies',
function($rootScope,$state,$stateParams,user,$timeout,localStorageService,$scope,$translate,fakeApi,$interval,words,
        CuiPasswordPolicies) {

    var directives = this;
    var timer;

    directives.appUser = {
        names: ['Bill','Murray'],
        email: 'orin.fink@thirdwavellc.com'
    };

    $timeout(function() {
        directives.appUser.avatar = 'https://www.fillmurray.com/140/100';
    }, 1500);

    directives.hits = 0;

    directives.addPoints = function() {
        if (directives.notPlaying !== true) {
            directives.missed = false;
            directives.hits = ((directives.hits || 0)+1);
        }
    };

    directives.passwordPolicies = {};
    directives.passwordPolicies.disallowedWords = 'admin,password';
    directives.passwordPolicies.disallowedChars = '^%';
    directives.passwordPolicies.allowUpperChars = true;
    directives.passwordPolicies.allowLowerChars = true;
    directives.passwordPolicies.allowNumChars = true;
    directives.passwordPolicies.allowSpecialChars = true;
    directives.passwordPolicies.requiredNumberOfCharClasses = 2;
    directives.passwordPolicies.min = 6,
    directives.passwordPolicies.max = 8,

    $scope.$watch('directives.passwordPolicies', function(newPolicies, oldPolicies) {
        if(newPolicies) CuiPasswordPolicies.set([{
            allowUpperChars:directives.passwordPolicies.allowUpperChars,
            allowLowerChars:directives.passwordPolicies.allowLowerChars,
            allowNumChars:directives.passwordPolicies.allowNumChars,
            allowSpecialChars:directives.passwordPolicies.allowSpecialChars,
            requiredNumberOfCharClasses:directives.passwordPolicies.requiredNumberOfCharClasses,
            disallowedChars:directives.passwordPolicies.disallowedChars,
            min:directives.passwordPolicies.min,
            max:directives.passwordPolicies.max,
            disallowedWords:directives.passwordPolicies.disallowedWords.split(',')
        }]);
    }, true);

    directives.customErrors ={
            'usernameTaken':function(value) {
                return {
                    'promise':fakeApi.checkIfUsernameAvailable(value),
                    'valid':function(res){
                        return res;
                    }
                }
            },
            'notAdmin':function(value) {
                return value !== 'admin' && value !== 'Admin';
            }
    };


    directives.passwordCustomErrors = {
        'history':function(){
            return false;
        }
    };

    directives.startGame = function() {
        if (angular.isDefined(timer)) $interval.cancel(timer);
        directives.userInput = '';
        directives.counter = 0;
        words.get()
        .then(function(res) {
            directives.random = res.data;
            directives.gameStarted = true;
            timer = $interval(function() {
                directives.counter += 0.01;
            }, 10);
        });
    };

    directives.stopGame = function() {
        $interval.cancel(timer);
        timer = undefined;
    };

    directives.restartGame = function() {
        directives.gameStarted = false;
        directives.startGame();
    };

    directives.getRandomWord = function() {
        words.get()
        .then(function(res) {
            directives.random2 = res.data;
        });
    };

    directives.testCallback = function() {
        console.log('hi!');
    };

    directives.onEdit = function(value) {
        console.log('test');
        if (!angular.isDefined(value)) {
            directives.inlineError = {};
        }
        else directives.inlineError = {
            test:value
        };
        directives.noSave = (value !== 'admin');
    };

    // Paginate Start -----------------------------------------------------------
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        if (toParams.page) {
            directives.page = parseInt($stateParams.page);
        }
    });

    directives.handlePageChange = function(page) {
        directives.currentPage = page;
    };
    // Paginate End -------------------------------------------------------------

    // Auto-Complete & Language Change Start ------------------------------------

    directives.defaultCountry = {
        name: 'United States',
        code: 'US'
    };

    // Auto-Complete & Language Change End --------------------------------------

    // CUI-Authorization Start --------------------------------------------------
    directives.buildEntitlements = function() {
        if (Object.keys(directives.entitlements || {}).length === 0) {
            directives.userEntitlements = [];
        }
        else {
            var entitlements = [], i = 0;
            angular.forEach(directives.entitlements, function(value, key) {
                if(value) {
                    entitlements[i] = key;
                    i++;
                }
            });
            directives.userEntitlements = entitlements;
        }
    };

    directives.buildEntitlements();
    // CUI-Authorization End ----------------------------------------------------

}]);


angular.module('app')
.factory('API',['$state','User','$rootScope','$window','$location',function($state,User,$rootScope,$window,$location){

    var myCUI = cui.api();
    cui.log('cui.js v', myCUI.version()); // CUI Log

    var authInfo = {};

    myCUI.setServiceUrl('STG'); // STG
    // myCUI.setServiceUrl('PRD'); // PRD

    var originUri = appConfig.originUri; // Thirdwave STG Instance
    // var originUri = 'coke-idm.run.covapp.io'; // Coke STG Instance

    function jwtAuthHandler() {
        return myCUI.covAuth({
            originUri: originUri,
            authRedirect: window.location.href.split('#')[0] + '#/auth',
            appRedirect: $location.path()
        });
    }

    myCUI.setAuthHandler(jwtAuthHandler);

    return {
        cui: myCUI,
        getUser: User.get,
        setUser: User.set,
        getUserEntitlements: User.getEntitlements,
        setUserEntitlements: User.setEntitlements,
        handleCovAuthResponse: function(e,toState,toParams,fromState,fromParams){
            var self=this;
            myCUI.covAuthInfo({originUri:originUri});
            myCUI.handleCovAuthResponse({selfRedirect:true})
            .then(function(res) {
                if(toState.name==='auth'){
                    if(res.appRedirect!=='auth') {
                        Object.keys($location.search()).forEach(function(searchParam){
                            $location.search(searchParam,null);
                        });
                        $location.path(res.appRedirect).replace();
                    }
                    return;
                }
                else {
                    self.setUser(res);
                    self.setAuthInfo(res.authInfo);
                    myCUI.getPerson({ personId: res.cuid })
                    .then(function(res) {
                        angular.copy(res.name, User.userName);
                        return myCUI.getPersonRoles({ personId: self.getUser() });
                    })
                    .then(function(roles) {
                        var roleList = [];
                        roles.forEach(function(role) {
                            roleList.push(role.name);
                        });
                        self.setUserEntitlements(roleList);
                        $rootScope.$digest();
                    });
                }
            });
        },
        setAuthInfo:function(newAuthInfo){
            angular.copy(newAuthInfo[0],authInfo);
        },
        authInfo:authInfo
    };
}]);


angular.module('app')
.factory('Countries',['$http','$rootScope','$translate',function($http,$rootScope,$translate){

    var countries=[];

    var GetCountries=function(locale){
        return $http.get('bower_components/cui-i18n/dist/cui-i18n/angular-translate/countries/' + locale + '.json');
    };

    var setCountries=function(language){
        language = language || 'en';
        if(language.indexOf('_')>-1){
            language=language.split('_')[0];
        }
        GetCountries(language)
        .then(function(res){
            countries.length=0;
            res.data.forEach(function(country){
                countries.push(country);
            });
        })
        .catch(function(err){
            console.log(err);
        });
    };

    $rootScope.$on('languageChange',function(e,args){
        setCountries(args);
    });

    var getCountryByCode=function(countryCode){
        return _.find(countries,function(countryObject){
            return countryObject.code===countryCode;
        });
    };

    setCountries($translate.proposedLanguage());

    return {
        list:countries,
        getCountryByCode:getCountryByCode
    };
}]);

angular.module('app')
.factory('Languages',['$cuiI18n','LocaleService',function($cuiI18n,LocaleService){

    var languages=$cuiI18n.getLocaleCodesAndNames();

    return {
        all:languages,
        getCurrentLanguageCode : function(){
            if(LocaleService.getLocaleCode().indexOf('_')>-1) return LocaleService.getLocaleCode().split('_')[0];
            else return LocaleService.getLocaleCode();
        }
    };
}]);

angular.module('app')
.factory('Menu',[function(){
    return {
        desktop:{
            'state':'open', // default state for desktop menu
            'enabled':true,
            'open':function(){
                this.state='open';
            },
            'close':function(){
                this.state='closed';
            },
            'toggle':function(){
                this.state==='open' ? this.state='closed' : this.state='open';
            },
            'hide':function(){
                this.enabled=false;
            },
            'show':function(){
                this.enabled=true;
            }
        },

        mobile:{
            'state':'closed', // default state for mobile menu
            'enabled':true,
            'open':function(){
                this.state='open';
            },
            'close':function(){
                this.state='close';
            },
            'toggle':function(){
                this.state==='open' ? this.state='closed' : this.state='open';
            },
            'hide':function(){
                this.enabled=false;
            },
            'show':function(){
                this.state=true;
            }
        },

        handleStateChange: function(stateMenuOptions){
            if (!angular.isDefined(stateMenuOptions)){
                this.desktop.show();
                this.mobile.show();
            }
            else {
                (angular.isDefined(stateMenuOptions.desktop) && stateMenuOptions.desktop=== false)? this.desktop.hide() : this.desktop.show();
                (angular.isDefined(stateMenuOptions.mobile) && stateMenuOptions.mobile=== false)? this.mobile.hide() : this.mobile.show();
            }
        }
    };
}]);


angular.module('app')
.factory('Sort',['$filter',function($filter) {
    return {
        listSort: function(listToSort, sortType, order) {
            listToSort.sort(function(a, b) {
                if (sortType === 'alphabetically') { a = $filter('cuiI18n')(a.name).toUpperCase(), b = $filter('cuiI18n')(b.name).toUpperCase(); }
                else if (sortType=== 'date') { a = a.dateCreated, b = b.dateCreated; }
                else { a = a.status, b = b.status; }

                if ( a < b ) {
                    if (order) return 1;
                    else return -1;
                }
                else if( a > b ) {
                    if (order) return -1;
                    else return 1;
                }
                else return 0;
            });
        }
    };
}]);


angular.module('app')
.factory('Timezones',['$http','$rootScope','$translate',function($http,$rootScope,$translate){

    var timezones=[];

    var GetTimezones=function(locale){
        return $http.get('bower_components/cui-i18n/dist/cui-i18n/angular-translate/timezones/' + locale + '.json');
    };

    var setTimezones=function(language){
        language = language || 'en';
        if(language.indexOf('_')>-1){
            language=language.split('_')[0];
        }
        GetTimezones(language)
        .then(function(res){
            res.data.forEach(function(timezone){
                timezones.push(timezone);
            });
        })
        .catch(function(err){
            console.log(err);
        });
    };

    var getTimezoneById=function(id){
        if(!id) return '';
        return _.find(timezones,function(timezone){
            return timezone.id===id;
        }).name;
    };

    $rootScope.$on('languageChange',function(e,args){
        setTimezones(args);
    });

    setTimezones($translate.proposedLanguage());

    return {
        all:timezones,
        timezoneById:getTimezoneById
    }
}]);

angular.module('app')
.factory('User',['$rootScope',function($rootScope) {

    var user = {
        entitlements: []
    };

    var userName = {};

    return {
        set : function(newUser) {
            user.cuid = newUser.cuid;
        },
        get : function() {
            return user.cuid || '[cuid]';
        },
        setEntitlements : function(newEntitlements){
            user.entitlements=newEntitlements;
        },
        getEntitlements : function(){
            return user.entitlements;
        },

        userName: userName
    };

}]);



            angular.bootstrap(document,['app']);
        });
    });
})(angular);