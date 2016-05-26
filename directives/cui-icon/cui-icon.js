angular.module('cui-ng')
.directive('cuiIcon',['$cuiIcon',($cuiIcon) => {
    return {
        restrict:'E',
        scope:{},
        link:(scope,elem,attrs) => {
            const icon = attrs.cuiSvgIcon;

            let viewBox, preserveaspectratio, svgClass, path;

            attrs.preserveaspectratio ? preserveaspectratio = `preserveAspectRatio="${attrs.preserveaspectratio}"` : preserveaspectratio = '';
            attrs.svgClass? svgClass = `class="${attrs.svgClass}"` : svgClass = '';
            attrs.viewbox? viewBox=`viewBox="${attrs.viewbox}"` : viewBox='';

            if(icon && icon.indexOf('.svg')>-1){ // if the path is directly specified
                path = icon;
            }
            else if(icon){ // if the icon is pointing at a namespace put into the provider
                const [ iconNamespace, iconId] = icon.split(':');
                path = $cuiIcon.getIconSet(iconNamespace).path + '#' + iconId;
                if(viewBox==='' && $cuiIcon.getIconSet(iconNamespace).viewBox){
                    viewBox=' viewBox="' + $cuiIcon.getIconSet(iconNamespace).viewBox + '" ';
                }
            }
            else throw new Error('You need to define a cui-svg-icon attribute for cui-icon');
            const newSvg = $(
                `<svg xmlns="http://www.w3.org/2000/svg" ${preserveaspectratio} ${svgClass} ${viewBox}>
                    <use xlink:href="${path}"></use>
                </svg>`
            );

            angular.element(elem).replaceWith(newSvg);
        }
    };
}]);