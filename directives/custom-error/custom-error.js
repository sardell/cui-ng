angular.module('cui-ng')
.directive('customError', [function(){
  return {
    restrict: 'A',
    require:'ngModel',
    scope:{
      customError: '=customError'
    },
    link: function(scope,ele,attrs,ctrl){
      var index;
      var check=function(valid){
        if(valid){
            ctrl.$setValidity(scope.customError[index].name,true);
          }
        else ctrl.$setValidity(scope.customError[index].name,false);
      };
      var startWatching=function(){
        for(var i=0;i<scope.customError.length;i++){
          index=i;
          scope.$watch(scope.customError[i].check,check);
        }
      };
      startWatching();
    }
  };
}]);