angular.module('cui-ng')
.directive('match', ['$parse', matchDirective]);
function matchDirective($parse) {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope, element, attrs, ctrl) {
      var checkIfMatch=function(values){
        ctrl.$setValidity('match', values[0] === (values[1] || ''));
      };

      scope.$watch(function () {
        return [scope.$eval(attrs.match), ctrl.$viewValue];
      }, checkIfMatch,true);
    }
  };
}