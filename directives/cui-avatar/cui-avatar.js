angular.module('cui-ng')
.directive('cuiAvatar',['$timeout','$http','$filter',($timeout,$http,$filter) => {
    return{
        restrict: 'A',
        scope:{
            cuiAvatar:'=',
            cuiAvatarNames:'=',
            cuiAvatarEmail:'='
        },
        link:(scope,elem,attrs) => {
            const cuiAvatar = {
                selectors:{
                    $elem:angular.element(elem[0])
                },
                config:{
                    colorClassPrefix:attrs.cuiAvatarColorClassPrefix || false,
                    colorCount:attrs.cuiAvatarColorCount || 0,
                    cuiI18nFilter:angular.isDefined(attrs.cuiAvatarCuii18nFilter) || false,
                    maxNumberOfInitials: attrs.cuiAvatarMaxNumInitials || 2
                },
                watchers:() => {
                   scope.$watch('cuiAvatar',(newAvatar) => {
                       if(newAvatar) cuiAvatar.update();
                   });
                    scope.$watch('cuiAvatarNames',(newNameArray) => {
                       if(newNameArray) cuiAvatar.update();
                   });
                   scope.$watch('cuiAvatarEmail',(newEmail) => {
                        if(newEmail) cuiAvatar.update();
                   });
                },
                render:{
                    nameBackground:() => {
                        if(cuiAvatar.config.colorClassPrefix) {
                            if(cuiAvatar.config.colorCount===0) throw 'For cui-avatar if you specify color class prefix you must specify the attribute cui-avatar-color-count';

                            let colorClassAlreadyApplied = _.find(cuiAvatar.selectors.$elem[0].classList,(className) => className.indexOf(cuiAvatar.config.colorClassPrefix)>-1 );
                            if(colorClassAlreadyApplied) return;

                            let classNumberToApply = Math.floor(Math.random()*cuiAvatar.config.colorCount + 1);
                            cuiAvatar.selectors.$elem[0].classList.add(cuiAvatar.config.colorClassPrefix + classNumberToApply);
                            cuiAvatar.config.colorClassAdded = cuiAvatar.config.colorClassPrefix + classNumberToApply;
                        }
                    },

                    initials:() => {
                        if (!scope.cuiAvatarNames) return;
                        const name = () => {
                            let internationalizedName, nameToDisplay = '';
                            if (cuiAvatar.config.cuiI18nFilter) {
                                internationalizedName = $filter('cuiI18n')(scope.cuiAvatarNames).split(' ');
                            }
                            (internationalizedName || scope.cuiAvatarNames).forEach((nameSection, i) => {
                                if (i < cuiAvatar.config.maxNumberOfInitials) {
                                    if (!nameSection) return;
                                    nameToDisplay += nameSection[0].toUpperCase();
                                }
                            });
                            return nameToDisplay;
                        };
                        cuiAvatar.selectors.$elem[0].innerHTML = `<div class="cui-avatar__initials"></div>`;
                        cuiAvatar.selectors.$initials = angular.element(elem[0].querySelector('.cui-avatar__initials'));
                        cuiAvatar.selectors.$initials[0].innerHTML = name();
                    },

                    image:() =>{
                        const applyImage = (imgSrc) => {
                            if(cuiAvatar.config.colorClassAdded) cuiAvatar.selectors.$elem[0].classList.remove(cuiAvatar.config.colorClassAdded); // remove the random color class added before applying an image
                            cuiAvatar.selectors.$elem[0].innerHTML = `<div class="cui-avatar__image-container"></div>`;
                            cuiAvatar.selectors.$image = angular.element(elem[0].querySelector('.cui-avatar__image-container'));
                            cuiAvatar.selectors.$image[0].style.backgroundImage = `url("${imgSrc}")`;
                        }
                        let img = new Image();
                        if(scope.cuiAvatar && scope.cuiAvatar!==''){
                            img.src = scope.cuiAvatar;
                            img.onload = applyImage(img.src);
                        }
                        else if (scope.cuiAvatarEmail){
                            const hashedEmail = md5(scope.cuiAvatarEmail);
                            $http.get(`https://www.gravatar.com/avatar/${hashedEmail}?d=404`) // ?d=404 tells gravatar not to give me a default gravatar
                            .then((res)=> { // If the user has a gravatar account and has set a picture
                                img.src = `https://www.gravatar.com/avatar/${hashedEmail}`;
                                img.onload = applyImage(img.src);
                            });
                        }
                        else return;
                    }
                },
                update:() => {
                    cuiAvatar.render.nameBackground();
                    cuiAvatar.render.initials();
                    cuiAvatar.render.image();
                }
            };
            cuiAvatar.render.nameBackground();
            cuiAvatar.render.initials();
            cuiAvatar.render.image();
            cuiAvatar.watchers();
        }
    };
}]);