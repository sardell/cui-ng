angular.module('cui-ng')
.directive('customError', ['$parse', function($parse){
  return {
    restrict: 'A',
    require:'ngModel',
    scope:{
      customError: '=customError'
    },
    link: function(scope,ele,attrs,ctrl){
      var checkErrors=function(){
        for(var i=0;i<scope.customError.length;i++){
          if(scope.customError[i].check()){
            ctrl.$setValidity(scope.customError[i].name,true);
          }
          else ctrl.$setValidity(scope.customError[i].name,false);
        }
      };
      if(scope.customError.length){
        scope.$watch(function(){
          checkErrors();
        });
      }
    }
  };
}]);