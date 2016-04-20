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
//                     pointerOffset:attrs.pointerOffset || '0',
//                     attachment:attrs.attachment || 'top center',
//                     targetAttachment:attrs.targetAttachment || 'bottom center',
//                     pointerOffset: attrs.pointerOffset || '0 0',
//                     targetModifier: attrs.targetModifier || undefined,
//                     constraints: scope.$eval(attrs.constraints) || [{ to: 'window', attachment: 'together together' }],
//                     widthOfPopover: (function getInnerWidth() {
//                         var wrapper = document.createElement('span'),
//                             result;
//                         while (elem[0].firstChild) {
//                             wrapper.appendChild(elem[0].firstChild);
//                         }
//                         elem[0].appendChild(wrapper);
//                         result = wrapper.offsetWidth;
//                         elem[0].removeChild(wrapper);
//                         while (wrapper.firstChild) {
//                             elem[0].appendChild(wrapper.firstChild);
//                         }
//                         return result;
//                         }
//                     )()
//                 },
//                 watchers:{
//                     tetherAttachment:function cuiPopoverWatchTetherAttachment(){
//                         tetherAttachmentInterval=$interval(function(){
//                             if(!popoverTether || !popoverTether.element) return;
//                             var attachment=self.config.attachment.split(' '),
//                                 verticalAttachment=attachment[0],
//                                 horizontalAttachment=attachment[1];
//                             if(verticalAttachment!=='middle' && popoverTether.element.classList.contains('tether-element-attached-' + verticalAttachment)) { // if the element is in the position it should be
//                                 scope.tetherAttachment='normal';
//                             }
//                             else if(verticalAttachment==='middle' && popoverTether.element.classList.contains('tether-element-attached-' + horizontalAttachment)) {
//                                 scope.tetherAttachment='normal';
//                             }
//                             else scope.tetherAttachment='inverted'; // if it doesn't have space to show and has been inverted by tether
//                         },20);

//                         scope.$watch('tetherAttachment',function(newAttachment,oldAttachment){
//                             if(newAttachment && newAttachment!=oldAttachment) self.rePosition(newAttachment);
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
//                         var attachment=self.config.attachment.split(' '),
//                             verticalAttachment=attachment[0],
//                             horizontalAttachment=attachment[1];

//                         var direction= verticalAttachment==='top'? 'down' : verticalAttachment==='bottom'? 'top' : horizontalAttachment.left==='right' ? 'left' : 'right';

//                         return 'cui-popover__pointer ' + 'cui-popover__pointer--' + direction;
//                     },
//                     getPointerOffset:function cuiPopoverGetPointerOffset(attachment) {
//                         var attachment=(attachment || self.config.targetAttachment).split(' '),
//                             verticalAttachment=attachment[0],
//                             horizontalAttachment=attachment[1];

//                         var offset=self.config.offset.split(' '),
//                             verticalOffset=self.helpers.getOffsetAndUnitsOfOffset(offset[0]), // array with [offsetAmount,units]
//                             horizontalOffset=self.helpers.getOffsetAndUnitsOfOffset(offset[1]);

//                         var pointerOffset=self.helpers.getOffsetAndUnitsOfOffset(self.config.pointerOffset); // array with [offsetAmount,units]

//                         var styles={},
//                             styleExtension;

//                         if(verticalAttachment==='top' || verticalAttachment==='bottom') {
//                             styles= { 'margin-left':'50%', 'left': horizontalOffset.join('') };
//                         }
//                         else{
//                             if(verticalOffset[0]==='0') styles= { 'top':'50%' };
//                             else {
//                                 var containerHeight=self.selectors.$container.height(),
//                                     topMargin;
//                                 if(verticalOffset[1]==='%') topMargin=containerHeight*(parseInt(verticalOffset)/100);
//                                 styles= { 'top':'50%', 'margin-top': topMargin };
//                             }
//                         }

