(function(angular){
    'use strict';

    angular
    .module('app',['translate','ngMessages','cui.authorization','cui-ng','ui.router','snap','LocalStorageModule', 'cui-ng-datafactory'])
    .run(['LocaleService','$rootScope', '$state', 'cui.authorization.routing','user','$http','$templateCache', 
        function(LocaleService,$rootScope,$state,routing,user,$http,$templateCache){
        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
            event.preventDefault();
            routing($rootScope, $state, toState, toParams, fromState, fromParams, user.getUser());
        })

        LocaleService.setLocales('en_US','English (United States)');
        LocaleService.setLocales('pl_PL','Polish (Poland)');
        LocaleService.setLocales('zh_CN','Chinese (Simplified)');
        LocaleService.setLocales('pt_PT','Portuguese (Portugal)');

        var icons=['bower_components/cui-icons/dist/icons/icons-out.svg'];

        angular.forEach(icons,function(icon){
            $http.get(icon,{
                cache: $templateCache
            });
        });
    }])
    .config(['$translateProvider','$stateProvider','$urlRouterProvider','$locationProvider','$injector','localStorageServiceProvider','$cuiIconProvider',
    function($translateProvider,$stateProvider,$urlRouterProvider,$locationProvider,$injector,localStorageServiceProvider,$cuiIconProvider){
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
            });

        //fixes infinite digest loop with ui-router
        $urlRouterProvider.otherwise( function($injector) {
          var $state = $injector.get("$state");
          $state.go('cui-wizard');
        });
        
        $translateProvider.useLoader('LocaleLoader',{
            url:'bower_components/cui-i18n/dist/cui-i18n/angular-translate/',
            prefix:'locale-'
        });

        $cuiIconProvider.iconSet('cui','bower_components/cui-icons/dist/icons/icons-out.svg',48,true);

    }])
    .factory('user',['$rootScope',function($rootScope){
        return{
            getUser:function(){
                return $rootScope.appUser;
            },
            setUser:function(user){
                $rootScope.appUser=user;
            }
       }
    }])
    .factory('getCountries',['$http',function($http){
        return function(locale){
            return $http.get('bower_components/cui-i18n/dist/cui-i18n/angular-translate/countries/' + locale + '.json');
        };
    }])
    .factory('getSvgList',['$http', function($http){
        return $http.get('bower_components/cui-icons/iconList');
    }])
    .factory('auth',['$http', '$rootScope',function($http, $rootScope){
        return{
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

        }
    }])
    .controller('appCtrl',['$rootScope','$state','$stateParams','user','$timeout','localStorageService','$scope','getSvgList','auth','$translate','getCountries',
    function($rootScope,$state,$stateParams,user,$timeout,localStorageService,$scope,getSvgList,auth,$translate,getCountries){
        var app=this;
        app.appUser={};
        app.hits=0;
        //SERVICES -----------------------

        app.addPoints=function(){
            if(app.notPlaying!==true) {
                app.missed=false;
                app.hits=((app.hits || 0)+1);
            }
        }

        app.doLogin=function(){
            auth.login();
        }


        app.desktopMenu=true;

        app.toggleDestkopMenu= function(){
            app.desktopMenu=!app.desktopMenu;
        }

        app.passwordPolicies=[
            {
                'allowUpperChars':true,
                'allowLowerChars':true,
                'allowNumChars':true,
                'allowSpecialChars':true,
                'requiredNumberOfCharClasses':3
            },
            {
                'disallowedChars':'^&*)(#$'
            },
            {
                'min':8,
                'max':18
            },
            {
                'disallowedWords':['password','admin']
            }
        ];

        
        

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

        
    }]);
})(angular);
// 