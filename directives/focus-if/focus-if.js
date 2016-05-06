angular.module('cui-ng')
.directive('focusIf', ['$timeout',($timeout) => {
    return {
        restrict: 'A',
        link: (scope, elem, attrs) => {
            const element = elem[0];

            const focus = (condition) => {
                if (condition) {
                    $timeout(() => {
                        element.focus();
                    }, scope.$eval(attrs.focusDelay) || 0);
                }
            };

            if (attrs.focusIf) {
                scope.$watch(attrs.focusIf, focus);
            } else {
                focus(true);
            }
        }
    };
}]);