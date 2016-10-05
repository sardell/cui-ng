angular.module('cui-ng')
.directive('resultsPerPage', ['$compile','$pagination', ($compile,$pagination) => {
    return {
        restrict: 'E',
        scope: {
            selected: '=ngModel'
        },
        link: (scope, elem, attrs) => {
            const resultsPerPage = {
                initScope: () => {
                    scope.options = $pagination.getPaginationOptions();
                    scope.selected = $pagination.getUserValue() || scope.options.intervals[0];
                    scope.intervals = scope.options.intervals

                    scope.$watch('selected', (selected) => {
                        $pagination.setUserValue(selected);
                        scope.selected = selected;
                    });
                },
                config: {
                    selectClass: attrs.class || 'cui-dropdown'
                },
                render: () => {
                    const element = $compile(`<cui-dropdown class="${resultsPerPage.config.selectClass}" ng-model="selected" options="intervals"></cui-dropdown>`)(scope);
                    angular.element(elem).replaceWith(element);
                }
            };
            resultsPerPage.initScope();
            resultsPerPage.render();
        }
    };
}]);