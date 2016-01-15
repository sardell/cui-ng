angular.module('cui-ng')
.directive('customError', [function(){
  return {
    restrict: 'A',
    require:'ngModel',
    scope:{
      customError: '=customError'
    },
    link: function(scope,ele,attrs,ctrl){
      angular.forEach(scope.customError,function(error,i){
        scope.$watch(scope.customError[i].check,function(valid){
          ctrl.$setValidity(scope.customError[i].name,valid);
        });
      });
    }
  };
}]);