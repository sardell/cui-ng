angular.module('cui-ng')
.directive('cuiIcon',['$cuiIcon',function($cuiIcon){
    return {
        restrict:'E',
        scope:{},
        link:function(scope,elem,attrs){
            var icon=attrs.cuiSvgIcon,
                viewBox,
                preserveaspectratio,
                svgClass,
                path;

            attrs.preserveaspectratio ? preserveaspectratio=' preserveAspectRatio="' + attrs.preserveaspectratio + '" ' : preserveaspectratio='';
            attrs.svgClass? svgClass=' class="' + attrs.svgClass + '" ' : svgClass='';
            attrs.viewbox? viewBox=' viewBox="' + attrs.viewbox + '" ' : viewBox='';

            if(icon && icon.indexOf('.svg')>-1){ // if the path is directly specified
                path=icon;
            }
            else if(icon){ // if the icon is pointing at a namespace put into the provider
                var iconId=icon.split(':')[1];
                var iconNamespace=icon.split(':')[0];
                path=$cuiIcon.getIconSet(iconNamespace).path + '#' + iconId;
                if(viewBox==='' && $cuiIcon.getIconSet(iconNamespace).viewBox){
                    viewBox=' viewBox="' + $cuiIcon.getIconSet(iconNamespace).viewBox + '" ';
                }
            }
            else console.log('You need to define a cui-svg-icon attribute for cui-icon');
            var newSvg=$(
                String.prototype.concat(
                    '<svg xmlns="http://www.w3.org/2000/svg" ', preserveaspectratio , svgClass, viewBox,'>',
                        '<use xlink:href="', path ,'"></use>',
                    '</svg>'
                )
            );

            angular.element(elem).replaceWith(newSvg);
        }
    };
}]);