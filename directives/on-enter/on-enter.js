angular.module('cui-ng')
.directive('onEnter',['$timeout',($timeout) => {
    return {
        restrict:'A',
        require: 'ngModel',
        link:(scope,element,attrs,ctrl) => {
            element.bind("keydown keypress", (event) => {
                if(event.which === 13) {
                    event.preventDefault();
                    const callback = scope.$eval(attrs.onEnter);
                    $timeout(() => {
                        callback(ctrl.$viewValue);
                    });
                }
            });

            scope.$on('destroy',() => {
                element.unbind();
            });
        }
    };
}]);