//                         if(verticalAttachment==='top') {
//                             styleExtension={
//                                 bottom: '-' + self.config.pointerHeight + 'px',
//                                 top: '',
//                                 transform:'translate(-50%,' + parseInt(verticalOffset[0]) * -1 + verticalOffset[1] + ')'
//                             }
//                         }
//                         else if(verticalAttachment==='bottom') {
//                             styleExtension={
//                                 top: '-' + self.config.pointerHeight + 'px',
//                                 bottom: '',
//                                 transform: 'translate(-50%,' + verticalOffset.join('') + ')'
//                             }
//                         }
//                         else {
//                             var widthOfPopover=self.config.widthOfPopover + parseInt(self.config.pointerHeight),
//                                 horizontalPadding;

//                             if(horizontalOffset[1]==='%') horizontalPadding=widthOfPopover*(parseInt(horizontalOffset[0])/100);
//                             else horizontalPadding=parseInt(horizontalOffset[0]);

//                             if(horizontalAttachment==='left') {
//                                 console.log('test');
//                                 styleExtension={
//                                     right: (horizontalPadding-parseInt(self.config.pointerHeight)) + 'px',
//                                     left: '',
//                                     transform: 'translate(0,-50%)'
//                                 }
//                             }
//                             else {
//                                 console.log('test2');
//                                 console.log('horizontalpad',horizontalPadding);
//                                 styleExtension={
//                                     left: (horizontalPadding-parseInt(self.config.pointerHeight)) + 'px',
//                                     right: '',
//                                     transform: 'translate(0,-50%)'
//                                 }
//                             }
//                         }

//                         angular.extend(styles,styleExtension);
//                         console.log('pointerOffset',styles);
//                         return styles;
//                     },
//                     getBaseBorderStyles:function cuiPopoverGetBaseBorderStyle(position){
//                         var transparentHorizontalBorder=self.config.pointerWidth + 'px solid transparent';
//                         var transparentVerticalBorder=self.config.pointerHeight + 'px solid transparent';
//                         if(position==='top' || position==='bottom'){
//                             return {
//                                 'border-right':transparentHorizontalBorder,
//                                 'border-left':transparentHorizontalBorder,
//                                 'border-bottom':transparentVerticalBorder,
//                                 'border-top':transparentVerticalBorder
//                             }
//                         }
//                         else return {
//                             'border-right':transparentVerticalBorder,
//                             'border-left':transparentVerticalBorder,
//                             'border-bottom':transparentHorizontalBorder,
//                             'border-top':transparentHorizontalBorder
//                         }
//                     },
//                     getPointerStyles:function cuiPopoverGetPointerStyles(attachment){
//                         var styles={
//                             position:'absolute'
//                         };

//                         angular.extend(styles,self.helpers.getPointerOffset(attachment || self.config.targetAttachment));

//                         var attachment=(attachment || self.config.targetAttachment).split(' '),
//                             verticalAttachment=attachment[0],
//                             horizontalAttachment=attachment[1];


//                         var colorOfPopoverBackground=elem.css('backgroundColor'),
//                             stylesOfVisibleBorder=self.config.pointerHeight + 'px solid ' + colorOfPopoverBackground;

//                         if(verticalAttachment==='top' || verticalAttachment==='bottom'){
//                             angular.extend(styles,self.helpers.getBaseBorderStyles(verticalAttachment));
//                             styles['border-' + verticalAttachment]=stylesOfVisibleBorder;
//                         }
//                         else if(verticalAttachment==='middle'){
//                             angular.extend(styles,self.helpers.getBaseBorderStyles(horizontalAttachment));
//                             styles['border-' + horizontalAttachment]=stylesOfVisibleBorder;
//                         }
//                         return styles;
//                     },
//                     getPopoverMargins:function cuiPopoverGetMargins(attachment){
//                         var attachment=(attachment || self.config.targetAttachment).split(' ');
//                         var verticalAttachment=attachment[0];
//                         var horizontalAttachment=attachment[1];

//                         var margin=self.config.pointerHeight + 'px';

