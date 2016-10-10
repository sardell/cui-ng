angular.module('cui-ng')
.directive('cuiTableRow', () => ({
    restrict: 'E',
    transclude: true,
    template: `<ng-transclude></ng-transclude>`
}))
