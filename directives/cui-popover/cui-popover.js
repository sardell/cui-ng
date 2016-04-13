angular.module('cui-ng')
.directive('cuiPopover', ['$compile','$timeout','$interval',function cuiPopoverDirective($compile,$timeout,$interval) {
    return {
        restrict: 'EA',
        scope: true,
        link: function cuiPopoverLink(scope, elem, attrs) {
            var self;
            var popoverTether,pointerTether,tetherAttachmentInterval,targetElementPositionInterval;
            var cuiPopover={
                init:function cuiPopoverInit(){
                    self=this;
                    self.render.popoverWithTether();
                    self.render.pointer();
                    angular.forEach(self.watchers,function(initWatcher){
                        initWatcher();
                    });
                },
                config:{
                    pointerHeight:attrs.pointerHeight || '14',
                    pointerWidth:attrs.pointerWidth || '9',
                    target: attrs.target,
                    popoverOffset:attrs.popoverOffset || '0 0',
                    pointerOffset:attrs.pointerOffset || '0 0',
                    attachment:attrs.attachment || 'top center',
                    targetAttachment:attrs.targetAttachment || 'bottom center',
                    targetOffset: attrs.targetOffset || '0 0',
                    targetModifier: attrs.targetModifier || undefined,
                    constraints: scope.$eval(attrs.constraints) || [{ to: 'window', attachment: 'together none'}]
                },
                watchers:{
                    tetherAttachment:function cuiPopoverWatchTetherAttachment(){
                        tetherAttachmentInterval=$interval(function(){
                            if(!popoverTether || !popoverTether.element) return;
                            if(popoverTether.element.classList.contains('tether-element-attached-' + self.config.attachment.split(' ')[0])) { // if the element is in the position it should be
                                scope.tetherAttachment='normal';
                            }
                            else scope.tetherAttachment='inverted'; // if it doesn't have space to show and has been inverted by tether
                        },20);

                        scope.$watch('tetherAttachment',function(newAttachment){
                            if(newAttachment) {
                                console.log('new attachment mode '+newAttachment);
                                self.config.attachment=self.helpers.invertAttachment(); // this doesn't actually change the attachment on the tethered elements, it simply aids in re-calculating the offsets
                                popoverTether.setOptions({ // reset the offset on the popover to the be negative version of that it was before.
                                    offset:self.helpers.tetherOffset(newAttachment).popover
                                });
                                self.render.pointer(newAttachment);
                            }
                        },function(newAttachment,oldAttachment){
                            return newAttachment!==oldAttachment;
                        });
                    },

                    targetElementPosition:function cuiPopoverWatchElementPosition(){
                        targetElementPositionInterval=$interval(function(){
                            scope.targetPosition=self.selectors.$target.offset();
                        },20)

                        scope.$watch('targetPosition',function(newPosition){
                            if(newPosition) {
                                popoverTether.position();
                                pointerTether.position();
                            }
                        },function(newPosition,oldPosition){
                            return (newPosition.top!==oldPosition.top || newPosition.left!==oldPosition.left);
                        });
                    },

                    scopeDestroy:function cuiPopoverWatchScopeDestroy(){
                        scope.$on('$destroy',function(){
                            $interval.cancel(tetherAttachmentInterval);
                            $interval.cancel(targetElementPositionInterval)
                        })
                    }
                },





                    // YEOMAN GENNN!!!!!!!!!!!
                // TODO : MAKE INVERSION WORK









                selectors:{
                    $target:angular.element(document.querySelector(attrs.target))
                },
                helpers:{
                    invertAttachment:function cuiPopoverInvertAttachment(){
                        var attachment=self.config.attachment.split(' ');
                        var verticalAttachment=attachment[0];
                        var horizontalAttachment=attachment[0];
                        if(verticalAttachment==='top'){
                            return 'bottom ' + horizontalAttachment;
                        }
                        else if(verticalAttachment==='bottom'){
                            return 'top ' + horizontalAttachment;
                        }
                        else if(horizontalAttachment==='left'){ // if we reach this point we can assume the vertical attachment is 'middle'
                            return verticalAttachment + ' right';
                        }
                        else return verticalAttachment + ' left';
                    },
                    mathWithStrings:function cuiPopoverMathWithStrings(string1,operation,string2){
                        if(!string1) { throw 'String 1 is undefined' };
                        if(!string2) { throw 'String 2 is undefined' };
                        if(operation==='-'){
                            return parseInt(string1)-parseInt(string2);
                        }
                        else if(operation==='+'){
                            return parseInt(string1)+parseInt(string2);
                        }
                    },
                    getOffsetAndUnitsOfOffset:function cuiPopovergetOffsetAndUnitsOfOffset(offsetPartial){
                        var offsetAndUnit=[];
                        if(offsetPartial.indexOf('%')>-1){
                            offsetAndUnit[0]=offsetPartial.split('%')[0];
                            offsetAndUnit[1]='%';
                        }
                        else if(offsetPartial.indexOf('px')>-1){
                            offsetAndUnit[0]=offsetPartial.split('px')[0];
                            offsetAndUnit[1]='px';
                        }
                        else {
                            offsetAndUnit[0]=offsetPartial; // the amount of offset
                            offsetAndUnit[1]='px'; // the units
                        }
                        return offsetAndUnit;
                    },
                    getPointerClass:function cuiPopoverGetPointerClass(){
                        var classAttr;
                        if (popoverTether){
                            var attachment=popoverTether.targetAttachment
                        }
                        else var attachment=self.config.targetAttachment;
                        if(attachment.top==='top'){
                            // arrowDirection='down';
                           classAttr="cui-popover__pointer cui-popover__pointer--down";
                        }
                        else if(attachment.top==='middle' && attachment.left==='left'){
                            // arrowDirection='right';
                            classAttr="cui-popover__pointer cui-popover__pointer--right";
                        }
                        else if(attachment.top==='middle' && attachment.left==='right'){
                            // arrowDirection='left';
                            classAttr="cui-popover__pointer cui-popover__pointer--left";
                        }
                        else {
                            // arrowDirection='up';
                            classAttr="cui-popover__pointer cui-popover__pointer--up";
                        }
                        return classAttr;
                    },
                    tetherOffset:function cuiPopoverTetherOffset(mode){
                        if(!mode || mode==='normal') {
                            var prefix='';
                            var addOperation='+';
                            var subtractOperation='-';
                        }
                        else {
                            var prefix='-';
                            var addOperation='-';
                            var subtractOperation='+';
                        }

                        var popoverOffset=self.config.popoverOffset.split(' ');
                        var popoverYOffsetAndUnits=self.helpers.getOffsetAndUnitsOfOffset(popoverOffset[0]);
                        var popoverXOffsetAndUnits=self.helpers.getOffsetAndUnitsOfOffset(popoverOffset[1]);

                        var pointerOffset=self.config.pointerOffset.split(' ');
                        var pointerYOffsetAndUnits=self.helpers.getOffsetAndUnitsOfOffset(pointerOffset[0]);
                        var pointerXOffsetAndUnits=self.helpers.getOffsetAndUnitsOfOffset(pointerOffset[1]);

                        var attachment=self.config.attachment.split(' ');

                        if(attachment[0]==='top'){
                            return {
                                popover:String.prototype.concat(prefix,self.helpers.mathWithStrings(popoverYOffsetAndUnits[0],subtractOperation,self.config.pointerHeight),popoverYOffsetAndUnits[1],' ',prefix,popoverOffset[1]),
                                pointer:String.prototype.concat(prefix,self.helpers.mathWithStrings(pointerYOffsetAndUnits[0],addOperation,self.config.pointerHeight),pointerYOffsetAndUnits[1],' ',prefix,pointerOffset[1])
                            }
                        }
                        else if(attachment[0]==='middle' && attachment[1]==='left'){
                            return {
                                popover:String.prototype.concat(prefix,popoverOffset[0],' ',prefix,self.helpers.mathWithStrings(popoverYOffsetAndUnits[0],subtractOperation,self.config.pointerHeight),popoverYOffsetAndUnits[1]),
                                pointer:String.prototype.concat(prefix,pointerOffset[0],' ',prefix,self.helpers.mathWithStrings(pointerYOffsetAndUnits[0],addOperation,self.config.pointerHeight),pointerYOffsetAndUnits[1]),
                            }
                        }
                        else if(attachment[0]==='middle' && attachment[1]==='right'){
                            return {
                                popover:String.prototype.concat(prefix,popoverOffset[0],' ',prefix,self.helpers.mathWithStrings(popoverXOffsetAndUnits[0],addOperation,self.config.pointerHeight),popoverXOffsetAndUnits[1]),
                                pointer:String.prototype.concat(prefix,pointerOffset[0],' ',prefix,self.helpers.mathWithStrings(pointerXOffsetAndUnits[0],subtractOperation,self.config.pointerHeight),pointerXOffsetAndUnits[1]),
                            }
                        }
                        else {
                            return {
                                popover:String.prototype.concat(prefix,self.helpers.mathWithStrings(popoverYOffsetAndUnits[0],addOperation,self.config.pointerHeight),popoverYOffsetAndUnits[1],' ',prefix,popoverOffset[1]),
                                pointer:String.prototype.concat(prefix,self.helpers.mathWithStrings(pointerYOffsetAndUnits[0],subtractOperation,self.config.pointerHeight),pointerYOffsetAndUnits[1],' ',prefix,pointerOffset[1])
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
                        var colorOfPopoverBackground=elem.css('backgroundColor');
                        if(popoverTether.targetAttachment.top==='top'){
                            // arrowDirection='down';
                            angular.extend(styles,self.helpers.getBaseBorderStyles('down'));
                            styles['border-top']=self.config.pointerHeight + 'px solid ' + colorOfPopoverBackground;
                        }
                        else if(popoverTether.targetAttachment.top==='middle' && popoverTether.targetAttachment.left==='left'){
                            // arrowDirection='right';
                            angular.extend(styles,self.helpers.getBaseBorderStyles('right'));
                            styles['border-left']=self.config.pointerHeight + 'px solid ' + colorOfPopoverBackground;
                        }
                        else if(popoverTether.targetAttachment.top==='middle' && popoverTether.targetAttachment.left==='right'){
                            // arrowDirection='left';
                            angular.extend(styles,self.helpers.getBaseBorderStyles('left'));
                            styles['border-right']=self.config.pointerHeight + 'px solid ' + colorOfPopoverBackground;
                        }
                        else {
                            // arrowDirection='up';
                            angular.extend(styles,self.helpers.getBaseBorderStyles('up'));
                            styles['border-bottom']=self.config.pointerHeight + 'px solid ' + colorOfPopoverBackground;
                        }
                        return styles;
                    }
                },
                render:{
                    pointer:function cuiPopoverRenderPointer(mode){
                        if(self.selectors.$pointer) self.selectors.$pointer.detach();
                        var $pointer=$('<span class="' + self.helpers.getPointerClass() + '"></span>');
                        $pointer[0].classList.add('hide--opacity');
                        $timeout(function(){
                            $pointer.css(self.helpers.getPointerStyles());
                            elem.append($pointer);
                            self.selectors.$pointer=$pointer;
                            pointerTether=new Tether({
                                element: $pointer,
                                target: self.config.target,
                                attachment: self.config.attachment,
                                targetAttachment: self.config.targetAttachment,
                                offset: self.helpers.tetherOffset().pointer,
                                targetModifier: self.config.targetModifier
                            });
                            self.selectors.$pointer=$pointer;
                        })
                        .then(function(){
                            pointerTether.position();
                            $pointer[0].classList.remove('hide--opacity');
                        })
                    },
                    popoverWithTether:function cuiPopoverRenderPopoverWithTether(){
                        elem[0].classList.add('hide--opacity');
                        $timeout(function(){
                          popoverTether=new Tether({
                            element: elem,
                            target: self.config.target,
                            attachment: self.config.attachment,
                            targetAttachment: self.config.targetAttachment,
                            offset: self.helpers.tetherOffset().popover,
                            targetOffset: self.config.targetOffset,
                            targetModifier: self.config.targetModifier,
                            constraints: self.config.constraints
                          });
                        })
                        .then(function(){
                          popoverTether.position();
                          elem[0].classList.remove('hide--opacity');
                        });
                    }
                }
            };
            cuiPopover.init();
        }
    };
}]);