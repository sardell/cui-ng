angular.module('cui-ng')
.directive('cuiAvatar',['$timeout',function($timeout){
    return{
        restrict: 'A',
        scope:{
            cuiAvatar:'=',
            cuiAvatarNames:'='
        },
        link:function(scope,elem,attrs){
            var self;
            var cuiAvatar={
                initScope:function(){
                    self=this;
                },
                selectors:{
                    $elem:angular.element(elem[0])
                },
                config:{
                    cuiAvatarNames:attrs.cuiAvatarNames || false,
                    colorClassPrefix:attrs.cuiAvatarColorClassPrefix || false,
                    colorCount:attrs.cuiAvatarColorCount || 0
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
                        if (!self.config.cuiAvatarNames) return;
                        var name=function(){
                            var nameToDisplay='';
                            scope.cuiAvatarNames.forEach(function(name){
                                nameToDisplay+=name[0];
                            });
                            return nameToDisplay;
                        };
                        self.selectors.$elem[0].innerHTML='<div class="cui-avatar__initials"></div>';
                        self.selectors.$initials=angular.element(elem[0].querySelector('.cui-avatar__initials'));
                        self.selectors.$initials[0].innerHTML=name();
                    },
                    image:function(){
                        if(!scope.cuiAvatar) return;
                        var image=new Image();
                        image.src=scope.cuiAvatar;
                        image.onload=$timeout(function(){
                                self.selectors.$elem[0].innerHTML='<div class="cui-avatar__image-container"></div>';
                                self.selectors.$image=angular.element(elem[0].querySelector('.cui-avatar__image-container'));
                                self.selectors.$image[0].style.backgroundImage=String.prototype.concat('url("',scope.cuiAvatar,'")');
                        });
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
