angular.module('cui-ng')
.directive('classToggle',[() => {
    return{
        restrict:'EAC',
        scope: true,
        link:(scope,elem,attrs) => {
            const toggledClass=attrs.toggledClass || 'class-toggle-' + scope.$id,
                elementClass = () => elem.attr('class'),
                checkIfToggled = (elementClass) => {
                    scope.toggled = elementClass.indexOf(toggledClass) >= 0
                };

            scope.toggleClass = () => {
                elem.toggleClass(toggledClass);
            };
            scope.toggleOn = () => {
                if(!scope.toggled) scope.toggleClass();
            };
            scope.toggleOff = () => {
                if(scope.toggled) scope.toggleClass();
            };

            scope.$watch(elementClass, checkIfToggled);
        }
    };
}]);
