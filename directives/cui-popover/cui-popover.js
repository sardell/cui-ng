// angular.module('cui-ng')
// .directive('cuiPopover', ['$compile','$timeout','$interval',function cuiPopoverDirective($compile,$timeout,$interval) {
//     return {
//         restrict: 'EA',
//         scope: {},
//         link: function cuiPopoverLink(scope, elem, attrs) {
//             var self;
//             var popoverTether,tetherAttachmentInterval,targetElementPositionInterval;
//             var cuiPopover={
//                 init:function cuiPopoverInit(){
//                     self=this;
//                     self.render.popoverContainer();
//                     angular.forEach(self.watchers,function(initWatcher){
//                         initWatcher();
//                     });
//                 },
//                 config:{
//                     pointerHeight:attrs.pointerHeight || '14',
//                     pointerWidth:attrs.pointerWidth || '9',
//                     target: attrs.target,
//                     offset:attrs.offset || '0 0',
//                     pointerOffset:attrs.pointerOffset || '0 0',
//                     attachment:attrs.attachment || 'top center',
//                     targetAttachment:attrs.targetAttachment || 'bottom center',
//                     targetOffset: attrs.targetOffset || '0 0',
//                     targetModifier: attrs.targetModifier || undefined,
//                     constraints: scope.$eval(attrs.constraints) || [{ to: 'window', attachment: 'together none' }]
//                 },
//                 watchers:{
//                     tetherAttachment:function cuiPopoverWatchTetherAttachment(){
//                         tetherAttachmentInterval=$interval(function(){
//                             if(!popoverTether || !popoverTether.element) return;
//                             if(popoverTether.element.classList.contains('tether-element-attached-' + self.config.attachment.split(' ')[0])) { // if the element is in the position it should be
//                                 scope.tetherAttachment='normal';
//                             }
//                             else scope.tetherAttachment='inverted'; // if it doesn't have space to show and has been inverted by tether
//                         },20);

//                         scope.$watch('tetherAttachment',function(newAttachment,oldAttachment){
//                             if(newAttachment && newAttachment!=oldAttachment) {
//                                 if(newAttachment==='normal') {
//                                     self.selectors.$pointer.css(self.helpers.getPointerStyles());
//                                     elem.css(self.helpers.getPopoverMargins());
//                                     self.helpers.setPopoverOffset(self.config.attachment);
//                                 }
//                                 else {
//                                     var newTargetAttachmentMode=self.helpers.invertAttachment(self.config.targetAttachment);
//                                     elem.css(self.helpers.getPopoverMargins(newTargetAttachmentMode));
//                                     self.selectors.$pointer.css(self.helpers.getPointerStyles(newTargetAttachmentMode));
//                                     self.helpers.setPopoverOffset(self.helpers.invertAttachment(self.config.attachment));
//                                 }
//                             }
//                         });
//                     },

//                     targetElementPosition:function cuiPopoverWatchElementPosition(){
//                         targetElementPositionInterval=$interval(function(){
//                             scope.targetPosition=self.selectors.$target.offset();
//                         },20)

//                         scope.$watch('targetPosition',function(newPosition){
//                             if(newPosition) {
//                                 popoverTether.position();
//                             }
//                         },function(newPosition,oldPosition){
//                             return (newPosition.top!==oldPosition.top || newPosition.left!==oldPosition.left);
//                         });
//                     },

