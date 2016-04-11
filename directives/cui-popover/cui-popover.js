angular.module('cui-ng')
.directive('cuiPopover', ['$compile','$timeout',function cuiPopoverDirective($compile,$timeout) {
    return {
        restrict: 'EA',
        scope: true,
        link: function cuiPopoverLink(scope, elem, attrs) {
            var self;
            var tether,arrowDirection;
            var cuiPopover={
                init:function cuiPopoverInit(){
                    self=this;
                    self.render.popoverWithTether();
                    self.render.pointer();
                },
                config:{
                    pointerHeight:attrs.pointerHeight || '14',
                    pointerWidth:attrs.pointerWidth || '9'
                },
                helpers:{
                    tetherOffset:function cuiPopoverTetherOffset(){
                        var offset=(attrs.offset || '0 0').split(' ');
                        var attachment=(attrs.targetAttachment || 'bottom center').split(' ')[0];
                        if(attachment==='top'){
                            return {
                                popover:String.prototype.concat((parseInt(offset[0])+self.config.pointerHeight),' ',offset[1]),
                                pointer:String.prototype.concat((parseInt(offset[0])-self.config.pointerHeight),' ',offset[1])
                            }
                        }
                        else if(attachment==='left'){ // TODO FIX LEFT AND RIGHT
                            return {
                                popover:String.prototype.concat(offset[0],' ',(parseInt(offset[1])+self.config.pointerHeight)),
                                pointer:String.prototype.concat((parseInt(offset[0])-self.config.pointerHeight),' ',offset[1])
                            }
                        }
                        else if(attachment==='right'){
                            return {
                                popover:String.prototype.concat(offset[0],' ',(parseInt(offset[1])+self.config.pointerHeight)),
                                pointer:String.prototype.concat((parseInt(offset[0])-self.config.pointerHeight),' ',offset[1])
                            }
                        }
                        else {
                            return {
                                popover:String.prototype.concat((parseInt(offset[0])-self.config.pointerHeight),' ',offset[1]),
                                pointer:String.prototype.concat((parseInt(offset[0])+self.config.pointerHeight),' ',offset[1])
                            }
                        }

                    },
                    getBaseBorderStyles:function cuiPopoverGetBaseBorderStyle(direction){
                        if(direction==='up' || direction==='down'){
                            return {
                                'border-right':self.config.pointerWidth + 'px solid transparent',
                                'border-left':self.config.pointerWidth + 'px solid transparent',
                                'border-bottom':self.config.pointerHeight + 'px solid transparent',
                                'border-top':self.config.pointerHeight + 'px solid transparent'
                            }
                        }
                        else return {
                            'border-right':self.config.pointerHeight + 'px solid transparent',
                            'border-left':self.config.pointerHeight + 'px solid transparent',
                            'border-bottom':self.config.pointerWidth + 'px solid transparent',
                            'border-top':self.config.pointerWidth + 'px solid transparent'
                        }
                    },
                    getPointerStyles:function cuiPopoverGetPointerDirection(){
                        var styles={};
                        var colorOfPopoverBackground=elem[0].style['background'] || elem[0].style['background-color'];
                        if(tether.targetAttachment.top==='top'){
                            arrowDirection='down';
                            angular.extend(styles,self.helpers.getBaseBorderStyles('down'));
                            styles['border-top']=self.config.pointerHeight + 'px solid ' + colorOfPopoverBackground;
                        }
                        else if(tether.targetAttachment.top==='left'){
                            arrowDirection='right';
                            angular.extend(styles,self.helpers.getBaseBorderStyles('right'));
                            styles['border-left']=self.config.pointerHeight + 'px solid ' + colorOfPopoverBackground;
                        }
                        else if(tether.targetAttachment.top==='right'){
                            arrowDirection='left';
                            angular.extend(styles,self.helpers.getBaseBorderStyles('left'));
                            styles['border-right']=self.config.pointerHeight + 'px solid ' + colorOfPopoverBackground;
                        }
                        else {
                            arrowDirection='up';
                            angular.extend(styles,self.helpers.getBaseBorderStyles('up'));
                            styles['border-bottom']=self.config.pointerHeight + 'px solid ' + colorOfPopoverBackground;
                        }
                        return styles;
                    }
                },
                render:{
                    pointer:function cuiPopoverRenderPointer(){
                        var $pointer=$('<span></span>');
                        $timeout(function(){
                            $pointer.css(self.helpers.getPointerStyles());
                            elem.append($pointer);
                            new Tether({
                                element: $pointer,
                                target: attrs.target,
                                attachment: attrs.attachment || 'top center',
                                targetAttachment: attrs.targetAttachment || 'bottom center',
                                offset: self.helpers.tetherOffset().pointer,
                                targetOffset: attrs.targetOffset || '0 0',
                                targetModifier: attrs.targetModifier || undefined,
                                constraints: scope.$eval(attrs.constraints) || undefined
                            });
                        });
                    },
                    popoverWithTether:function cuiPopoverRenderPopoverWithTether(){
                        elem[0].classList.add('hide--opacity'); // this fixes the incorrect positioning when it first renders
                        $timeout(function(){
                          tether=new Tether({
                            element: elem,
                            target: attrs.target,
                            attachment: attrs.attachment || 'top center',
                            targetAttachment: attrs.targetAttachment || 'bottom center',
                            offset: self.helpers.tetherOffset().popover,
                            targetOffset: attrs.targetOffset || '0 0',
                            targetModifier: attrs.targetModifier || undefined,
                            constraints: scope.$eval(attrs.constraints) || undefined
                          });
                        }).
                        then(function(){
                          tether.position();
                          elem[0].classList.remove('hide--opacity');
                        });
                    }
                }
            };
            cuiPopover.init();

        }
    };

}]);