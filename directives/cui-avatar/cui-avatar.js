angular.module('cui-ng')
.directive('cuiAvatar', ($http, $filter) => {
    return{
        restrict: 'A',
        scope: {
            cuiAvatar: '=',
            cuiAvatarNames: '=',
            cuiAvatarEmail: '='
        },
        compile: () => {
            return {
                pre: (scope, elem, attrs) => {
                    const cuiAvatar = {
                        selectors: {
                            $elem: angular.element(elem[0])
                        },
                        config: {
                            colorClassPrefix: attrs.cuiAvatarColorClassPrefix || false,
                            colorCount: attrs.cuiAvatarColorCount || 0,
                            cuiI18nFilter: angular.isDefined(attrs.cuiAvatarCuii18nFilter) || false,
                            maxNumberOfInitials: attrs.cuiAvatarMaxNumInitials || 2
                        },
                        watchers: () => {
                           scope.$watch('cuiAvatar', (newAvatar) => {
                               if (newAvatar) cuiAvatar.update()
                           })
                            scope.$watch('cuiAvatarNames', (newNameArray) => {
                               if (newNameArray) cuiAvatar.update()
                           })
                           scope.$watch('cuiAvatarEmail', (newEmail) => {
                                if (newEmail) cuiAvatar.update()
                           })
                        },
                        helpers: {
                            isColorClassApplied: () => {
                                return _.find(cuiAvatar.selectors.$elem[0].classList, (className) => className.indexOf(cuiAvatar.config.colorClassPrefix)>-1 )
                            },
                            applyRandomColorClass: () => {
                                const classNumberToApply = Math.floor(Math.random() * cuiAvatar.config.colorCount + 1)
                                cuiAvatar.selectors.$elem[0].classList.add(cuiAvatar.config.colorClassPrefix + classNumberToApply)
                                cuiAvatar.config.colorClassAdded = cuiAvatar.config.colorClassPrefix + classNumberToApply
                            },
                            getInitialsToDisplay: () => {
                                let internationalizedName
                                let nameToDisplay = ''
                                if (cuiAvatar.config.cuiI18nFilter) {
                                    internationalizedName = $filter('cuiI18n')(scope.cuiAvatarNames).split(' ')
                                }
                                (internationalizedName || scope.cuiAvatarNames).forEach((nameSection, i) => {
                                    if (i < cuiAvatar.config.maxNumberOfInitials) {
                                        if (!nameSection) return
                                        nameToDisplay += nameSection[0].toUpperCase()
                                    }
                                })
                                return nameToDisplay
                            }
                        },
                        render: {
                            nameBackground: () => {
                                if (cuiAvatar.config.colorClassPrefix) {
                                    if (cuiAvatar.config.colorCount===0) {
                                        throw 'For cui-avatar if you specify color class prefix you must specify the a cui-avatar-color-count'
                                    }

                                    if (cuiAvatar.helpers.isColorClassApplied()) return
                                    else cuiAvatar.helpers.applyRandomColorClass()
                                }
                            },
                            initials: () => {
                                if (!scope.cuiAvatarNames) return
                                cuiAvatar.selectors.$elem[0].innerHTML = `<div class="cui-avatar__initials"></div>`
                                cuiAvatar.selectors.$initials = angular.element(cuiAvatar.selectors.$elem[0].childNodes[0])
                                cuiAvatar.selectors.$initials[0].innerHTML = cuiAvatar.helpers.getInitialsToDisplay()
                            },
                            image: () => {
                                const applyImage = (imgSrc) => {
                                    // remove the random color class added before applying an image
                                    if(cuiAvatar.config.colorClassAdded) cuiAvatar.selectors.$elem[0].classList.remove(cuiAvatar.config.colorClassAdded)
                                    cuiAvatar.selectors.$elem[0].innerHTML = `<div class="cui-avatar__image-container"></div>`
                                    cuiAvatar.selectors.$image = angular.element(cuiAvatar.selectors.$elem[0].childNodes[0])
                                    cuiAvatar.selectors.$image[0].style.backgroundImage = `url("${imgSrc}")`
                                }
                                let img = new Image();
                                if(scope.cuiAvatar && scope.cuiAvatar!==''){
                                    img.src = scope.cuiAvatar
                                    img.onload = applyImage(img.src)
                                }
                                else if (scope.cuiAvatarEmail) {
                                    const hashedEmail = md5(scope.cuiAvatarEmail)
                                    // ?d=404 tells gravatar not to give me a default gravatar
                                    $http.get(`https://www.gravatar.com/avatar/${hashedEmail}?d=404`)
                                    .then(res => { // If the user has a gravatar account and has set a picture
                                        img.src = `https://www.gravatar.com/avatar/${hashedEmail}`
                                        img.onload = applyImage(img.src)
                                    })
                                }
                                else return
                            }
                        },
                        update: () => {
                            cuiAvatar.render.nameBackground()
                            cuiAvatar.render.initials()
                            cuiAvatar.render.image()
                        }
                    }
                    cuiAvatar.render.nameBackground()
                    cuiAvatar.render.initials()
                    cuiAvatar.render.image()
                    cuiAvatar.watchers()
                }
            }
        }
    }
})