//                     scopeDestroy:function cuiPopoverWatchScopeDestroy(){
//                         scope.$on('$destroy',function(){
//                             $interval.cancel(tetherAttachmentInterval);
//                             // $interval.cancel(targetElementPositionInterval);
//                             popoverTether.destroy();
//                             if(self.selectors.$container) self.selectors.$container.detach();
//                             if(self.selectors.$pointer) self.selectors.$pointer.detach();
//                         })
//                     }
//                 },
//                 selectors:{
//                     $target:angular.element(document.querySelector(attrs.target))
//                 },
//                 helpers:{
//                     invertAttachment:function cuiPopoverInvertAttachment(attachment){
//                         attachment=attachment.split(' ');
//                         var verticalAttachment=attachment[0];
//                         var horizontalAttachment=attachment[1];
//                         if(verticalAttachment==='top'){
//                             return 'bottom ' + horizontalAttachment;
//                         }
//                         else if(verticalAttachment==='bottom'){
//                             return 'top ' + horizontalAttachment;
//                         }
//                         else if(horizontalAttachment==='left'){ // if we reach this point we can assume the vertical attachment is 'middle'
//                             return verticalAttachment + ' right';
//                         }
//                         else return verticalAttachment + ' left';
//                     },
//                     mathWithStrings:function cuiPopoverMathWithStrings(string1,operation,string2){
//                         var value1=parseInt(string1),
//                             value2=parseInt(string2);
//                         if(operation==='-'){
//                             return value1-value2;
//                         }
//                         else if(operation==='+'){
//                             return value1+value2;
//                         }
//                     },
//                     getOffsetAndUnitsOfOffset:function cuiPopovergetOffsetAndUnitsOfOffset(offsetPartial){
//                         var offsetAndUnit=[];
//                         if(offsetPartial.indexOf('%')>-1){
//                             offsetAndUnit[0]=offsetPartial.split('%')[0];
//                             offsetAndUnit[1]='%';
//                         }
//                         else if(offsetPartial.indexOf('px')>-1){
//                             offsetAndUnit[0]=offsetPartial.split('px')[0];
//                             offsetAndUnit[1]='px';
//                         }
//                         else {
//                             offsetAndUnit[0]=offsetPartial; // the amount of offset
//                             offsetAndUnit[1]='px'; // the units
//                         }
//                         return offsetAndUnit;
//                     },
//                     getPointerClass:function cuiPopoverGetPointerClass(){
//                         var classAttr;
//                         var attachment=self.config.attachment.split(' ');
//                         if(attachment.top==='top'){
//                             // arrowDirection='down';
//                            classAttr="cui-popover__pointer cui-popover__pointer--down";
//                         }
//                         else if(attachment.top==='middle' && attachment.left==='left'){
//                             // arrowDirection='right';
//                             classAttr="cui-popover__pointer cui-popover__pointer--right";
//                         }
//                         else if(attachment.top==='middle' && attachment.left==='right'){
//                             // arrowDirection='left';
//                             classAttr="cui-popover__pointer cui-popover__pointer--left";
//                         }
//                         else {
//                             // arrowDirection='up';
//                             classAttr="cui-popover__pointer cui-popover__pointer--up";
//                         }
//                         return classAttr;
//                     },
//                     getPointerOffset:function cuiPopoverGetPointerOffset(attachment){
//                         var attachment=(attachment || self.config.targetAttachment).split(' ');
//                         var verticalAttachment=attachment[0];
//                         var horizontalAttachment=attachment[1];

//                         var offset=self.config.offset.split(' ');
//                         var verticalOffset=self.helpers.getOffsetAndUnitsOfOffset(offset[0]); // array with [offsetAmount,units]
//                         var horizontalOffset=self.helpers.getOffsetAndUnitsOfOffset(offset[1]);

//                         var pointerOffset=self.config.pointerOffset.split(' ');
//                         var pointerVerticalOffset=self.helpers.getOffsetAndUnitsOfOffset(pointerOffset[0]); // array with [offsetAmount,units]
//                         var pointerHorizontalOffset=self.helpers.getOffsetAndUnitsOfOffset(pointerOffset[1]);
//                         var styles={};

//                         if(verticalAttachment==='top' || verticalAttachment==='bottom') angular.extend(styles,{ 'margin-left':'50%' });
//                         else angular.extend(styles,{ 'margin-top':'50%','transform':'translate(0,-50%)' });

