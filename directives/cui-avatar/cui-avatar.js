angular.module('cui-ng')
.directive('cuiAvatar',['$timeout','$http','$filter',function($timeout,$http,$filter){
    return{
        restrict: 'A',
        scope:{
            cuiAvatar:'=',
            cuiAvatarNames:'=',
            cuiAvatarEmail:'='
        },
        link:function(scope,elem,attrs){
          console.log(scope.cuiAvatarEmail);
            var self;
            var cuiAvatar={
                initScope:function(){
                    self=this;
                },
                selectors:{
                    $elem:angular.element(elem[0])
                },
                config:{
                    colorClassPrefix:attrs.cuiAvatarColorClassPrefix || false,
                    colorCount:attrs.cuiAvatarColorCount || 0,
                    cuiI18nFilter:angular.isDefined(attrs.cuiAvatarCuii18nFilter) || false,
                    maxNumberOfInitials: attrs.cuiAvatarMaxNumInitials || 2
                },
                watchers:function(){
                   scope.$watch('cuiAvatar',function(newAvatar){
                       if(newAvatar){
                           self.update();
                       }
                   });
                    scope.$watch('cuiAvatarNames',function(newNameArray){
                       if(newNameArray){
                           self.update();
                       }
                   });
                   scope.$watch('cuiAvatarEmail',function(newEmail){
                        if(newEmail){
                            self.update();
                        }
                   });
                },
                render:{
                    nameBackground:function(){
                        if(self.config.colorClassPrefix) {
                            if(self.config.colorCount===0) throw 'For cui-avatar if you specify color class prefix you must specify the attribute cui-avatar-color-count';
                            if(_.find(self.selectors.$elem[0].classList,function(className){
                                return className.indexOf(self.config.colorClassPrefix)>-1;
                            }) !==undefined ) return; // if there's already a class that looks like the one specified in cuiAvatarColorClassPrefix
                            var classNumberToApply=Math.floor(Math.random()*self.config.colorCount + 1);
                            self.selectors.$elem[0].classList.add(self.config.colorClassPrefix+classNumberToApply);
                        }
                    },
                    initials:function(){
                        if (!scope.cuiAvatarNames) return;
                        var name=function(){
                            var name,nameToDisplay='';
                            if(self.config.cuiI18nFilter){
                                name=$filter('cuiI18n')(scope.cuiAvatarNames).split(' ')
                            }
                            (name || scope.cuiAvatarNames).forEach(function(name,i){
                                if(i<self.config.maxNumberOfInitials) nameToDisplay+=name[0].toUpperCase();
                            });
                            return nameToDisplay;
                        };
                        self.selectors.$elem[0].innerHTML='<div class="cui-avatar__initials"></div>';
                        self.selectors.$initials=angular.element(elem[0].querySelector('.cui-avatar__initials'));
                        self.selectors.$initials[0].innerHTML=name();
                    },
                    image:function(){
                        function applyImage(imgSrc){
                            self.selectors.$elem[0].innerHTML='<div class="cui-avatar__image-container"></div>';
                            self.selectors.$image=angular.element(elem[0].querySelector('.cui-avatar__image-container'));
                            self.selectors.$image[0].style.backgroundImage=String.prototype.concat('url("',imgSrc,'")');
                        };
                        var img=new Image();
                        if(scope.cuiAvatar && scope.cuiAvatar!==''){
                            img.src=scope.cuiAvatar;
                            img.onload=applyImage(img.src);
                        }
                        else if (scope.cuiAvatarEmail){
                            var hashedEmail=md5(scope.cuiAvatarEmail);
                            $http.get('https://www.gravatar.com/avatar/'+hashedEmail+'?d=404') // ?d=404 tells gravatar not to give me a default gravatar
                            .then(function(res){ // If the user has a gravatar account and has set a picture
                                img.src='https://www.gravatar.com/avatar/'+hashedEmail;
                                img.onload=applyImage(img.src);
                            });
                        }
                        else return;
                    }
                },
                update:function(){
                    self.render.nameBackground();
                    self.render.initials();
                    self.render.image();
                }
            };

            cuiAvatar.initScope();
            cuiAvatar.render.nameBackground();
            cuiAvatar.render.initials();
            cuiAvatar.render.image();
            cuiAvatar.watchers();
        }
    };
}]);