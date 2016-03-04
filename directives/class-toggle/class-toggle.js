angular.module('cui-ng')
.directive('classToggle',[function(){
    return{
        restrict:'EC',
        scope: true,
        link:function(scope,elem,attrs){
            var toggledClass=attrs.toggledClass,
                elementClass=function(){
                    return elem.attr('class');
                },
                checkIfToggled=function(elementClass){
                    if(elementClass.indexOf(toggledClass)>-1) scope.toggled=true;
                    else scope.toggled=false;
                }

            scope.toggleClass=function(){
                elem.toggleClass(toggledClass);
            };
            scope.toggleOn=function(){
                if(!scope.toggled) scope.toggleClass();
            };
            scope.toggleOff=function(){
                if(scope.toggled) scope.toggleClass();
            };

            scope.$watch(elementClass, checkIfToggled);


        }
    };
}]);
