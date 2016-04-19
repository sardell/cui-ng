angular.module('cui-ng')
.directive('customError', [function(){
  return {
    restrict: 'A',
    require:'ngModel',
    link: function(scope,ele,attrs,ctrl){
      var numberOfPromises=0,promisesResolved=0,isLoading=false;

      var assignValueFromString=function(startingObject,string,value){ // gets nested scope variable from parent , used because we can't have isolate scope on this directive
        string=string.split('.');
        string.forEach(function(stringPartial,i){
          if(i < string.length-1) startingObject=startingObject[stringPartial];
          else startingObject[stringPartial]=value;
        });
      };

      var checkIfDoneResolvingPromises=function(){
        promisesResolved++;
        if(promisesResolved===numberOfPromises) {
          finishLoading();
        }
      };

      var startLoading=function(){
        isLoading=true;
        if(attrs.customErrorLoading) assignValueFromString(scope.$parent,attrs.customErrorLoading,true);
      };

      var finishLoading=function(){
        isLoading=false;
        if(attrs.customErrorLoading) assignValueFromString(scope.$parent,attrs.customErrorLoading,false);
      };


      scope.$watch(function(){ return ctrl.$viewValue },function(newValue,oldValue){
        angular.forEach(scope.$eval(attrs.customError),function(checkFunction,errorName){
          var checkFunctionReturn=checkFunction(newValue);

          if(typeof checkFunctionReturn==="boolean") {
            ctrl.$setValidity(errorName,checkFunctionReturn);
          }
          else {
            numberOfPromises++;
            if(!isLoading) startLoading();
            Promise.resolve(checkFunctionReturn.promise).then(function(res){
              ctrl.$setValidity(errorName, checkFunctionReturn.valid(res));
              checkIfDoneResolvingPromises();
            },function(err){
              checkFunction.catch && checkFunction.catch(err);
              checkIfDoneResolvingPromises();
            });
          }
        });
      },function(newValue,oldValue){
        return newValue!==oldValue;
      });
    }
  };
}]);