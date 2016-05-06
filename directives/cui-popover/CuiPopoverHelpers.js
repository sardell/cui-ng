angular.module('cui-ng')
.factory('CuiPopoverHelpers',[()=>{
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
        parsePositionArray : (positionArray) => {
            const genericPositions = [{position:'bottom'},
                                    {position:'top'},
                                    {position:'right'},
                                    {position:'left'}]; // these are objects to facilitate the reposition function
            let positions=[];
            if(typeof positionArray==='undefined'){
                positions.push.apply(positions,genericPositions);
            }
            else {
                positionArray.forEach((position,i) => {
                    switch(position){
                        case 'any':
                            positions.push.apply(positions,genericPositions);
                            break;
                        case 'invert':
                            positions.push(Object.assign({},positionArray[i-1],{position:cuiPopoverHelpers.invertAttachmentPartial(positionArray[i-1].position)}));
                            break;
                        default:
                            positions.push(position);
                    };
                });
            }
            return positions;
        },
        parseOffset : (offset) => {
            const splitOffset = offset.split(' ');
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
        getPointerOffset:(opts) => {
            const { position, offsetBetweenPointerAndContent, popoverHeight, popoverWidth, pointerHeight, pointerWidth, containerHeight, containerWidth, distanceBetweenTargetAndPopover } = opts;
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

            const containerPadding = cuiPopoverHelpers.getContainerPaddings(opts);
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
        getPointerBorderStyles: (opts) => {
            const { position,pointerHeight,pointerWidth } = opts;
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
        getPointerStyles: (opts) => {
            const { element, position, offsetBetweenPointerAndContent, popoverHeight, popoverWidth, pointerHeight, pointerWidth, containerHeight, containerWidth, distanceBetweenTargetAndPopover } = opts;
            const colorOfPopoverBackground = element.css('backgroundColor'),
                stylesOfVisibleBorder = pointerHeight + 'px solid ' + colorOfPopoverBackground;

            return Object.assign({position:'absolute'},
                    cuiPopoverHelpers.getPointerOffset(opts),
                    cuiPopoverHelpers.getPointerBorderStyles(opts),
                    {['border-' + position] : stylesOfVisibleBorder}
                );
        },
        getPointer:(opts) => {
            const $pointer = $('<span class="cui-popover__pointer"></span>');
            $pointer.css(cuiPopoverHelpers.getPointerStyles(opts));
            return $pointer;
        },
        getPopoverMargins: (position, pointerHeight) => {
            const margin = pointerHeight + 'px';
            return {
                'margin-top': position === 'bottom' ? margin : '',
                'margin-right': position === 'left' ? margin : '',
                'margin-bottom': position === 'top' ? margin : '',
                'margin-left': position === 'right' ? margin : ''
            };
        },
        getContainerPaddings: (opts) => {
            const { position, offsetBetweenPointerAndContent, popoverHeight, popoverWidth, pointerHeight, distanceBetweenTargetAndPopover } = opts;
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
                        horizontalPadding = widthOfContainer * (padding.amount / 100) + 'px';
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

    return cuiPopoverHelpers;

}]);
