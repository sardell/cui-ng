angular.module('cui-ng')
.directive('cuiTableHeader', ($filter) => ({
    restrict: 'E',
    scope: {
        headers: '=',
        sorting: '=?',
        sortingCallbacks: '=?'
    },
    link: (scope) => {
        if (scope.sortingCallbacks) {
            scope.cuiTableHeader = {}
            scope.headers.forEach(header => {
                let translatedHeader = $filter('translate')(header).toLowerCase()
                scope.cuiTableHeader[translatedHeader + 'Callback'] = scope.sortingCallbacks[translatedHeader] || angular.noop
            })
            scope.cuiTableHeader.invertSortingDirection = () => {
                if (scope.sorting.sortType === 'asc') {
                    scope.sorting.sortType = 'desc'
                    return 'desc'
                }
                else {
                    scope.sorting.sortType = 'asc'
                    return 'asc'
                }
            }
        }

        scope.headerCallbackHandler = (header) => {
            let translatedHeader = $filter('translate')(header).toLowerCase()
            if (scope.sorting && scope.sortingCallbacks) {
                if (!scope.sorting.hasOwnProperty('sortType')) scope.sorting['sortType'] = 'asc'
                if (scope.sorting.sortBy === translatedHeader) scope.cuiTableHeader.invertSortingDirection()
                scope.cuiTableHeader[translatedHeader + 'Callback']()
            }
        }

        scope.shouldShowCaret = (header) => {
            if (scope.sorting && scope.sortingCallbacks) {
                let translatedHeader = $filter('translate')(header).toLowerCase()
                if (scope.sorting.sortBy === translatedHeader) return true
                else return false
            }
        }
    },
    template: `
        <div class="cui-flex-table__th cui-flex-table__th--c">
            <div class="cui-flex-table__avatar-col" ng-click="headerCallbackHandler(headers[0])">
                <span class="cui-flex-table__th-container">
                    {{headers[0] | translate}}
                    <svg class="cui-flex-table__th-arrow"
                        viewBox="0 0 216 146"
                        ng-if="shouldShowCaret(headers[0])"
                        ng-class="'cui-flex-table__th-arrow--' + sorting.sortType"
                    >
                        <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="node_modules/@covisint/cui-icons/dist/font-awesome/font-awesome-out.svg#arrowhead5" class="svg"></use>
                    </svg>
                </span>
            </div>

            <div class="cui-flex-table__mobile-stack">
                <div class="cui-flex-table__left"></div>
                <div ng-class="{'cui-flex-table__middle':$middle, 'cui-flex-table__right':$last}" 
                    ng-repeat="header in headers" 
                    ng-click="headerCallbackHandler(header)"
                    ng-if="!$first"
                >
                    {{header | translate}}
                    <svg class="cui-flex-table__th-arrow" style="position:inherit"
                        viewBox="0 0 216 146"
                        ng-if="shouldShowCaret(header)"
                        ng-class="'cui-flex-table__th-arrow--' + sorting.sortType">
                        <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="node_modules/@covisint/cui-icons/dist/font-awesome/font-awesome-out.svg#arrowhead5" class="svg"></use>
                    </svg>
                </div>
            </div>
        </div>
    `
}))