//                         if(verticalAttachment==='top') angular.extend(styles,{ 'left': parseInt(horizontalOffset[0]) + horizontalOffset[1],'bottom': '-' + self.config.pointerHeight + 'px', top:'' , 'transform':'translate(-50%,' + parseInt(verticalOffset[0])*-1 + verticalOffset[1] + ')'});
//                         else if(verticalAttachment==='bottom') angular.extend(styles,{ 'left': parseInt(horizontalOffset[0]) + horizontalOffset[1],'top': '-' + self.config.pointerHeight + 'px', bottom:'' , 'transform':'translate(-50%,' + verticalOffset.join('') + ')'});
//                         else if(horizontalAttachment==='left') angular.extend(styles,{ 'top':  parseInt(verticalOffset[0])*-1 + verticalOffset[1],'left': '-' + self.config.pointerHeight + 'px'});
//                         else angular.extend(styles,{ 'top': parseInt(verticalOffset[0])*-1 + verticalOffset[1],'right': '-' + self.config.pointerHeight + 'px'});

//                         return styles;
//                     },
//                     getBaseBorderStyles:function cuiPopoverGetBaseBorderStyle(direction){
//                         if(direction==='up' || direction==='down'){
//                             return {
//                                 'border-right':self.config.pointerWidth + 'px solid transparent',
//                                 'border-left':self.config.pointerWidth + 'px solid transparent',
//                                 'border-bottom':self.config.pointerHeight + 'px solid transparent',
//                                 'border-top':self.config.pointerHeight + 'px solid transparent'
//                             }
//                         }
//                         else return {
//                             'border-right':self.config.pointerHeight + 'px solid transparent',
//                             'border-left':self.config.pointerHeight + 'px solid transparent',
//                             'border-bottom':self.config.pointerWidth + 'px solid transparent',
//                             'border-top':self.config.pointerWidth + 'px solid transparent'
//                         }
//                     },
//                     getPointerStyles:function cuiPopoverGetPointerStyles(attachment){
//                         console.log('getting pointer styles for ', attachment);
//                         var styles={
//                             position:'absolute'
//                         };
//                         angular.extend(styles,self.helpers.getPointerOffset(attachment));

//                         var colorOfPopoverBackground=elem.css('backgroundColor');
//                         var attachment=(attachment || self.config.targetAttachment).split(' ');
//                         var verticalAttachment=attachment[0];
//                         var horizontalAttachment=attachment[1];

//                         if(verticalAttachment==='top'){
//                             // arrowDirection='down';
//                             angular.extend(styles,self.helpers.getBaseBorderStyles('down'));
//                             styles['border-top']=self.config.pointerHeight + 'px solid ' + colorOfPopoverBackground;
//                         }
//                         else if(verticalAttachment==='middle' && horizontalAttachment==='left'){
//                             // arrowDirection='right';
//                             angular.extend(styles,self.helpers.getBaseBorderStyles('right'));
//                             styles['border-left']=self.config.pointerHeight + 'px solid ' + colorOfPopoverBackground;
//                         }
//                         else if(verticalAttachment==='middle' && horizontalAttachment==='right'){
//                             // arrowDirection='left';
//                             angular.extend(styles,self.helpers.getBaseBorderStyles('left'));
//                             styles['border-right']=self.config.pointerHeight + 'px solid ' + colorOfPopoverBackground;
//                         }
//                         else {
//                             // arrowDirection='up';
//                             angular.extend(styles,self.helpers.getBaseBorderStyles('up'));
//                             styles['border-bottom']=self.config.pointerHeight + 'px solid ' + colorOfPopoverBackground;
//                         }
//                         return styles;
//                     },
//                     getPopoverMargins:function cuiPopoverGetMargins(attachment){
//                         var attachment=(attachment || self.config.targetAttachment).split(' ');
//                         var verticalAttachment=attachment[0];
//                         var horizontalAttachment=attachment[1];

//                         var offset=self.config.pointerOffset.split(' ');
//                         var verticalOffset=self.helpers.getOffsetAndUnitsOfOffset(offset[0]); // array with [offsetAmount,units]
//                         var horizontalOffset=self.helpers.getOffsetAndUnitsOfOffset(offset[1]);
//                         var styles={};

