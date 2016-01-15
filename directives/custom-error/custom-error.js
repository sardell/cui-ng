angular.module('cui-ng')
.directive('customError', [function(){
  return {
    restrict: 'A',
    require:'ngModel',
    scope:{
      customError: '=customError'
    },
    link: function(scope,ele,attrs,ctrl){
      var check;
      for(var i=0;i<scope.customError.length;i++){
        check=function(valid){
          ctrl.$setValidity(scope.customError[i].name,valid);
        };
        scope.$watch(scope.customError[i].check,check);
      }
    }
  };
}]);