angular.module('cui-ng')
.directive('onEnter',['$timeout',function($timeout){
    return {
        restrict:'A',
        scope:true,
        link:function(scope,element,attrs){
            element.bind("keydown keypress", function (event) {
                if(event.which === 13) {
                    event.preventDefault();
                    var callback=scope.$eval(attrs.onEnter);
                    if(scope.$eval(attrs.ngModel)){
                      $timeout(function(){
                        callback(scope.$eval(attrs.ngModel));
                      });
                    }
                    else $timeout(function(){ callback(); });
                }
            });

            scope.$on('destroy',function(){
                element.unbind();
            });
        }
    };
}]);