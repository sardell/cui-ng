angular.module('cui-ng')
.directive('customError', ($q) => {
    return {
        restrict: 'A',
        require:'ngModel',
        scope: {
            customError: '=',
            customErrorLoading: '=?'
        },
        link: (scope, attrs, ele, ctrl) => {
            let promises = {}

            scope.$watch(() => ctrl.$modelValue, (newValue, oldValue) => {
                angular.forEach(scope.customError, (checkFunction, errorName) => {
                    const checkFunctionReturn = checkFunction(newValue)

                    if (typeof checkFunctionReturn === 'boolean') {
                        ctrl.$setValidity(errorName, checkFunctionReturn)
                    }
                    else {
                        scope.customErrorLoading = true

                        if (!promises[errorName]) promises[errorName] = [checkFunctionReturn.promise]
                        else promises[errorName].push(checkFunctionReturn.promise)

                        $q.all(promises[errorName]).then( res => {
                            ctrl.$setValidity(errorName, checkFunctionReturn.valid(res[promises[errorName].length-1]))
                            scope.customErrorLoading = false
                        }, 
                        err => {
                            checkFunctionReturn.catch && checkFunctionReturn.catch(err)
                            scope.customErrorLoading = false
                        })
                    }
                })
            }, (newValue,oldValue) => newValue !== oldValue )
        }
    }
})
