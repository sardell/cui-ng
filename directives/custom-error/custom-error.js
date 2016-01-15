angular.module('cui-ng')
.directive('customError', [function(){
  return {
    restrict: 'A',
    require:'ngModel',
    scope:{
      customError: '=customError'
    },
    link: function(scope,ele,attrs,ctrl){
      angular.forEach(scope.customError,function(customError){
        scope.$watch(customError.check,function(valid){
          ctrl.$setValidity(customError.name,valid);
        });
      });
    }
  };
}]);