//                         if(verticalAttachment==='top') angular.extend(styles,{ 'margin-bottom': self.config.pointerHeight + 'px' , 'margin-top':''});
//                         else if(verticalAttachment==='bottom') angular.extend(styles,{'margin-top': self.config.pointerHeight + 'px', 'margin-bottom':''});
//                         else if(horizontalAttachment==='left') angular.extend(styles,{ 'margin-left': self.config.pointerHeight + 'px'});
//                         else angular.extend(styles,{ 'margin-right': self.config.pointerHeight + 'px'});

//                         return styles;
//                     },
//                     setPopoverOffset:function cuiPopoverInvertOffset(newAttachment){
//                         var newAttachment=newAttachment.split(' ');
//                         var attachment=self.config.attachment.split(' ');
//                         console.log(newAttachment,attachment);
//                         var verticalAttachment=attachment[0];
//                         var horizontalAttachment=attachment[1];

//                         var offset=self.config.offset.split(' ');
//                         var verticalOffset=self.helpers.getOffsetAndUnitsOfOffset(offset[0]).join('');
//                         var horizontalOffset=self.helpers.getOffsetAndUnitsOfOffset(offset[1]).join('');

//                         if (angular.equals(attachment,newAttachment)) {
//                             console.log('normal');
//                             if( verticalAttachment==='top' ) self.selectors.$container.css({ 'padding-bottom': '' , 'padding-top': verticalOffset });
//                             else if( verticalAttachment==='bottom' ) self.selectors.$container.css({ 'padding-bottom': verticalOffset , 'padding-top': '' });
//                             else if ( horizontalAttachment==='left' ) self.selectors.$container.css({ 'padding-right': parseInt(horizontalOffset[0]) + horizontalOffset[1] , 'padding-left': '' });
//                             else self.selectors.$container.css({ 'padding-right': '' , 'padding-left': parseInt(horizontalOffset[0]) + horizontalOffset[1] });
//                         }
//                         else {
//                             console.log('inverted');
//                             if( verticalAttachment==='top' ) self.selectors.$container.css({ 'padding-top': '' , 'padding-bottom': verticalOffset });
//                             else if( verticalAttachment==='bottom' ) self.selectors.$container.css({ 'padding-top': verticalOffset , 'padding-bottom': '' });
//                             else if ( horizontalAttachment==='left' ) self.selectors.$container.css({ 'padding-left': parseInt(horizontalOffset[0]) + horizontalOffset[1] , 'padding-right': '' });
//                             else self.selectors.$container.css({ 'padding-left': '' , 'padding-right': parseInt(horizontalOffset[0]) + horizontalOffset[1] });
//                         }
//                     }
//                 },
//                 render:{
//                     pointer:function cuiPopoverRenderPointer(mode){
//                         if(self.selectors.$pointer) self.selectors.$pointer.detach();
//                         var $pointer=$('<span class="cui-popover__pointer"></span>');
//                         self.selectors.$pointer=$pointer;
//                         $pointer.css(self.helpers.getPointerStyles());
//                         return $pointer;
//                     },
//                     popoverContainer:function cuiPopoverPopoverContainer(){
//                         var $container=$('<div class="cui-popover__container"></div>');
//                         self.selectors.$container=$container;
//                         self.helpers.setPopoverOffset(self.config.attachment);
//                         $container[0].classList.add('hide--opacity');
//                         $container.append(elem);
//                         elem.css(self.helpers.getPopoverMargins());
//                         $container.prepend(self.render.pointer());
//                         angular.element(document.body).append($container);
//                         popoverTether=new Tether({
//                             element: $container[0],
//                             target: self.config.target,
//                             attachment: self.config.attachment,
//                             targetAttachment: self.config.targetAttachment,
//                             offset: self.config.attachment.split(' ')[0]==='top' || self.config.attachment.split(' ')[0]==='bottom' ? '0 ' + self.config.offset.split(' ')[1] : self.config.offset.split(' ')[0] + ' 0',
//                             targetOffset: self.config.targetOffset,
//                             targetModifier: self.config.targetModifier,
//                             constraints: self.config.constraints
//                         });
//                         $container[0].classList.remove('hide--opacity');
//                     }
//                 }
//             };
//             cuiPopover.init();
//         }
//     };
// }]);