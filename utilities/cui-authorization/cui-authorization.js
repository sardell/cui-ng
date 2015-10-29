  // how to use:
  // .run(['$rootScope', '$state', 'cui.authorization.routing' function($rootScope,$state){
  //   $rootScope.$on('$stateChangeStart', function(event, toState){
  //     cui.authorization.routing($state,toState,user);
  //   })
  // }])
  //
  // User must be an object with a property called 'entitlements'
  // It will redirect to a state called 'login' if no user is defined
  // It will redirect to a state called 'notAuthorized' if the user doesn't have permission
  angular.module('cui.authorization',[])
  .factory('cui.authorization.routing', ['cui.authorization.authorize', '$timeout',
    function (authorize,$timeout){
      var routing = function($rootScope, $state, toState, toParams, fromState, fromParams, user){
        var authorized;
        if (toState.access !== undefined) {
          // console.log('Access rules for this route: \n' +
          // 'loginRequired: ' + toState.access.loginRequired + '\n' +
          // 'requiredEntitlements: ' + toState.access.requiredEntitlements);
            authorized = authorize.authorize(toState.access.loginRequired,
                 toState.access.requiredEntitlements, toState.access.entitlementType, user);
            // console.log('authorized: ' + authorized);
            if (authorized === 'login required') {
                $timeout(function(){
                  $state.go('login',toParams).then(function() {
                    $rootScope.$broadcast('$stateChangeSuccess', toState, toParams, fromState, fromParams);
                  });
                });
            } else if (authorized === 'not authorized') {
                $timeout(function(){
                  $state.go('notAuthorized',toParams).then(function() {
                      $rootScope.$broadcast('$stateChangeSuccess', toState, toParams, fromState, fromParams);
                  });
                });
            }
            else if(authorized === 'authorized'){
              $timeout(function(){
                $state.go(toState.name,toParams,{notify:false}).then(function() {
                    $rootScope.$broadcast('$stateChangeSuccess', toState, toParams, fromState, fromParams);
                });
              });
            }
        }
        else {
          $state.go(toState.name,toParams,{notify:false}).then(function() {
              $rootScope.$broadcast('$stateChangeSuccess', toState, toParams, fromState, fromParams);
          });
        }
      }

      return routing;
    }])


  .factory('cui.authorization.authorize', [
    function () {
     var authorize = function (loginRequired, requiredEntitlements, entitlementType, user) {
        var loweredPermissions = [],
            hasPermission = true,
            permission, i, 
            result='not authorized';
        entitlementType = entitlementType || 'atLeastOne';
        if (loginRequired === true && ((user === undefined) || (user.id === undefined))) {
            result = 'login required';
        } else if ((loginRequired === true && user !== undefined) &&
            (requiredEntitlements === undefined || requiredEntitlements.length === 0)) {
            // Login is required but no specific permissions are specified.
            result = 'authorized';
        } else if (requiredEntitlements) {
            angular.forEach(user.entitlements, function (permission) {
                loweredPermissions.push(permission.toLowerCase());
            });
            for (i = 0; i < requiredEntitlements.length; i++) {
                permission = requiredEntitlements[i].toLowerCase();

                if (entitlementType === 'all') {
                    hasPermission = hasPermission && loweredPermissions.indexOf(permission) > -1;
                    // if all the permissions are required and hasPermission is false there is no point carrying on
                    if (hasPermission === false) {
                        break;
                    }
                } else if (entitlementType === 'atLeastOne') {
                    hasPermission = loweredPermissions.indexOf(permission) > -1;
                    // if we only need one of the permissions and we have it there is no point carrying on
                    if (hasPermission) {
                        break;
                    }
                }
            }
            result = hasPermission ?
                     'authorized' :
                     'not authorized';
        }
        return result;
    };

        return {
         authorize: authorize
        };
  }])

  .directive('cuiAccess',['cui.authorization.authorize',function(authorize){
      return{
          restrict:'A',
          scope: true,
          link: function(scope,elem,attrs){
              var access= JSON.parse(attrs.cuiAccess);
              scope.loginRequired= true;
              scope.requiredEntitlements= access.requiredEntitlements || [];
              scope.entitlementType= access.entitlementType || 'atLeastOne';
              var elem=angular.element(elem);
              attrs.$observe('user',function(){
                  scope.user= JSON.parse(attrs.user);
                  var authorized=authorize.authorize(scope.loginRequired, scope.requiredEntitlements, scope.entitlementType, scope.user);
                  if(authorized!=='authorized'){
                      elem.addClass('hide');
                  }
                  else{
                      elem.removeClass('hide');
                  }
              });
          }
      }
  }]);