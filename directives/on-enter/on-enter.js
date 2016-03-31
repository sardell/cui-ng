angular.module('cui-ng')
.directive('onEnter',function(){
    return {
        restrict:'A',
        scope:{
            onEnter: '=',
            ngModel: '='
        },
        link:function(scope,elem){
            element.bind("keydown keypress", function (event) {
                if(event.which === 13) {
                    event.preventDefault();
                    if(scope.ngModel) scope.onEnter(scope.ngModel);
                    else scope.onEnter();
                }
            });

            scope.$on('destroy',function(){
                element.unbind();
            });
        }
    };
})