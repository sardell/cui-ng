angular.module('cui-ng')
.directive('match', ['$parse', ($parse) => {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: (scope, element, attrs, ctrl) => {
      const checkIfMatch = (values) => {
        ctrl.$setValidity('match', values[0] === (values[1] || ''));
      };

      scope.$watch(()=> [scope.$eval(attrs.match), ctrl.$viewValue], checkIfMatch, (newValues,oldValues) => !angular.equals(newValues,oldValues));
    }
  };
}]);