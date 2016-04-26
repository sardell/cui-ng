angular.module('cui-ng')
.directive('cuiPopover', ['$compile','$timeout','$interval', ($compile,$timeout,$interval) => {
    return {
        restrict: 'EA',
        scope: {},
        link: (scope, elem, attrs) => {
            let self;
            let popoverTether,tetherAttachmentInterval,targetElementPositionInterval;

            let cuiPopoverConfig = {

            };

            const cuiPopoverHelpers = {
                getResetStyles : () => {
                    return {
                        'margin-right':'',
                        'margin-left':'',
                        'margin-bottom':'',
                        'margin-top':'',
                        'left':'',
                        'top':'',
                        'bottom':'',
                        'right':''
                    };
                },
                getAttachmentFromPosition : (position) => {
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
                },
                invertAttachmentPartial : (partial) => {
                    switch (partial) {
                        case 'top':
                            return 'bottom';
                        case 'bottom':
                            return 'top';
                        case 'left':
                            return 'right';
                        case 'right':
                            return 'left';
                    };
                },
                parseOffset : (offset) => {
                    let splitOffset = offset.split(' ');
                    const verticalOffset = cuiPopoverHelpers.getOffsetAndUnitsOfOffset(splitOffset[0]);
                    const horizontalOffset = cuiPopoverHelpers.getOffsetAndUnitsOfOffset(splitOffset[1]);

                    return { verticalOffset, horizontalOffset };
                },
                parseAttachment : (attachment) => {
                    const [ verticalAttachment , horizontalAttachment ] = attachment.split(' ');
                    return { verticalAttachment, horizontalAttachment };
                },
                getTetherOffset: (position, offset) => {
                    const { verticalOffset , horizontalOffset } = cuiPopoverHelpers.parseOffset(offset);

                    switch (position){
                        case 'top':
                        case 'bottom':
                            return '0 ' + (horizontalOffset.amount * -1) + horizontalOffset.units;
                        default:
                            return (verticalOffset.amount * -1) + verticalOffset.units + ' 0';
                    };
                },
                invertAttachment: (attachment) => {
                    const { verticalAttachment, horizontalAttachment } = cuiPopoverHelpers.parseAttachment(attachment);
                    return invertAttachmentPartial(verticalAttachment) + ' ' + invertAttachmentPartial(horizontalAttachment);
                },
                getOffsetAndUnitsOfOffset: (offsetPartial) => {
                    let amount,units;
                    switch (offsetPartial.indexOf('%')){
                        case -1 :
                            amount  = window.parseInt(offsetPartial.split('px')[0]);
                            units = 'px';
                            break;
                        default :
                            amount = window.parseInt(offsetPartial.split('%')[0]);
                            units = '%';
                    };
                    return { amount, units };
                },
                getPointerOffset:({ position, offsetBetweenPointerAndContent, popoverHeight, popoverWidth, pointerHeight, pointerWidth, containerHeight, containerWidth, distanceBetweenTargetAndPopover }) => {
                    const contentOffset = cuiPopoverHelpers.getOffsetAndUnitsOfOffset(offsetBetweenPointerAndContent);
                    const contentOffsetCompensation = () => {
                        switch (position) {
                            case 'top':
                            case 'bottom':
                                return {'margin-left':'50%', 'left': (contentOffset.amount * -1) + contentOffset.units};
                            case 'left':
                            case 'right':
                                switch (contentOffset.amount){
                                    case 0:
                                        return {'top':'50%'};
                                    default:
                                        let topMargin;
                                        contentOffset.units === '%'? topMargin = containerHeight * ((contentOffset.amount * -1) /100) : topMargin = contentOffset.amount + contentOffset.units;
                                        return { 'top':'50%', 'margin-top': topMargin };
                                };
                        };
                    }

                    const containerPadding = cuiPopoverHelpers.getContainerPaddings({position, offsetBetweenPointerAndContent, popoverHeight, popoverWidth, pointerHeight, pointerWidth, containerHeight, containerWidth, distanceBetweenTargetAndPopover});
                    const pointerOffset = () => {
                        switch (position) {
                            case 'top':
                                return {
                                    bottom:'0',
                                    transform:'translate(-50%,' + (-Math.ceil(parseFloat(containerPadding['padding-bottom'])) + pointerHeight) + 'px)'
                                };
                            case 'bottom':
                                return {
                                    top:'0',
                                    transform: 'translate(-50%,' + (Math.ceil(parseFloat(containerPadding['padding-top'])) - pointerHeight) + 'px)'
                                };
                            case 'left':
                                return {
                                    right: (parseFloat(containerPadding['padding-right']) - pointerHeight) + 'px',
                                    transform: 'translate(0,-50%)'
                                };
                            case 'right':
                                return {
                                    left: (parseFloat(containerPadding['padding-left']) - pointerHeight) + 'px',
                                    transform: 'translate(0,-50%)'
                                };
                        };
                    };

                    return Object.assign({}, cuiPopoverHelpers.getResetStyles(), pointerOffset(), contentOffsetCompensation());
                },
                getPointerBorderStyles: ({ position,pointerHeight,pointerWidth}) => {
                    const transparentHorizontalBorder = pointerWidth + 'px solid transparent';
                    const transparentVerticalBorder = pointerHeight + 'px solid transparent';
                    if(position === 'top' || position === 'bottom'){
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
                getPointerStyles: ({ position, offsetBetweenPointerAndContent, popoverHeight, popoverWidth, pointerHeight, pointerWidth, containerHeight, containerWidth, distanceBetweenTargetAndPopover }) => {
                    const colorOfPopoverBackground = elem.css('backgroundColor'),
                        stylesOfVisibleBorder = pointerHeight + 'px solid ' + colorOfPopoverBackground;

                    return Object.assign({position:'absolute'},
                            cuiPopoverHelpers.getPointerOffset({position, offsetBetweenPointerAndContent, popoverHeight, popoverWidth, pointerHeight, pointerWidth, containerHeight, containerWidth, distanceBetweenTargetAndPopover}),
                            cuiPopoverHelpers.getPointerBorderStyles({position, offsetBetweenPointerAndContent, popoverHeight, popoverWidth, pointerHeight, pointerWidth, containerHeight, containerWidth, distanceBetweenTargetAndPopover}),
                            {['border' + position] : stylesOfVisibleBorder}
                        );
                },
                getPointer:(opts) => {
                    const $pointer = $('<span class="cui-popover__pointer"></span>');
                    $pointer.css(cuiPopoverHelpers.getPointerStyles(opts));
                    return $pointer;
                },
                getPopoverMargins: (position, pointerHeight) => {
                    let margin = pointerHeight + 'px';
                    return {
                        'margin-top': position === 'bottom' ? margin : '',
                        'margin-right': position === 'left' ? margin : '',
                        'margin-bottom': position === 'top' ? margin : '',
                        'margin-left': position === 'right' ? margin : ''
                    };
                },
                getContainerPaddings: ({ position, offsetBetweenPointerAndContent, popoverHeight, popoverWidth, pointerHeight, distanceBetweenTargetAndPopover }) => {
                    const padding = cuiPopoverHelpers.getOffsetAndUnitsOfOffset(distanceBetweenTargetAndPopover);

                    let [ paddingTop, paddingBottom, paddingRight, paddingLeft ] = ['','','',''];

                    if( position === 'top' || position === 'bottom') {
                       let verticalPadding;
                       switch(padding.units) {
                           default: // 'px' or ''
                               verticalPadding = padding.amount + padding.units;
                               break;
                           case '%':
                               const heightOfContainer = popoverHeight + pointerHeight;
                               verticalPadding = heightOfContainer * (padding.amount / 100) + 'px';
                        };
                        position === 'top' ? paddingBottom = verticalPadding : paddingTop = verticalPadding;
                    }
                    else {
                        let horizontalPadding;
                        switch(padding.units) {
                            default: // 'px' or ''
                                horizontalPadding = padding.amount + padding.units;
                                break;
                            case '%':
                                const widthOfContainer = popoverWidth + pointerHeight;
                                horizontalPadding = widthOfPopover * (padding.amount / 100) + 'px';
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
            };





            const cuiPopover = {
                init:function(){
                    self=this;
                    self.render.popoverContainer();
                    angular.forEach(self.watchers, function cuiPopoverInitWatcher(initWatcher){
                        initWatcher();
                    });
                },
                config:(() => {
                        const _this=cuiPopoverConfig;
                        _this.target = attrs.target;
                        _this.position = attrs.popoverPosition || 'bottom';
                        _this.targetModifier = attrs.targetModifier || undefined;
                        _this.allowedReposition = attrs.allowedReposition || 'any';
                        _this.pointerHeight = attrs.pointerHeight && window.parseInt(attrs.pointerHeight) || 14;
                        _this.pointerWidth = attrs.pointerWidth && window.parseInt(attrs.pointerWidth) || 9;
                        _this.hidePopoverIfOob = scope.$eval(attrs.hidePopoverIfOob) || false;

                        _this.popoverWidth = elem.outerWidth();
                        _this.popoverHeight = elem.outerHeight();

                        let calcs = (() => {
                            const popoverOffsetAttribute = (attrs.popoverOffset || '0 0').split(' ');
                            let offset, targetOffset, targetAndPopoverOffset, pointerOffset, containerWidth, containerHeight;

                            if(_this.position === 'top' || _this.position==='bottom'){
                                [ targetAndPopoverOffset, pointerOffset ] = popoverOffsetAttribute;
                                offset = ['0', targetAndPopoverOffset].join(' ');
                                targetOffset = ['0', pointerOffset].join(' ');
                                containerWidth = _this.popoverWidth;
                                containerHeight = _this.popoverHeight + _this.pointerHeight;
                            }
                            else {
                                [ pointerOffset, targetAndPopoverOffset ] = popoverOffsetAttribute;
                                offset = [targetAndPopoverOffset, '0'].join(' ');
                                targetOffset = [pointerOffset,'0'].join(' ');
                                containerWidth = _this.popoverWidth + _this.pointerHeight;
                                containerHeight = _this.popoverHeight;
                            }

                            _this.distanceBetweenTargetAndPopover = targetAndPopoverOffset;
                            _this.offsetBetweenPointerAndContent = targetAndPopoverOffset;
                            _this.offset = offset;
                            _this.targetOffset = targetOffset;
                            _this.containerHeight = containerHeight;
                            _this.containerWidth = containerWidth;

                            _this.attachment = cuiPopoverHelpers.getAttachmentFromPosition(_this.position);
                            _this.targetAttachment = cuiPopoverHelpers.getAttachmentFromPosition(cuiPopoverHelpers.invertAttachmentPartial(_this.position));
                        })();
                    })(),
                helpers: {
                    getTetherOptions:( element = self.selectors.$container[0] ) => {
                        const { target, offset, targetOffset, targetModifier, attachment, targetAttachment, hidePopoverIfOob, allowedReposition } = cuiPopoverConfig;
                        return {
                            target,
                            targetModifier,
                            attachment,
                            targetAttachment,
                            targetOffset,
                            offset : cuiPopoverHelpers.getTetherOffset(position,offset),
                            element : element,
                            constraints: hidePopoverIfOob || allowedReposition==='none' ? [{ to: 'window', attachment: 'none none' }] : [{ to: 'window', attachment: 'together together' }]
                        };
                    }
                },
                watchers:{
                    position:() => {
                        tetherAttachmentInterval = $interval(() => {
                            if(!popoverTether || !popoverTether.element) return;
                            const { position, allowedReposition, hidePopoverIfOob } = cuiPopoverConfig;
                            const { invertAttachmentPartial } = cuiPopoverHelpers;
                            switch(hidePopoverIfOob) {
                                case true:
                                    scope.position = popoverTether.element.classList.contains('tether-out-of-bounds') ? 'hidden' : 'normal';
                                    break;
                                default:
                                    switch(allowedReposition) {
                                        case 'none':
                                            scope.position = 'normal';
                                            break;
                                        case 'opposite':
                                            scope.position = popoverTether.element.classList.contains('tether-element-attached-' + invertAttachmentPartial(position)) ? 'normal' : 'inverted';
                                            break;
                                        case 'any':
                                            if(popoverTether.element.classList.contains('tether-out-of-bounds' + invertAttachmentPartial(position))
                                                || popoverTether.element.classList.contains('tether-out-of-bounds-' + position)) {
                                                scope.position = 'fallback';
                                                $interval.cancel(tetherAttachmentInterval); // cancel the interval temporarily
                                            }
                                            else if (!popoverTether.element.classList.contains('tether-element-attached-' + invertAttachmentPartial(position))) scope.position = 'inverted';
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

                    targetElementPosition:() => {
                        targetElementPositionInterval=$interval(() => {
                            scope.targetPosition = self.selectors.$target.offset();
                        },10)

                        scope.$watch('targetPosition',(newPosition) => {
                            newPosition && popoverTether.position();
                        },(newPosition,oldPosition) => newPosition.top !== oldPosition.top || newPosition.left !== oldPosition.left );
                    },

                    scopeDestroy:() => {
                        scope.$on('$destroy',() => {
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
                render:{
                    popoverContainer:() => {
                        const { getPointer, getPopoverMargins, getContainerPaddings } = cuiPopoverHelpers;
                        const opts = cuiPopoverConfig;

                        const $container = $('<div class="cui-popover__container"></div>');
                        $container.css(getContainerPaddings(opts));
                        $container[0].classList.add('hide--opacity');
                        self.selectors.$container = $container;

                        // append the pointer to the container
                        if(self.selectors.$pointer) self.selectors.$pointer.detach();
                        const $pointer=getPointer(opts);
                        $container.append($pointer);
                        self.selectors.$pointer=$pointer;

                        // append the cui-popover to the container and apply the margins to make room for the pointer
                        elem.css(getPopoverMargins(opts.position, opts.pointerHeight));
                        $container.append(elem);

                        angular.element(document.body).append($container);
                        popoverTether = new Tether(self.helpers.getTetherOptions($container));

                        popoverTether.position();
                    }
                },
                rePosition:function cuiPopoverReposition(newAttachment){
                    // self.selectors.$container[0].classList.add('hide--opacity');

                    // switch(newAttachment){
                    //     case 'hidden':
                    //         break;
                    //     case undefined:
                    //     case 'normal':
                    //         elem.css(self.helpers.getPopoverMargins());
                    //         self.selectors.$pointer.css(self.helpers.getPointerStyles());
                    //         self.selectors.$container.css(self.helpers.getContainerPaddings());
                    //         self.selectors.$container[0].classList.remove('hide--opacity');
                    //         break;
                    //     case 'inverted':
                    //         var newPosition=invertAttachmentPartial(self.config.position);
                    //         elem.css(self.helpers.getPopoverMargins(newPosition));
                    //         self.selectors.$pointer.css(self.helpers.getPointerStyles(newPosition));
                    //         self.selectors.$container.css(self.helpers.getContainerPaddings(newPosition));
                    //         self.selectors.$container[0].classList.remove('hide--opacity');
                    //         break;
                    //     case 'fallback': // if we need to rotate the tether 90deg
                    //         self.config.position = self.helpers.getRotatedPosition(self.config.position);
                    //         self.config.attachment = getAttachmentFromPosition(self.config.position);
                    //         self.config.targetAttachment = getAttachmentFromPosition(invertAttachmentPartial(self.config.position));
                    //         elem.css(self.helpers.getPopoverMargins());
                    //         self.selectors.$container.css(self.helpers.getContainerPaddings());
                    //         self.selectors.$pointer.css(self.helpers.getPointerStyles(self.config.position));
                    //         popoverTether.setOptions(self.helpers.getTetherOptions());
                    //         self.watchers.position();


                }
            };
            cuiPopover.init();
        }
    };
}]);