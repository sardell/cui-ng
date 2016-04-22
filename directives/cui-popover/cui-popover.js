angular.module('cui-ng')
.directive('cuiPopover', ['$compile','$timeout','$interval',function cuiPopoverDirective($compile,$timeout,$interval) {
    return {
        restrict: 'EA',
        scope: {},
        link: function cuiPopoverLink(scope, elem, attrs) {
            var self;
            var popoverTether,tetherAttachmentInterval,targetElementPositionInterval;

            var getAttachmentFromPosition = function(position) {
                switch(position) {
                    case 'top':
                        return 'bottom center';
                    case 'bottom':
                        return 'top center';
                    case 'right':
                        return 'middle left';
                    case 'left':
                        return 'middle right';
                };
            };

            var invertPosition = function cuiPopoverInvertPosition(position) {
                switch (position) {
                    case 'top':
                        return 'bottom';
                    case 'bottom':
                        return 'top';
                    case 'left':
                        return 'right';
                    case 'right':
                        return 'left';
                };
            };

            var cuiPopover={
                init:function cuiPopoverInit(){
                    self=this;
                    self.render.popoverContainer();
                    angular.forEach(self.watchers, function cuiPopoverInitWatcher(initWatcher){
                        initWatcher();
                    });
                },
                config:(function cuiPopoverInitConfig(){
                    var position = attrs.popoverPosition || 'bottom',
                        offset, targetOffset, pointerOffset, distanceBetweenTargetAndPopover;

                    var popoverOffsetAttribute = (attrs.popoverOffset || '0 0').split(' ');
                    var contentOffsetAttribute = (attrs.contentOffset || '0 0').split(' ');
                    var offsetBetweenPointerAndContent = (attrs.contentOffset || '0');

                    if(position === 'top' || position === 'bottom'){
                        pointerOffset = popoverOffsetAttribute[1];
                        distanceBetweenTargetAndPopover = popoverOffsetAttribute[0];
                        offset = ['0', offsetBetweenPointerAndContent].join(' ');
                        targetOffset = '0 ' + pointerOffset;
                    }
                    else {
                        pointerOffset = popoverOffsetAttribute[0];
                        distanceBetweenTargetAndPopover = popoverOffsetAttribute[1];
                        offset = [offsetBetweenPointerAndContent, '0'].join(' ');
                        targetOffset = pointerOffset + ' 0';
                    }

                    return {
                        attachment: getAttachmentFromPosition(position),
                        targetAttachment: getAttachmentFromPosition(invertPosition(position)),
                        offset: offset,
                        targetOffset: targetOffset,
                        pointerHeight: attrs.pointerHeight && parseInt(attrs.pointerHeight) || 14,
                        pointerWidth: attrs.pointerWidth && parseInt(attrs.pointerWidth) || 9,

                        target: attrs.target,
                        targetModifier: attrs.targetModifier || undefined,

                        allowedReposition: attrs.allowedReposition || 'any',
                        hidePopoverIfOob: scope.$eval(attrs.hidePopoverIfOob) || false,
                        position: attrs.popoverPosition || 'bottom',
                        distanceBetweenTargetAndPopover: distanceBetweenTargetAndPopover,
                        offsetBetweenPointerAndContent: offsetBetweenPointerAndContent,
                        pointerOffset: pointerOffset,
                        popover: (function getInnerWidth() {
                            return {
                                width: elem.outerWidth(),
                                height: elem.outerHeight()
                            };
                        })()
                    };
                })(),
                watchers:{
                    position:function cuiPopoverWatchTetherAttachment() {
                        tetherAttachmentInterval = $interval(function() {
                            if(!popoverTether || !popoverTether.element) return;
                            var position = self.config.position;
                            switch(self.config.hidePopoverIfOob){
                                case true:
                                    scope.position = popoverTether.element.classList.contains('tether-out-of-bounds') ? 'hidden' : 'normal';
                                    break;
                                default:
                                    switch(self.config.allowedReposition) {
                                        case 'none':
                                            scope.position = 'normal';
                                            break;
                                        case 'opposite':
                                            scope.position = popoverTether.element.classList.contains('tether-element-attached-' + invertPosition(position)) ? 'normal' : 'inverted';
                                            break;
                                        case 'any':
                                            if(popoverTether.element.classList.contains('tether-out-of-bounds' + invertPosition(position))
                                                || popoverTether.element.classList.contains('tether-out-of-bounds-' + position)) {
                                                scope.position = 'fallback';
                                                $interval.cancel(tetherAttachmentInterval); // cancel the interval temporarily
                                            }
                                            else if (!popoverTether.element.classList.contains('tether-element-attached-' + invertPosition(position))) scope.position = 'inverted';
                                            else scope.position = 'normal';
                                            break;
                                    };
                            };
                        },10);

                        scope.$watch('position',function(newPosition,oldPosition) {
                            if(newPosition && newPosition !== oldPosition) {
                                self.rePosition(newPosition);
                            }
                        });
                    },

                    targetElementPosition:function cuiPopoverWatchElementPosition() {
                        targetElementPositionInterval=$interval(function(){
                            scope.targetPosition = self.selectors.$target.offset();
                        },10)

                        scope.$watch('targetPosition',function(newPosition){
                            newPosition && popoverTether.position();
                        },function(newPosition,oldPosition){
                            return (newPosition.top !== oldPosition.top || newPosition.left !== oldPosition.left);
                        });
                    },

                    scopeDestroy:function cuiPopoverWatchScopeDestroy(){
                        scope.$on('$destroy',function(){
                            $interval.cancel(tetherAttachmentInterval);
                            $interval.cancel(targetElementPositionInterval);
                            popoverTether.destroy();
                            self.selectors.$container && self.selectors.$container.detach();
                            self.selectors.$pointer && self.selectors.$pointer.detach();
                        })
                    }
                },
                selectors:{
                    $target:angular.element(document.querySelector(attrs.target))
                },
                helpers:{
                    getTetherOptions:function cuiPopoverGetTetherOptions(){
                        var offset=self.config.offset.split(' ');
                        var verticalOffset=self.helpers.getOffsetAndUnitsOfOffset(offset[0]);
                        var horizontalOffset=self.helpers.getOffsetAndUnitsOfOffset(offset[1])

                        switch (self.config.position){
                            case 'top':
                            case 'bottom':
                                offset='0 ' + (horizontalOffset.amount * -1) + horizontalOffset.units;
                                break;
                            default:
                                offset=(verticalOffset.amount * -1) + verticalOffset.units + ' 0';
                        };

                        return {
                            element: self.selectors.$container[0],
                            target: self.config.target,
                            attachment: self.config.attachment,
                            targetAttachment: self.config.targetAttachment,
                            offset: offset,
                            targetOffset: self.config.targetOffset,
                            targetModifier: self.config.targetModifier,
                            constraints: self.config.hidePopoverIfOob || self.config.allowedReposition==='none' ? [{ to: 'window', attachment: 'none none' }] : [{ to: 'window', attachment: 'together together' }]
                        }
                    },
                    invertAttachment:function cuiPopoverInvertAttachment(attachment){
                        var positions=attachment.split(' ');
                        var verticalPosition=positions[0];
                        var horizontalPosition=positions[1];
                        return invertPosition(verticalPosition) + ' ' + invertPosition(horizontalPosition);
                    },
                    getRotatedPosition: function cuiPopoverGetRotatedPosition(position) {
                        switch (position) {
                            case 'top':
                            case 'bottom':
                                return 'right';
                            default:
                                return 'bottom';
                        };
                    },
                    getOffsetAndUnitsOfOffset:function cuiPopovergetOffsetAndUnitsOfOffset(offsetPartial){
                        var offsetAndUnit={};
                        if(offsetPartial.indexOf('%')>-1){
                            offsetAndUnit.amount=parseInt(offsetPartial.split('%')[0]);
                            offsetAndUnit.units='%';
                        }
                        else if(offsetPartial.indexOf('px')>-1){
                            offsetAndUnit.amount=parseInt(offsetPartial.split('px')[0]);
                            offsetAndUnit.units='px';
                        }
                        else {
                            offsetAndUnit.amount=parseInt(offsetPartial); // the amount of offset
                            offsetAndUnit.units='px'; // the units
                        }
                        return offsetAndUnit;
                    },
                    getPointerClass:function cuiPopoverGetPointerClass(position){
                        var position = position || self.config.position;
                        return 'cui-popover__pointer ' + 'cui-popover__pointer--' + invertPosition(position);
                    },
                    getPointerOffset:function cuiPopoverGetPointerOffset(position) {
                        var position = position || self.config.position;

                        var offsetBetweenPointerAndContent = self.config.offsetBetweenPointerAndContent;
                        var offset = self.helpers.getOffsetAndUnitsOfOffset(offsetBetweenPointerAndContent);

                        var styles={
                            'margin-right':'',
                            'margin-left':'',
                            'margin-bottom':'',
                            'margin-top':'',
                            'left':'',
                            'top':'',
                            'bottom':'',
                            'right':''
                        };

                        angular.extend(styles,(function(position){
                            switch (position) {
                                case 'top':
                                case 'bottom':
                                    return { 'margin-left':'50%', 'left': (offset.amount * -1) + offset.units, 'margin-right':'','margin-top':'', 'margin-bottom':'' };
                                case 'left':
                                case 'right':
                                    switch(offset.amount){
                                        case 0:
                                            return { 'top':'50%' , 'margin-right': '','margin-left':'','margin-bottom':'','margin-top':'', 'bottom': ''};
                                        default:
                                            var containerHeight = self.config.popover.height,
                                                topMargin;
                                            offset.units === '%'? topMargin = containerHeight * ((offset.amount * -1) /100) : topMargin = offset.amount + offset.units;
                                            return { 'top':'50%', 'margin-top': topMargin };
                                    };
                            };
                        })(position));

                        var containerPadding = self.helpers.getContainerPaddings(position);
                        var styleExtension = (function(position){
                            switch (position) {
                                default:
                                    return {};
                                case 'top':
                                    return {
                                        bottom:'0',
                                        transform:'translate(-50%,' + (-Math.ceil(parseFloat(containerPadding['padding-bottom'])) + self.config.pointerHeight) + 'px)'
                                    };
                                case 'bottom':
                                    return {
                                        top:'0',
                                        transform: 'translate(-50%,' + (Math.ceil(parseFloat(containerPadding['padding-top'])) - self.config.pointerHeight) + 'px)'
                                    };
                                case 'left':
                                    return {
                                        right: (parseFloat(containerPadding['padding-right']) - self.config.pointerHeight) + 'px',
                                        transform: 'translate(0,-50%)'
                                    };
                                case 'right':
                                    return {
                                        left: (parseFloat(containerPadding['padding-left']) - self.config.pointerHeight) + 'px',
                                        transform: 'translate(0,-50%)'
                                    };
                            };
                        })(position);

                        styleExtension[position]=''; // reset whatever the position property , ie top, bottom, left or right
                        angular.extend(styles,styleExtension);
                        return styles;
                    },
                    getBaseBorderStyles:function cuiPopoverGetBaseBorderStyle(position){
                        var transparentHorizontalBorder=self.config.pointerWidth + 'px solid transparent';
                        var transparentVerticalBorder=self.config.pointerHeight + 'px solid transparent';
                        if(position==='top' || position==='bottom'){
                            return {
                                'border-right':transparentHorizontalBorder,
                                'border-left':transparentHorizontalBorder,
                                'border-bottom':transparentVerticalBorder,
                                'border-top':transparentVerticalBorder
                            }
                        }
                        else return {
                            'border-right':transparentVerticalBorder,
                            'border-left':transparentVerticalBorder,
                            'border-bottom':transparentHorizontalBorder,
                            'border-top':transparentHorizontalBorder
                        }
                    },
                    getPointerStyles:function cuiPopoverGetPointerStyles(position) {
                        var styles = {
                            position:'absolute'
                        };

                        var position = (position || self.config.position);

                        angular.extend(styles,self.helpers.getPointerOffset(position));
                        angular.extend(styles,self.helpers.getBaseBorderStyles(position));

                        var colorOfPopoverBackground = elem.css('backgroundColor'),
                            stylesOfVisibleBorder = self.config.pointerHeight + 'px solid ' + colorOfPopoverBackground;

                        styles['border-' + position] = stylesOfVisibleBorder;

                        return styles;
                    },
                    getPointer:function cuiPopoverGetPointer() {
                        if(self.selectors.$pointer) self.selectors.$pointer.detach();
                        var $pointer = $('<span class="cui-popover__pointer"></span>');
                        $pointer.css(self.helpers.getPointerStyles());
                        self.selectors.$pointer = $pointer;
                        return $pointer;
                    },
                    getPopoverMargins:function cuiPopoverGetMargins(position) {
                        var position = position || self.config.position;

                        var margin = self.config.pointerHeight + 'px';

                        return {
                            'margin-top': position === 'bottom' ? margin : '',
                            'margin-right': position === 'left' ? margin : '',
                            'margin-bottom': position === 'top' ? margin : '',
                            'margin-left': position === 'right' ? margin : ''
                        };
                    },
                    getContainerPaddings:function cuiPopoverGetContainerPaddings(position) {
                        var distanceBetweenTargetAndPopover = self.config.distanceBetweenTargetAndPopover;
                        var padding = self.helpers.getOffsetAndUnitsOfOffset(distanceBetweenTargetAndPopover);

                        var paddingTop, paddingBottom, paddingRight, paddingLeft;

                        var position = (function(){
                            if(position && position !== self.config.position) return position;
                            else return self.config.position;
                        })();

                        if( position === 'top' || position === 'bottom') {
                           var verticalPadding;
                           switch(padding.units) {
                               default: // 'px' or ''
                                   verticalPadding = padding.amount + padding.units;
                                   break;
                               case '%':
                                   var heightOfPopover = self.config.popover.height + self.config.pointerHeight;
                                   verticalPadding = heightOfPopover * (padding.amount / 100) + 'px';
                            };
                            position === 'top' ? paddingBottom = verticalPadding : paddingTop = verticalPadding;
                        }
                        else {
                            var horizontalPadding;

                            switch(padding.units) {
                                default: // 'px' or ''
                                    horizontalPadding= padding.amount + padding.units;
                                    break;
                                case '%':
                                    var widthOfPopover = self.config.popover.width + self.config.pointerHeight,
                                    horizontalPadding=widthOfPopover * (padding.amount / 100) + 'px';
                            };
                            position === 'left' ? paddingRight = horizontalPadding : paddingLeft = horizontalPadding;
                        }

                        return {
                            'padding-top': paddingTop || '',
                            'padding-right': paddingRight || '',
                            'padding-bottom': paddingBottom || '',
                            'padding-left': paddingLeft || '',
                        };
                    }
                },
                render:{
                    popoverContainer:function cuiPopoverPopoverContainer() {
                        var $container = $('<div class="cui-popover__container"></div>');
                        $container.css(self.helpers.getContainerPaddings());
                        $container[0].classList.add('hide--opacity');
                        self.selectors.$container = $container;

                        // append the pointer to the container
                        $container.append(self.helpers.getPointer());

                        // append the cui-popover to the container and apply the margins to make room for the pointer
                        elem.css(self.helpers.getPopoverMargins());
                        $container.append(elem);

                        angular.element(document.body).append($container);
                        popoverTether = new Tether(self.helpers.getTetherOptions());

                        popoverTether.position();
                    }
                },
                rePosition:function cuiPopoverReposition(newAttachment){
                    self.selectors.$container[0].classList.add('hide--opacity');

                    switch(newAttachment){
                        case 'hidden':
                            break;
                        case undefined:
                        case 'normal':
                            elem.css(self.helpers.getPopoverMargins());
                            self.selectors.$pointer.css(self.helpers.getPointerStyles());
                            self.selectors.$container.css(self.helpers.getContainerPaddings());
                            self.selectors.$container[0].classList.remove('hide--opacity');
                            break;
                        case 'inverted':
                            var newPosition=invertPosition(self.config.position);
                            elem.css(self.helpers.getPopoverMargins(newPosition));
                            self.selectors.$pointer.css(self.helpers.getPointerStyles(newPosition));
                            self.selectors.$container.css(self.helpers.getContainerPaddings(newPosition));
                            self.selectors.$container[0].classList.remove('hide--opacity');
                            break;
                        case 'fallback': // if we need to rotate the tether 90deg
                            self.config.position = self.helpers.getRotatedPosition(self.config.position);
                            self.config.attachment = getAttachmentFromPosition(self.config.position);
                            self.config.targetAttachment = getAttachmentFromPosition(invertPosition(self.config.position));
                            elem.css(self.helpers.getPopoverMargins());
                            self.selectors.$container.css(self.helpers.getContainerPaddings());
                            self.selectors.$pointer.css(self.helpers.getPointerStyles(self.config.position));
                            popoverTether.setOptions(self.helpers.getTetherOptions());
                            self.watchers.position();

                    }
                }
            };
            cuiPopover.init();
        }
    };
}]);