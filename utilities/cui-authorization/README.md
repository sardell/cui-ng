# CUI Authorization
Version 1.0


### Description
Cui-authorization is a module that depends on [ui-router](https://github.com/angular-ui/ui-router) and will allow a user to navigate through pages / view page elements based on his entitlements/permissions.

### Usage Example

```javascript
//note, the user object must have an 'entitlements' property,
//which is an array of entitlement strings. ex: ['admin','user']
  angular.module('app',['cui.authorization','ui.router']
  .run(['$rootScope','$state','cui.athorization.routing',function($rootScope,$state,routing){
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
      routing($rootScope, $state, toState, toParams, fromState, fromParams, *user object goes here*);
    }
  }])
  .config(['$stateProvider','$urlRouterProvider','$locationProvider',function($stateProvider,$urlRouterProvider,$locationProvider){
    $stateProvider
      .state('home',{
        url: '/home',
        access: {
          loginRequired: true
        }
      })
      .state('login',{ //required, see below
        url: '/login'
      })
      .state('notAuthorized',{ //required, see below
        url: '/notAuthorized'
      })
      .state('adminOnly',{
        url: '/adminOnly',
        access: {
          loginRequired: true,
          requiredEntitlements: ['admin'],
          entitlementType: 'all'
        }
      })
      .state('userAndAdmin',{
        url: '/userAndAdmin',
        access: {
          loginRequired: true,
          requiredEntitlements: ['admin','user'],
          entitlementType: 'atLeastOne'
        }
      })
    }])
  }]);

```

### How it works / features
With this implementation, this module will listen to the `$stateChangeStart` event on $rootScope that is fired by ui-router everytime that the state changes. Then, based on the user's `entitlements` it determines if the user is allowed to see that page or not.

TODO - element blocking

#### Redirecting
There are 2 types of redirection:

1. The user is not logged in (the user object is undefined or empty), in this case the module will redirect him to the `login` state.
2. The user does not have permission to view the page (no entitlement), in this case he gets redirected to the `notAuthorized` state.

#### Key features
Within `entitlementType` in the `access` object of each state there are 2 options for how the authorization will be evaluated - `'atLeastOne'` and `'all'`. The first will give the user authorization if he satisfies <b>at least one</b> of the `requiredEntitlements`. The second will only give him permission if he satisfies <b>all</b> of the entitlements.
