angular.module('cui-ng')
.directive('tether',['$timeout','$parse',function($timeout,$parse){
  return {
    restrict:'A',
    scope:false,
    link : function(scope,elem,attrs){
      elem[0].classList.add('hide--opacity'); // this fixes the incorrect positioning when it first renders
      $timeout(function(){
        new Tether({
          element: elem,
          target: attrs.target,
          attachment: attrs.attachment || 'top center',
          targetAttachment: attrs.targetAttachment || 'bottom center',
          offset: attrs.offset || '0 0',
          targetOffset: attrs.targetOffset || '0 0',
          targetModifier: attrs.targetModifier || undefined,
          constrains: $parse(attrs.constrains) || undefined
        });
      }).
      then(function(){
        elem[0].classList.remove('hide--opacity');
      });
    }
  };
}]);