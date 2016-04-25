angular.module('cui-ng')
.directive('customError', ['$q', ($q) => {
  return {
    restrict: 'A',
    require:'ngModel',
    link: (scope,ele,attrs,ctrl) => {
      let promises=[],isLoading=false,amountOfRequestSent=0;

      const assignValueFromString = (startingObject,string,value) => { // gets nested scope variable from parent , used because we can't have isolate scope on this directive
        const arrayOfProperties = string.split('.');
        arrayOfProperties.forEach((property,i)=> {
          if(i < arrayOfProperties.length-1) startingObject = startingObject[property];
          else startingObject[property] = value;
        });
      };

      const startLoading = () => {
        isLoading=true;
        amountOfRequestSent++;
        if(attrs.customErrorLoading) assignValueFromString(scope.$parent,attrs.customErrorLoading,true);
      };

      const finishLoading = () => {
        isLoading=false;
        if(attrs.customErrorLoading) assignValueFromString(scope.$parent,attrs.customErrorLoading,false);
      };


      scope.$watch(() => ctrl.$modelValue , (newValue,oldValue) => {
        console.log(newValue);
        angular.forEach(scope.$eval(attrs.customError),(checkFunction,errorName) => {
          const checkFunctionReturn = checkFunction(newValue);

          if(typeof checkFunctionReturn === "boolean") {
            ctrl.$setValidity(errorName,checkFunctionReturn);
          }
          else {
            startLoading();
            promises.push(checkFunctionReturn.promise);
            $q.all(promises).then( res => {
              ctrl.$setValidity(errorName, checkFunctionReturn.valid(res[promises.length-1]));
              finishLoading();
            }, err => {
              checkFunctionReturn.catch && checkFunctionReturn.catch(err);
              finishLoading();
            });
          }
        });
      },(newValue,oldValue) => newValue !== oldValue );
    }
  };
}]);