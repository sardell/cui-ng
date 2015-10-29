(function(angular){'use strict'

	angular.module('cui-ng',[]);

(function(angular){
    angular.module('cui-ng')
    .directive('cuiAvatar',[function(){
        return{
            restrict: 'E',
            scope:{},
            link:function(scope,elem,attrs){
                scope.user={};
                attrs.$observe('userAvatar',function(){
                    if(attrs.userAvatar!==''){
                        scope.user.avatar=attrs.userAvatar;
                        var background= 'url("' + scope.user.avatar + '")';
                        angular.element(elem).css('background-image',background);
                    } 
                    else{
                        scope.user.color='#AAA';
                        var background= scope.user.color;
                        angular.element(elem).css({'background-image':'none','background-color':background})
                    }
                })
            }
        };
    }])
})(angular);


angular.module('cui-ng')
.directive('cuiExpandable',[function(){
    return{
        restrict:'E',
        scope: true,
        link:function(scope,elem,attrs){
          scope.toggleExpand=function(){
              attrs.$set('expanded',!attrs.expanded);
          };
        }
    };
}]);


angular.module('cui-ng')
.directive('cuiWizard',['$timeout','$compile','$window',function($timeout,$compile,$window){
    return{
        restrict: 'E',
        scope: true,
        link:function(scope,elem,attrs){
            //init
            var init = function(){
                    scope.invalidForm=[];
                    scope.$steps=document.querySelectorAll('cui-wizard>step');
                    scope.numberOfSteps=scope.$steps.length;
                    scope.$indicatorContainer=document.querySelector('indicator-container');
                    scope.$window=angular.element($window);
                    scope.currentStep=Number(elem[0].attributes.step.value);
                    scope.clickableIndicators=attrs.clickableIndicators;
                    scope.minimumPadding=attrs.minimumPadding;
                    scope.next=function(){
                        scope.currentStep++;
                        updateIndicators();
                    };
                    scope.previous=function(form){
                        if(form && form.$invalid){
                            scope.invalidForm[currentStep]=true;
                        }
                        scope.currentStep--;
                        updateIndicators();
                    };
                    scope.goToStep=function(step){
                        scope.currentStep=step;
                        updateIndicators();
                    };
                    scope.nextWithErrorChecking=function(form){
                        if(form.$invalid){
                            angular.forEach(form.$error, function (field) {
                                angular.forEach(field, function(errorField){
                                    errorField.$setTouched();
                                })
                            });
                            scope.invalidForm[scope.currentStep]=true;
                        }
                        else{
                            scope.invalidForm[scope.currentStep]=false;
                            scope.next();
                        }
                    };
                    if(isNaN(scope.currentStep)){
                        scope.currentStep=1;
                    }
                    else if(scope.currentStep>scope.numberOfSteps){
                        scope.currentStep=scope.numberOfSteps;
                    }
                    else if(scope.currentStep<1){
                        scope.currentStep=1;
                    }
                    createIndicators();
                    updateIndicators();
                    makeSureTheresRoom();
                    watchForWindowResize();
                    listenForLanguageChange();
                    observeStepAttr();
                },
                // creates indicators inside of <indicator-container>
                createIndicators = function(){
                    var stepTitles=[];
                    for(var i=0;i < scope.numberOfSteps;i++){
                        stepTitles[i]=scope.$steps[i].attributes.title.value;
                    }
                    stepTitles.forEach(function(e,i){
                        var div;
                        if(scope.clickableIndicators!==undefined){
                            div=angular.element('<span class="step-indicator" ng-click="goToStep(' + 
                                (i+1) + ')">' + stepTitles[i] + '</span>');
                            div[0].style.cursor='pointer';
                        }
                        else{
                            div=angular.element('<span class="step-indicator">' + stepTitles[i] + '</span>');
                        }
                        var compiled=$compile(div)(scope);
                        angular.element(scope.$indicatorContainer).append(compiled);
                    });
                    scope.$indicators=document.querySelectorAll('.step-indicator');
                },
                // updates the current active indicator. Removes active class from other elements.
                updateIndicators = function(){
                    $timeout(function(){
                        var currentStep=scope.currentStep;
                        for(var i=0; i<scope.$steps.length ; i++){
                            scope.$steps[i].classList.remove('active');
                            scope.$indicators[i].classList.remove('active');
                        }
                        scope.$steps[currentStep-1].classList.add('active');
                        scope.$indicators[currentStep-1].classList.add('active');
                    });
                },
                debounce = function(func, wait, immediate) {
                    var timeout;
                    return function() {
                        var context = this, args = arguments;
                        var later = function() {
                            timeout = null;
                            if (!immediate) {func.apply(context, args)};
                        };
                        var callNow = immediate && !timeout;
                        clearTimeout(timeout);
                        timeout = setTimeout(later, wait);
                        if (callNow) func.apply(context, args);
                    };
                },
                getIndicatorsWidth = function(){
                    var totalWidth=0;
                    for(var i=0 ; i<scope.numberOfSteps ; i++){
                        totalWidth += scope.$indicators[i].scrollWidth;
                    }
                    //adds the minimum padding between the steps.
                    return totalWidth+((Number(scope.minimumPadding) || 0)*(scope.numberOfSteps-1));
                },
                getIndicatorContainerWidth = function(){
                    return scope.$indicatorContainer.clientWidth;
                },
                onlyShowCurrentIndicator = function(){
                    scope.$indicatorContainer.classList.add('small');
                },
                showAllIndicators = function(){
                    scope.$indicatorContainer.classList.remove('small');
                },
                //makes sure there's still room for the step indicators, has a debounce on it so it
                //doesn't fire too often.
                makeSureTheresRoom = debounce(function(){
                    var indicatorsWidth=getIndicatorsWidth();
                    var indicatorContainerWidth=getIndicatorContainerWidth();
                    if((indicatorContainerWidth < indicatorsWidth) && 
                            (indicatorContainerWidth < (Math.max((scope.indicatorsWidth || 0),indicatorsWidth)))){
                        scope.indicatorsWidth=indicatorsWidth;
                        onlyShowCurrentIndicator();
                    }
                    else if(indicatorContainerWidth > scope.indicatorsWidth){
                        showAllIndicators();
                    }
                }, 40),
                watchForWindowResize = function(){
                    scope.$window.bind('resize',function(){
                        makeSureTheresRoom();
                    })
                },
                listenForLanguageChange = function(){
                    scope.$on('languageChange',function(){
                        showAllIndicators();
                        makeSureTheresRoom();
                    })
                },
                observeStepAttr = function(){
                    attrs.$observe('step',function(newStep){
                        if(isNaN(newStep)){
                            scope.currentStep=1;
                        }
                        else if(newStep>scope.numberOfSteps){
                            scope.currentStep=scope.numberOfSteps;
                        }
                        else if(newStep<1){
                            scope.currentStep=1;
                        }
                        else{
                            scope.currentStep=newStep;
                        }
                    })
                };
            init();   
        }
    };
}]);

angular.module('cui-ng')
.directive('passwordValidation', [function(){		
	return {		
		require: 'ngModel',		
		scope: true,		
		restrict: 'A',		
		link: function(scope, element, attrs, ctrl){		
			ctrl.$validators.length = function(modelValue,viewValue){		
				if(/^.{8,20}$/.test(viewValue)){ return true; } else { return false; }		
			}		
			ctrl.$validators.lowercase = function(modelValue,viewValue){		
				if(/.*[a-z].*/.test(viewValue)){ return true; } else { return false; }		
			}		
			ctrl.$validators.uppercase = function(modelValue,viewValue){		
				if(/.*[A-Z].*/.test(viewValue)){ return true; } else { return false; }		
			}		
			ctrl.$validators.number = function(modelValue,viewValue){		
				if(/.*[0-9].*/.test(viewValue)){ return true; } else { return false; }		
			}		
			ctrl.$validators.complex = function(modelValue,viewValue){		
				if(/[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/.test(viewValue)){ return true; } else { return false; }		
			}		
		}		
	};		
}]);

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

// Dynamic resizing of icons based on screen size


window.onload = function() {
    window.onresize = function() {
        var svg = document.getElementsByClassName('svg-holder');
        var clientWidth = document.documentElement.clientWidth;
        resizeIcons(clientWidth, svg);
    } 

    var resizeIcons = function(sourceWidth, target) {
        var docEl = document.documentElement;
        if (sourceWidth < 1150) {
            docEl.style.fontSize = (sourceWidth/100) + 'px';
        }
        else {
            docEl.style.fontSize = 1 + 'rem';
        }
    };
};


})(angular);