# CUI Authorization
Version 1.0


### Description
Cui-authorization is a module that depends on [ui-router](https://github.com/angular-ui/ui-router) and will allow a user to navigate through pages / view page elements based on his entitlements/permissions.

### Usage Example

```javascript
// note: entitlements must be an array of entitlement strings. ex: ['admin','user']
  angular.module('app',['cui.authorization','ui.router']
  .run(['$rootScope','$state','cui.authorization.routing',function($rootScope,$state,routing){
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
      routing($rootScope, $state, toState, toParams, fromState, fromParams, *entitlements array goes here*);
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

#### HTML Element Blocking

```html
<any-element cui-access="{requiredEntitlements:['admin','user'],entitlementType:'atLeastOne'}" user-entitlements="app.user.entitlements">Test</any-element>
```

This will add a `.hide` class to the element, if the user defined in app.appUser doesn't have permission to see it.

### How it works / features
With this implementation, this module will listen to the `$stateChangeStart` event on $rootScope that is fired by ui-router everytime that the state changes. Then, based on the user's `entitlements` it determines if the user is allowed to see that page or not.


#### Redirecting
There are 2 types of redirection:

1. The user entitlement array is undefined, in this case the module will redirect him to the `login` state.
2. The user does not have permission to view the page (no entitlement), in this case he gets redirected to the `notAuthorized` state.

#### Key features
Within `entitlementType` in the `access` object of each state there are 2 options for how the authorization will be evaluated - `'atLeastOne'` and `'all'`. The first will give the user authorization if he satisfies <b>at least one</b> of the `requiredEntitlements`. The second will only give him permission if he satisfies <b>all</b> of the entitlements.

## Change Log 1/18/2016

* Now takes an array of entitlements rather than a user object, this gives the developer more flexibility.
* Now takes javascript syntax directly in `cui-access` and `user-entitlements`, rather than a string that has to be parsed.
