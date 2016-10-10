angular.module('cui-ng')
.directive('cuiTableHeader', () => ({
    restrict: 'E',
    transclude: true,
    scope: {
        headers: '=',
        sorting: '=?',
        sortingCallbacks: '=?'
    },
    link: (scope) => {
        scope.cuiHeader = {
            headerCallback: scope.sortingCallbacks || angular.noop,
            invertSortingDirection: (direction) => {
                if (direction === 'asc') return 'desc'
                else return 'asc'
            }
        }
    },
    template: `
        <div class="cui-flex-table__th cui-flex-table__th--c">
            <div class="cui-flex-table__avatar-col" ng-click="scope.cuiHeader.headerCallback(scope.headers[0])">
                <span class="cui-flex-table__th-container">
                    {{headers[0]}}
                </span>
            </div>

            <div class="cui-flex-table__mobile-stack">
                <div class="cui-flex-table__left"></div>

                <div ng-class="{'cui-flex-table__middle':$middle, 'cui-flex-table__right':$last}" 
                    ng-repeat="header in headers" 
                    ng-click="scope.cuiHeader.headerCallback(header)"
                    ng-if="!$first"
                >
                    {{header}}
                </div>
            </div>
        </div>
    `
}))
