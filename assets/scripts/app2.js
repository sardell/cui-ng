(function(angular){
    'use strict';

    angular
    .module('app',['translate','ngMessages','cui.authorization','cui-ng','ui.router','snap','LocalStorageModule', 'cui-ng-datafactory'])
    .run(['LocaleService','$rootScope', '$state', 'cui.authorization.routing','user','wizardStep', function(LocaleService,$rootScope,$state,routing,user,wizardStep){
        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
            if(toState.data && toState.data.step){
                wizardStep.set(toState.data.step);
                $rootScope.$broadcast('stepChange');
            }
            event.preventDefault();
            routing($rootScope, $state, toState, toParams, fromState, fromParams, user.getUser());
        })

        LocaleService.setLocales('en_US','English (United States)');
        LocaleService.setLocales('pl_PL','Polish (Poland)');
        LocaleService.setLocales('zh_CN','Chinese (Simplified)');
        LocaleService.setLocales('pt_PT','Portuguese (Portugal)');
    }])
    .config(['$translateProvider','$stateProvider','$urlRouterProvider','$locationProvider','$injector','localStorageServiceProvider',
    function($translateProvider,$stateProvider,$urlRouterProvider,$locationProvider,$injector,localStorageServiceProvider){
        localStorageServiceProvider.setPrefix('cui');

        $stateProvider
            .state('wizard',{
                url: '/wizard',
                templateUrl: 'assets/angular-templates/cui-wizard.html',
                data: {
                    step: 1
                }
            })
            .state('wizard.organization',{
                url: '/organization',
                data: {
                    step: 1
                }
            })
            .state('wizard.signOn',{
                url: '/signOn',
                data: {
                    step: 2
                }
            })
             .state('wizard.user',{
                url: '/user',
                data: {
                    step: 3
                }
            })
            .state('wizard.review',{
                url: '/review',
                data: {
                    step: 4
                }
            })
            .state('login', {
                url: '/login',
                templateUrl: 'assets/angular-templates/login.html'
            })
            .state('notAuthorized', {
                url: '/notAuthorized',
                templateUrl: 'assets/angular-templates/notAuthorized.html'
            })
            .state('admin',{
                url: '/admin',
                templateUrl: 'assets/angular-templates/admin.html',
                access: {
                    loginRequired: true,
                    requiredEntitlements: ['admin'],
                    entitlementType: 'atLeastOne'
                }
            })
            .state('user',{
                url: '/user',
                templateUrl: 'assets/angular-templates/user.html',
                access: {
                    loginRequired: true,
                    requiredEntitlements: ['admin','user'],
                    entitlementType: 'atLeastOne'
                }
            })
            .state('icons',{
                url: '/icons',
                templateUrl: 'assets/angular-templates/icons.html',
                access: {
                    loginRequired: true
                }
            })
            .state('profile',{
                url: '/profile',
                templateUrl: 'assets/angular-templates/profile.html',
                controller:'profileManagementCtrl as profile',
                access : {
                    loginRequired: true,
                    requiredEntitlements: ['admin','user'],
                    entitlementType: 'atLeastOne'
                }
            });

        // $locationProvider.html5Mode(true);
        
        //fixes infinite digest loop with ui-router
        $urlRouterProvider.otherwise( function($injector) {
          var $state = $injector.get("$state");
          $state.go('wizard');
        });
        
        $translateProvider.useLoader('LocaleLoader',{
            url:'bower_components/cui-i18n/dist/cui-i18n/angular-translate/',
            prefix:'locale-'
        });
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
    .factory('wizardStep',[ function(){
        var step;
        return{
            get: function(){
                return step;
            },
            set: function(newStep){
                step=newStep;
            }
        }
    }])
    .controller('appCtrl',['$rootScope','$state','$stateParams','user','$timeout','localStorageService','$scope','getSvgList','auth','wizardStep','$translate','getCountries',
    function($rootScope,$state,$stateParams,user,$timeout,localStorageService,$scope,getSvgList,auth,wizardStep,$translate,getCountries){
        var app=this;
        app.appUser={};


        // $scope.$watch(function() { return wizardStep.get()},function(step){    
        //     app.step=step;
        //     console.log(app.step);
      
        // })
 
        $scope.$on('stepChange',function(e,data){
            if(data && data.state){
                app.goTo(data.state);
            }
            app.step=wizardStep.get();
        })

        //SERVICES -----------------------

        app.doLogin=function(){
            auth.login();
        }



        // user.setUser(app.appUser);

        app.setUser= function(newUser){
            $timeout(function(){
                user.setUser(newUser)
                app.appUser=newUser;    
                $state.go('login',{notify:true,reload:true});
            })
        };

        app.goTo= function(state){
            $state.go(state,{notify:true,reload:true});
        }

        app.desktopMenu=true;

        app.toggleDestkopMenu= function(){
            app.desktopMenu=!app.desktopMenu;
        }

        app.userPopup=false;

        app.openUserPopup= function(){
            app.userPopup=true;
        }

        app.closeUserPopup= function(){
            app.userPopup=false;
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

        //for the wizard -------------------------------------------------------------------------------------

        //organization
          //get from local storage if available -----------
        var organizationInStorage = localStorageService.get('app.organization');
        app.organization = organizationInStorage || {};
        app.organization.country=undefined;
        $scope.$watch('app.organization',function(){
            localStorageService.set('app.organization',$scope.app.organization)
        }, true);

        app.emailRegex="^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}" +
            "[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$";

            //---- MOCK DATA
            app.organization.name='Thirdwave LLC';
            app.organization.divisions=['Web design','UI development','Wordpress development','Ruby development'];
            app.organization.cities=['Chicago','Aurora','Rockford','Joliet','Naperville','Springfiled'];
            app.organization.states=['IL','FL','NY','CA'];
            app.organization.countries=['U.S.A','Portugal','Spain'];

        //sign on info
        var signOnInStorage = localStorageService.get('app.signOn');
        app.signOn = signOnInStorage || {};
        $scope.$watch('app.signOn',function(){
            localStorageService.set('app.signOn',$scope.app.signOn)
        }, true);

            //this fixes an issue with the password validators.
            app.signOn.password1='';
            app.signOn.password2='';

        //user info
        var userInfoInStorage = localStorageService.get('app.user');
        app.user = userInfoInStorage || {};
        $scope.$watch('app.user',function(){
            localStorageService.set('app.user',$scope.app.user)
        }, true);

            //----- MOCK DATA
            app.user.timezones=['-08:00','-07:00','-06:00','-05:00','-04:00'];




        // GET THE SVG ICONS
        getSvgList.then(function(res){
            var svgList=res.data.split(',');
            for(var i=0;i<svgList.length;i++){
                var index = svgList[i].indexOf('.svg');
                if(index>-1){
                    svgList[i]=svgList[i].split('.')[0];
                }
                svgList[i]='bower_components/cui-icons/dist/icons/icons-out.svg#' + svgList[i];
            }
            app.svgList=svgList;
        });
        

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

        
    }])
    .filter('svgIconCardHref', ['$sce' ,function ($sce) {
        return function(svg) {
          return $sce.trustAsResourceUrl(svg);
        };
    }]);

})(angular);
// 