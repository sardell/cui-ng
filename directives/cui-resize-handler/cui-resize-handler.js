angular.module('cui-ng')
.directive('cuiResizeHandler', ($cuiResizeHandler, $window) => {
	return {
		restrict: 'E',
		transclude: true,
		scope: {
			showIf: '=',
			breakpoint: '='
		},
		link: (scope, elem, attrs) => {
			const elementHandler = (breakpoint) => {
				if (scope.breakpoint) {
					if (attrs.hasOwnProperty('mobile') && $window.innerWidth < scope.breakpoint) scope.showIf = true
					else if (attrs.hasOwnProperty('desktop') && $window.innerWidth >= scope.breakpoint) scope.showIf = true
					else scope.showIf = false
				}
				else {
					if (attrs.hasOwnProperty('mobile') && $window.innerWidth < breakpoint) scope.showIf = true
					else if (attrs.hasOwnProperty('desktop') && $window.innerWidth >= breakpoint) scope.showIf = true
					else scope.showIf = false
				}
				scope.$evalAsync(scope)
			}

			const getScreenState = (customBreakpoint) => {
				if (customBreakpoint) {
					if ($window.innerWidth < customBreakpoint) return 'mobile'
					else return 'desktop'
				}
				else {
					if ($window.innerWidth < $cuiResizeHandler.breakpoint) return 'mobile'
					else return 'desktop'
				}
			}

			const getBreakpoint = () => {
				if (scope.breakpoint) return scope.breakpoint
				else return $cuiResizeHandler.breakpoint
			}
		
			const resizeHandler = _.throttle(function() {
				$cuiResizeHandler.callHandlers()
			}, 300)

			$cuiResizeHandler.setHandler(scope.$id, elementHandler, getBreakpoint())
			$cuiResizeHandler.callHandlers()
			$window.onresize = resizeHandler

			scope.$on('$destroy', () => {
				$cuiResizeHandler.destroyElement(scope.$id)
			})
		},
		template: `
			<div ng-if="showIf"><ng-transclude></ng-transclude></div>
		`
	}
})
