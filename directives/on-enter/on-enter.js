angular.module('cui-ng')
.directive('onEnter',['$timeout',($timeout) => {
    return {
        restrict:'A',
        link:(scope,element,attrs) => {
            element.bind("keydown keypress", (event) => {
                if(event.which === 13) {
                    event.preventDefault();
                    const callback = scope.$eval(attrs.onEnter);
                    if(scope.$eval(attrs.ngModel)){
                      $timeout(() => {
                        callback(scope.$eval(attrs.ngModel));
                      });
                    }
                    else $timeout(() => { callback(); });
                }
            });

            scope.$on('destroy',() => {
                element.unbind();
            });
        }
    };
}]);