//                         return {
//                             'margin-top':verticalAttachment==='bottom' ? margin : '',
//                             'margin-right':horizontalAttachment==='left' ? margin : '',
//                             'margin-bottom':verticalAttachment==='top' ? margin : '',
//                             'margin-left':horizontalAttachment==='right' ? margin : ''
//                         };
//                     },
//                     getContainerPaddings:function cuiPopoverGetContainerPaddings(newAttachment){
//                         var offset=self.config.offset.split(' ');
//                         var verticalOffset=offset[0];
//                         var horizontalOffset=self.helpers.getOffsetAndUnitsOfOffset(offset[1]);

//                         var paddingTop,paddingBottom,paddingRight,paddingLeft;

//                         var attachment=(function(){
//                             if(newAttachment && !angular.equals(attachment,newAttachment)) return newAttachment.split(' ');
//                             else return self.config.targetAttachment.split(' ');
//                         })(),
//                             verticalAttachment=attachment[0],
//                             horizontalAttachment=attachment[1];


//                         if( verticalAttachment==='top' ) paddingBottom=verticalOffset;
//                         else if( verticalAttachment==='bottom' ) paddingTop=verticalOffset;
//                         else {
//                             var widthOfPopover=self.config.widthOfPopover + parseInt(self.config.pointerHeight),
//                                 horizontalPadding;

//                             if(horizontalOffset[1]==='%') horizontalPadding=widthOfPopover*(parseInt(horizontalOffset[0])/100);
//                             else horizontalPadding=horizontalOffset.join('');

//                             if ( horizontalAttachment==='left' ) paddingRight=horizontalPadding;
//                             else paddingLeft=horizontalPadding;
//                         }

//                         return {
//                             'padding-top':paddingTop || '',
//                             'padding-right':paddingRight || '',
//                             'padding-bottom':paddingBottom || '',
//                             'padding-left':paddingLeft || '',
//                         };
//                     },
//                     getPointer:function cuiPopoverGetPointer(){
//                         if(self.selectors.$pointer) self.selectors.$pointer.detach();
//                         var $pointer=$('<span class="cui-popover__pointer"></span>');
//                         $pointer.css(self.helpers.getPointerStyles());
//                         self.selectors.$pointer=$pointer;
//                         return $pointer;
//                     }
//                 },
//                 render:{
//                     popoverContainer:function cuiPopoverPopoverContainer(){
//                         var $container=$('<div class="cui-popover__container"></div>');
//                         $container.css(self.helpers.getContainerPaddings());
//                         $container[0].classList.add('hide--opacity');
//                         self.selectors.$container=$container;

//                         // append the cui-popover to the container and apply the margins to make room for the pointer
//                         elem.css(self.helpers.getPopoverMargins());
//                         $container.append(elem);

//                         // append the pointer to the container
//                         $container.append(self.helpers.getPointer());

//                         angular.element(document.body).append($container);
//                         popoverTether=new Tether({
//                             element: $container[0],
//                             target: self.config.target,
//                             attachment: self.config.attachment,
//                             targetAttachment: self.config.targetAttachment,
//                             offset: self.config.attachment.split(' ')[0]==='top' || self.config.attachment.split(' ')[0]==='bottom' ? '0 ' + self.config.offset.split(' ')[1] : self.config.offset.split(' ')[0] + ' 0',
//                             targetOffset: '0 ' + self.config.pointerOffset,
//                             targetModifier: self.config.targetModifier,
//                             constraints: self.config.constraints
//                         });
//                         $container[0].classList.remove('hide--opacity');

//                     }
//                 },
//                 rePosition:function(newAttachment){
//                     if(!newAttachment || newAttachment==='normal') {
//                         elem.css(self.helpers.getPopoverMargins());
//                         self.selectors.$pointer.css(self.helpers.getPointerStyles());
//                         self.selectors.$container.css(self.helpers.getContainerPaddings());
//                     }
//                     else {
//                         var newTargetAttachmentMode=self.helpers.invertAttachment(self.config.targetAttachment);
//                         elem.css(self.helpers.getPopoverMargins(newTargetAttachmentMode));
//                         self.selectors.$pointer.css(self.helpers.getPointerStyles(newTargetAttachmentMode));
//                         self.selectors.$container.css(self.helpers.getContainerPaddings(newTargetAttachmentMode));
//                     }
//                 }
//             };
//             cuiPopover.init();
//         }
//     };
// }]);