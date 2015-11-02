(function(angular,cui){
    'use strict';

    angular
    .module('app',['translate','ngMessages','cui.authorization','cui-ng','ui.router','snap','LocalStorageModule'])
    .run(['$rootScope', '$state', 'cui.authorization.routing','user', function($rootScope,$state,routing,user){
        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
            event.preventDefault();
            routing($rootScope, $state, toState, toParams, fromState, fromParams, user.getUser());
        })
        $rootScope.cui=cui.api();
        $rootScope.cui.setService('PRD');
    }])
    .config(['$stateProvider','$urlRouterProvider','$locationProvider','$injector','localStorageServiceProvider',
    function($stateProvider,$urlRouterProvider,$locationProvider,$injector,localStorageServiceProvider){
        localStorageServiceProvider.setPrefix('cui');
        $stateProvider
            .state('wizard',{
                url: '/wizard?step',
                templateUrl: 'assets/angular-templates/cui-wizard.html'
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
            });
        
        //fixes infinite digest loop with ui-router
        $urlRouterProvider.otherwise( function($injector) {
          var $state = $injector.get("$state");
          $state.go('wizard');
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
    .controller('appCtrl',['$rootScope','$state','$stateParams','user','$timeout','localStorageService','$scope','getSvgList','auth',
    function($rootScope,$state,$stateParams,user,$timeout,localStorageService,$scope,getSvgList,auth){
        var app=this;
        app.appUser={};

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

        $scope.$on('$locationChangeSuccess',function(){
            $timeout(function(){
                app.step=$stateParams.step || 1;
            })
        });
        //for the wizard
        $timeout(function(){
            app.step=$stateParams.step || 1;
        });
      

        //organization
          //get from local storage if available -----------
        var organizationInStorage = localStorageService.get('app.organization');
        app.organization = organizationInStorage || {};
        $scope.$watch('app.organization',function(){
            localStorageService.set('app.organization',$scope.app.organization)
        }, true);

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
        })
    }])
    .filter('svgIconCardHref', ['$sce' ,function ($sce) {
        return function(svg) {
          return $sce.trustAsResourceUrl(svg);
        };
    }]);

})(angular,cui);
