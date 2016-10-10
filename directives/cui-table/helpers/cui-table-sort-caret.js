angular.module('cui-ng')
.directive('sortingCaret', () => ({
    restrict: 'E',
    transclude: true,
    scope: {
        sortingDirection: '=',
        inverted: '='
    },
    template: `
        <span>
            <span ng-if="!inverted">
                <span ng-if="sortingDirection==='desc'"><cui-icon cui-svg-icon="fa:caret5"></cui-icon></span>
                <span ng-if="sortingDirection==='asc'"><cui-icon cui-svg-icon="fa:caret6"></cui-icon></span>
            </span>
            <span ng-if="inverted">
                <span ng-if="sortingDirection==='asc'"><cui-icon cui-svg-icon="fa:caret5"></cui-icon></span>
                <span ng-if="sortingDirection==='desc'"><cui-icon cui-svg-icon="fa:caret6"></cui-icon></span>
            </span>
        </span>
    `
}))
