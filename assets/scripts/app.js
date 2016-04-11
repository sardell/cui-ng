(function(angular){
    'use strict';

    angular
    .module('app',['translate','ngMessages','cui.authorization','cui-ng','ui.router','snap','LocalStorageModule', 'cui-ng-datafactory'])
    .run(['LocaleService','$rootScope', '$state', 'cui.authorization.routing','user','$http','$templateCache','$cuiIcon',
        function(LocaleService,$rootScope,$state,routing,user,$http,$templateCache,$cuiIcon){
        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
            event.preventDefault();
            routing($rootScope, $state, toState, toParams, fromState, fromParams, user.getUser());
        });

        LocaleService.setLocales('en','English');
        LocaleService.setLocales('pl','Polish');
        LocaleService.setLocales('zh','Chinese');
        LocaleService.setLocales('pt','Portuguese');


        angular.forEach($cuiIcon.getIconSets(),function(iconSettings,namespace){
            $http.get(iconSettings.path,{
                cache: $templateCache
            });
        });
    }])
    .config(['$translateProvider','$stateProvider','$urlRouterProvider','$locationProvider','$injector','localStorageServiceProvider','$cuiIconProvider','$paginationProvider',
    function($translateProvider,$stateProvider,$urlRouterProvider,$locationProvider,$injector,localStorageServiceProvider,$cuiIconProvider,$paginationProvider){
        localStorageServiceProvider.setPrefix('cui');

        $stateProvider
            .state('cui-wizard',{
                url: '/cui-wizard',
                templateUrl: './assets/angular-templates/cui-wizard.html',
            })
            .state('cui-avatar',{
                url: '/cui-avatar',
                templateUrl: './assets/angular-templates/cui-avatar.html',
            })
            .state('cui-expandable',{
                url: '/cui-expandable',
                templateUrl: './assets/angular-templates/cui-expandable.html'
            })
            .state('off-click',{
                url: '/off-click',
                templateUrl: './assets/angular-templates/off-click.html'
            })
            .state('password-validation',{
                url: '/password-validation',
                templateUrl: './assets/angular-templates/password-validation.html'
            })
            .state('custom-error',{
                url: '/custom-error',
                templateUrl: './assets/angular-templates/custom-error.html'
            })
            .state('tags-input',{
                url: '/tags-input',
                templateUrl: './assets/angular-templates/tags-input.html'
            })
            .state('match',{
                url: '/match',
                templateUrl: './assets/angular-templates/match.html'
            })
            .state('cui-icon',{
                url: '/cui-icon',
                templateUrl: './assets/angular-templates/cui-icon.html'
            })
            .state('auto-complete',{
                url: '/auto-complete',
                templateUrl: './assets/angular-templates/auto-complete.html'
            })
            .state('inline-edit',{
                url: '/inline-edit',
                templateUrl: './assets/angular-templates/inline-edit.html'
            })
            .state('cui-authorization',{
                url: '/cui-authorization',
                templateUrl: './assets/angular-templates/cui-authorization.html'
            })
            .state('focus-if',{
                url: '/focus-if',
                templateUrl: './assets/angular-templates/focus-if.html'
            })
            .state('class-toggle',{
                url: '/class-toggle',
                templateUrl: './assets/angular-templates/class-toggle.html'
            })
            .state('results-per-page', {
                url: '/results-per-page',
                templateUrl: './assets/angular-templates/results-per-page.html'
            })
            .state('paginate',{
                url: '/paginate/:page',
                templateUrl: './assets/angular-templates/paginate.html'
            })
            .state('cui-dropdown',{
                url: '/cui-dropdown',
                templateUrl: './assets/angular-templates/cui-dropdown.html'
            })
            .state('cui-popover',{
                url: '/cui-popover',
                templateUrl: './assets/angular-templates/cui-popover.html'
            });

        //fixes infinite digest loop with ui-router
        $urlRouterProvider.otherwise( function($injector) {
          var $state = $injector.get("$state");
          $state.go('cui-wizard');
        });

        $translateProvider.useLoader('LocaleLoader',{
            url:'bower_components/cui-i18n/dist/cui-i18n/angular-translate/',
            prefix:'locale-',
            suffix:'.json'
        });

        $cuiIconProvider.iconSet('cui','bower_components/cui-icons/dist/icons/icons-out.svg','0 0 48 48');

        $paginationProvider.setPaginationOptions([10,25,50,100]);

    }])
    .factory('user',['$rootScope',function($rootScope){
        return{
            getUser:function(){
                return $rootScope.appUser;
            },
            setUser:function(user){
                $rootScope.appUser=user;
            }
       };
    }])
    .factory('getCountries',['$http',function($http){
        return function(locale){
            return $http.get('bower_components/cui-i18n/dist/cui-i18n/angular-translate/countries/' + locale + '.json');
        };
    }])
    .factory('auth',['$http', '$rootScope',function($http, $rootScope){
        return {
            login: function(){
                $rootScope.cui.doThreeLeggedOAuth({
                    clientId: 'WPUodVvicVPIvJdnakomB4nCa3GnyE6r'
                })
                .then(function(token) {
                    console.log('logged')
                })
                .fail(function() {
                     console.log('fail');
                });
                $rootScope.cui.handleAuthResponse();
            }

        };
    }])
    .factory('fakeApi',['$q','$timeout',function($q,$timeout){
        return {
            checkIfUsernameAvailable:function(username){
                var deferred=$q.defer();
                $timeout(function(){
                    deferred.resolve(username!=='Steven.Seagal');
                },600);
                return deferred.promise;
            }
        };
    }])
    .factory('words',['$http',function($http){
        return {
            get: function(){
                return $http.get('http://randomword.setgetgo.com/get.php');
            }
        };
    }])
    .controller('appCtrl',['$rootScope','$state','$stateParams','user','$timeout','localStorageService','$scope','$translate','getCountries','fakeApi','$interval','words','CuiPasswordPolicies',
    function($rootScope,$state,$stateParams,user,$timeout,localStorageService,$scope,$translate,getCountries,fakeApi,$interval,words,CuiPasswordPolicies){
        var app=this;
        app.appUser={
            names:['Bill','Murray'],
            email:'orin.fink@thirdwavellc.com'
        };

        $timeout(function(){
            app.appUser.avatar='https://www.fillmurray.com/140/100'
        },1500);

        app.hits=0;

        app.routes=['cui-avatar','cui-wizard','cui-expandable','off-click','password-validation','tags-input','match','custom-error',
        'cui-icon','auto-complete','inline-edit','focus-if','cui-authorization','class-toggle','results-per-page','paginate','cui-dropdown','cui-popover'];

        //SERVICES -----------------------

        app.addPoints=function(){
            if(app.notPlaying!==true) {
                app.missed=false;
                app.hits=((app.hits || 0)+1);
            }
        };

        app.desktopMenu=true;

        app.toggleDestkopMenu= function(){
            app.desktopMenu=!app.desktopMenu;
        };

        app.passwordPolicies={};
        app.passwordPolicies.disallowedWords='admin,password';
        app.passwordPolicies.disallowedChars='^%';
        app.passwordPolicies.allowUpperChars=true;
        app.passwordPolicies.allowLowerChars=true;
        app.passwordPolicies.allowNumChars=true;
        app.passwordPolicies.allowSpecialChars=true;
        app.passwordPolicies.requiredNumberOfCharClasses=2;
        app.passwordPolicies.min=6,
        app.passwordPolicies.max=8,

        $scope.$watch('app.passwordPolicies',function(newPolicies,oldPolicies){
            if(newPolicies) CuiPasswordPolicies.set([{
            allowUpperChars:app.passwordPolicies.allowUpperChars,
            allowLowerChars:app.passwordPolicies.allowLowerChars,
            allowNumChars:app.passwordPolicies.allowNumChars,
            allowSpecialChars:app.passwordPolicies.allowSpecialChars,
            requiredNumberOfCharClasses:app.passwordPolicies.requiredNumberOfCharClasses,
            disallowedChars:app.passwordPolicies.disallowedChars,
            min:app.passwordPolicies.min,
            max:app.passwordPolicies.max,
            disallowedWords:app.passwordPolicies.disallowedWords.split(',')
        }]);
        },true);


        app.checkUsername=function(){
            app.checkingUsername=true;
            fakeApi.checkIfUsernameAvailable(app.username)
            .then(function(res){
                app.usernameAvailable=res;
                app.checkingUsername=false;
            })
        };

        app.customErrors=[
            {
                name:'usernameTaken',
                check:function(){
                    return app.usernameAvailable;
                }
            },
            {
                name:'notAdmin',
                check:function(){
                    return app.username!=='admin' && app.username!=='Admin';
                }
            }
        ];

        var timer;

        app.startGame=function(){
            if(angular.isDefined(timer)) $interval.cancel(timer);
            app.userInput='';
            app.counter=0;
            words.get()
            .then(function(res){
                app.random=res.data;
                app.gameStarted=true;
                timer=$interval(function(){
                    app.counter+=0.01;
                },10)
            });
        };

        app.stopGame=function(){
            $interval.cancel(timer);
            timer=undefined;
        };

        app.restartGame=function(){
            app.gameStarted=false;
            app.startGame();
        };

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
        };

        $scope.$on('languageChange',function(e,args){
            setCountries(args);
        });

        setCountries('en');

        app.defaultCountry={
            name:'United States',
            code:'US'
        };

        app.getRandomWord=function(){
            words.get()
            .then(function(res){
                app.random2=res.data;
            });
        };

        app.testCallback=function(){
            console.log('hi!');
        };

        app.buildEntitlements=function(){
            if(Object.keys(app.entitlements || {}).length===0){
                app.userEntitlements=[];
            }
            else{
                var entitlements=[],i=0;
                angular.forEach(app.entitlements,function(value,key){
                    if(value) {
                        entitlements[i]=key;
                        i++
                    }
                });
                app.userEntitlements=entitlements;
            }
        };
        app.buildEntitlements();

        app.onEdit=function(value){
            console.log('test');
            if(!angular.isDefined(value)){
                app.inlineError={};
            }
            else app.inlineError={
                test:value
            };
            app.noSave=(value!=='admin');
        };


        // paginate
        $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
            if(toParams.page) {
                app.page=parseInt($stateParams.page);
            }
        });

        app.handlePageChange=function(page){
            app.currentPage=page;
        };

    }]);
})(angular);