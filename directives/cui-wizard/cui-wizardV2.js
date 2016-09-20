angular.module('cui-ng')
.directive('cuiWizard',['$timeout','$compile','$window','$rootScope',($timeout,$compile,$window,$rootScope) => {
    return{
        restrict: 'E',
        scope: true,
        link:(scope,elem,attrs) => {
            const cuiWizard={
                initScope:() => {
                    Object.keys(cuiWizard.scope).forEach(function(property){
                        scope[property]=cuiWizard.scope[property];
                    });
                },
                config: {
                    bar: attrs.bar !== undefined,
                    clickableIndicators: attrs.clickableIndicators !== undefined,
                    dirtyValidation: attrs.dirtyValidation !== undefined,
                    minimumPadding: attrs.minimumPadding || 0,
                    mobileStack: attrs.mobileStack !== undefined,
                    mobileStackBreakingPoint: parseInt(attrs.mobileStack)
                },
                selectors:{
                    $wizard:angular.element(elem[0]),
                    $steps:angular.element(elem[0].querySelectorAll('step')),
                    $indicatorContainer:angular.element(elem[0].querySelectorAll('indicator-container')),
                    $window:angular.element($window),
                    $body:angular.element('body')
                },
                helpers: {
                    isFormValid: (form) => {
                        // Custom dirty-validation behavior
                        if (cuiWizard.config.dirtyValidation && !form.$valid) {
                            cuiWizard.helpers.setErrorFieldsToDirty(form);
                            return false;
                        }
                        // Default behavior
                        else if (!form.$valid) {
                            cuiWizard.helpers.setErrorFieldsToTouched(form);
                            return false;
                        }
                        return true;
                    },
                    setErrorFieldsToDirty: (form) => {
                        angular.forEach(form.$error, (field) => {
                            angular.forEach(field, (errorField) => {
                                errorField.$setDirty();
                            });
                        });
                    },
                    setErrorFieldsToTouched:(form)=>{
                        angular.forEach(form.$error, (field) => {
                            angular.forEach(field, (errorField) => {
                                errorField.$setTouched();
                            });
                        });
                    },
                    getStepInfo:(step) => { // step goes from 0 to numberOfSteps
                        const $step = cuiWizard.selectors.$steps[step];
                        return {
                            stepTitle: $step.attributes['step-title'].value,
                            icon: $step.attributes.icon ? $step.attributes.icon.value : false,
                            state: $step.attributes.state ? $step.attributes.state.value : false
                        };
                    },
                    getIconMarkup:(icon) => {
                        if(!icon) return '';
                        let iconMarkup;
                        switch (icon.indexOf('.')){
                            case -1:
                                iconMarkup = `<cui-icon cui-svg-icon="${icon}" svg-class="icon-svg"></cui-icon>`;
                                break;
                            default:
                                iconMarkup = `<img src="${icon}" class="cui-icon-rotate"/>`;
                        };

                        return `<div class="icon-container">
                                    <div class="icon">
                                        ${iconMarkup}
                                    </div>
                                </div>`
                    },
                    getNgClickForIndicator:(stepNumber,stepState) => { // stepNUmber from 0 to numberOfSteps
                        if(!cuiWizard.config.clickableIndicators) return '';
                        else return `ng-click="goToStep(${stepNumber+1}${',' + stepState || ''})"`;
                    },
                    getIndicatorMarkup:(stepNumber) => { // stepNUmber from 0 to numberOfSteps
                        const step = cuiWizard.helpers.getStepInfo(stepNumber);
                        let indicatorClass;
                        stepNumber+1 === cuiWizard.scope.currentStep ? indicatorClass='active' : stepNumber+1 < cuiWizard.scope.currentStep ? indicatorClass='visited' : indicatorClass='';
                        return `<span class="step-indicator ${indicatorClass}" ${cuiWizard.helpers.getNgClickForIndicator(stepNumber,step.state)}>
                                    <span class="step-indicator__title">${step.stepTitle}</span> ${cuiWizard.helpers.getIconMarkup(step.icon)}
                                </span>`;
                    },
                    getIndicatorsWidth:() => {
                        let totalWidth = 0;
                        cuiWizard.selectors.$indicators.each((i,indicator) => {
                            totalWidth += $(indicator).width();
                        });
                        return totalWidth;
                    },
                    thereIsRoomForIndicators:() => {
                        if((cuiWizard.helpers.getIndicatorsWidth() + (cuiWizard.config.minimumPadding * ( cuiWizard.config.numberOfSteps-1 ))) <
                            cuiWizard.selectors.$indicatorContainer.width()) return true;
                        return false;
                    },
                    debounce:function(func, wait, immediate){
                        let timeout;
                        return function() {
                            const context = this, args = arguments;
                            const later = () => {
                                timeout = null;
                                if (!immediate) {func.apply(context, args);}
                            };
                            const callNow = immediate && !timeout;
                            clearTimeout(timeout);
                            timeout = setTimeout(later, wait);
                            if (callNow) func.apply(context, args);
                        };
                    },
                    resizeHandler:() => {
                        cuiWizard.helpers.debounce(() => {
                            if(cuiWizard.config.bar) cuiWizard.reRender.bar(cuiWizard.scope.currentStep);
                            if(cuiWizard.helpers.thereIsRoomForIndicators() && cuiWizard.config.stepsCollapsed) {
                                cuiWizard.config.stepsCollapsed = false;
                                cuiWizard.selectors.$indicatorContainer.removeClass('small');
                            }
                            else if(!cuiWizard.helpers.thereIsRoomForIndicators() && !cuiWizard.config.stepsCollapsed) {
                                cuiWizard.config.stepsCollapsed = true;
                                cuiWizard.selectors.$indicatorContainer.addClass('small');
                            }
                            if(cuiWizard.config.mobileStack && (cuiWizard.selectors.$window.width() <= cuiWizard.config.mobileStackBreakingPoint) && !cuiWizard.config.mobileMode){
                                cuiWizard.selectors.$expandables.forEach((expandable,e) => {
                                    expandable.attr('transition-speed',300);
                                    expandable.addClass('mobile-element');
                                });
                                cuiWizard.config.mobileMode = true;
                            }
                            else if(cuiWizard.config.mobileStack && (cuiWizard.selectors.$window.width() > cuiWizard.config.mobileStackBreakingPoint) && cuiWizard.config.mobileMode){
                                cuiWizard.selectors.$expandables.forEach((expandable,e) => {
                                    expandable.attr('transition-speed',0);
                                    expandable.removeClass('mobile-element');
                                });
                                cuiWizard.config.mobileMode = false;
                            }
                        },200)();
                    },
                    scrollToStep:(newStep) => {
                        const firstExpandableTitle = angular.element(cuiWizard.selectors.$expandables[0].children()[0]);
                        const firstExpandableOffset = firstExpandableTitle.offset();
                        const titleHeight=firstExpandableTitle[0].scrollHeight;
                        cuiWizard.selectors.$body.animate({ scrollTop: firstExpandableOffset.top + (titleHeight * (newStep-1)) } , 300 , 'linear');
                    }
                },
                scope:{
                    currentStep : Number(elem[0].attributes.step.value),
                    wizardFinished : false,
                    next:(state) => { // state is optional
                        if(state) cuiWizard.scope.goToState(state);
                        else cuiWizard.update(cuiWizard.scope.currentStep + 1);
                    },
                    nextWithErrorChecking:(form,state) => {
                        if(cuiWizard.helpers.isFormValid(form)) cuiWizard.scope.next(state);
                    },
                    previous:(state) => {
                        if(state) cuiWizard.scope.goToSate(state);
                        else cuiWizard.update(cuiWizard.scope.currentStep-1);
                    },
                    goToStep:(newStep,state) => {
                        if(newStep===cuiWizard.scope.currentStep) return;
                        if(state) cuiWizard.scope.goToState(state);
                        cuiWizard.update(newStep);
                    },
                    goToState:(state) => {
                        $rootScope.$broadcast('stepChange',{ state, element:elem });
                    }
                },
                watchers:{
                    init:() => {
                        cuiWizard.watchers.windowResize();
                        cuiWizard.watchers.languageChange();
                    },
                    windowResize:() => {
                        cuiWizard.selectors.$window.bind('resize',cuiWizard.helpers.resizeHandler);
                    },
                    languageChange:() => {
                        scope.$on('languageChange',() => {
                            if(cuiWizard.helpers.thereIsRoomForIndicators() && cuiWizard.config.stepsCollapsed) {
                                cuiWizard.config.stepsCollapsed=false;
                                cuiWizard.selectors.$indicatorContainer.removeClass('small');
                            }
                            else if(!cuiWizard.helpers.thereIsRoomForIndicators() && !cuiWizard.config.stepsCollapsed) {
                                cuiWizard.config.stepsCollapsed=true;
                                cuiWizard.selectors.$indicatorContainer.addClass('small');
                            }
                            if(cuiWizard.config.bar) cuiWizard.reRender.bar(cuiWizard.scope.currentStep);
                        });
                    }
                },
                render:{
                    indicators:() => {
                        cuiWizard.selectors.$indicatorContainer.append(`<div class="cui-steps"></div>`);
                        cuiWizard.selectors.$stepIndicatorContainer=angular.element(cuiWizard.selectors.$indicatorContainer[0].querySelector('.cui-steps'));
                        cuiWizard.selectors.$steps.each((i,step) => {
                            const indicator = angular.element(cuiWizard.helpers.getIndicatorMarkup(i)),
                                compiledIndicator = $compile(indicator)(scope);
                            cuiWizard.selectors.$stepIndicatorContainer.append(compiledIndicator);
                        });
                        cuiWizard.selectors.$indicators = angular.element(cuiWizard.selectors.$stepIndicatorContainer[0].querySelectorAll('.step-indicator'));
                        cuiWizard.config.numberOfSteps = cuiWizard.selectors.$indicators.length;
                    },
                    bar:() => {
                      $timeout(() => {
                        cuiWizard.selectors.$indicatorContainer.append(`<div class="steps-bar"><div class="steps-bar-fill"></div></div>`);
                        cuiWizard.selectors.$bar = angular.element(cuiWizard.selectors.$indicatorContainer[0].querySelector('.steps-bar'));
                        cuiWizard.selectors.$barFill = angular.element(cuiWizard.selectors.$indicatorContainer[0].querySelector('.steps-bar-fill'));
                        cuiWizard.selectors.$bar[0].style.left = cuiWizard.selectors.$indicators[0].scrollWidth/2 + 'px'; // bar starts at the center point of the 1st inicator
                        cuiWizard.selectors.$bar[0].style.right = cuiWizard.selectors.$indicators[cuiWizard.config.numberOfSteps-1].scrollWidth/2 + 'px'; // ends at center of last indicator
                        if(cuiWizard.scope.currentStep===1) cuiWizard.selectors.$barFill[0].style.width = '0px';
                        else {
                            cuiWizard.selectors.$barFill[0].style.width=cuiWizard.selectors.$indicators[cuiWizard.scope.currentStep-1].offsetLeft - (cuiWizard.selectors.$indicators[0]. scrollWidth/2) + (cuiWizard.selectors.$indicators[cuiWizard.scope.currentStep-1].scrollWidth/2) + 'px';
                        }
                      });
                    },
                    steps:() => {
                        if(!cuiWizard.config.mobileStack) return;
                        cuiWizard.selectors.$expandables=[];
                        cuiWizard.selectors.$steps.each((i,step) => {
                            const stepInfo = cuiWizard.helpers.getStepInfo(i);
                            let expandableClass='';
                            if(cuiWizard.scope.currentStep===i+1) {
                                $(step).addClass('active');
                                expandableClass='expanded';
                            }
                            const expandable=$($compile( // compile a new expandable
                                `<cui-expandable class="cui-expandable cui-expandable--wizard ${expandableClass}" transition-speed="0">
                                    <cui-expandable-title class="cui-expandable__title cui-expandable__title--wizard">
                                        ${cuiWizard.helpers.getIndicatorMarkup(i)}
                                    </cui-expandable-title>
                                    <cui-expandable-body class="cui-expandable__body cui-expandable__body--wizard"></cui-expandable-body>
                                </cui-expandable>`
                            )(scope));
                            expandable.insertBefore(step);
                            $(step).detach().appendTo(expandable.children()[1]);
                            cuiWizard.selectors.$expandables.push($(step).parent().parent());
                        });
                    }
                },
                reRender:{
                    indicators:(newStep,oldStep) => { // newStep goes from 1 to numberOfSteps+1
                        cuiWizard.selectors.$indicators.each((i,indicator) => {
                            if((i+1) < newStep) $(indicator).addClass('visited');
                            else $(indicator).removeClass('visited');
                        });
                        cuiWizard.selectors.$indicators[oldStep-1].classList.remove('active');
                        cuiWizard.selectors.$indicators[newStep-1].classList.add('active');
                    },
                    steps:(newStep,oldStep) => {
                        cuiWizard.selectors.$expandables.forEach((expandable,i) => {
                            if((i+1) < newStep) expandable.addClass('visited');
                            else expandable.removeClass('visited');
                        });
                        cuiWizard.selectors.$steps[oldStep-1].classList.remove('active');
                        cuiWizard.selectors.$steps[newStep-1].classList.add('active');
                        cuiWizard.selectors.$expandables[oldStep-1].removeClass('expanded');
                        cuiWizard.selectors.$expandables[newStep-1].addClass('expanded');
                        cuiWizard.selectors.$expandables[oldStep-1][0].querySelector('.step-indicator').classList.remove('active');
                        cuiWizard.selectors.$expandables[newStep-1][0].querySelector('.step-indicator').classList.add('active');
                    },
                    indicatorContainer:() => {
                        if(cuiWizard.helpers.thereIsRoomForIndicators() && cuiWizard.config.stepsCollapsed) {
                            cuiWizard.config.stepsCollapsed = false;
                            cuiWizard.selectors.$indicatorContainer.removeClass('small');
                        }
                        else if(!cuiWizard.helpers.thereIsRoomForIndicators() && !cuiWizard.config.stepsCollapsed) {
                            cuiWizard.config.stepsCollapsed = true;
                            cuiWizard.selectors.$indicatorContainer.addClass('small');
                        }
                    },
                    bar:(newStep) => {
                        if(newStep===1) cuiWizard.selectors.$barFill[0].style.width='0px';
                        else {
                            cuiWizard.selectors.$barFill[0].style.width=cuiWizard.selectors.$indicators[newStep-1].offsetLeft - (cuiWizard.selectors.$indicators[0]. scrollWidth/2) + (cuiWizard.selectors.$indicators[newStep-1].scrollWidth/2) + 'px';
                        }
                    }
                },
                update:(newStep,oldStep) => {
                    if(cuiWizard.config.mobileMode) cuiWizard.helpers.scrollToStep(newStep);
                    cuiWizard.reRender.indicators(newStep,cuiWizard.scope.currentStep);
                    if(cuiWizard.config.mobileStack) cuiWizard.reRender.steps(newStep,cuiWizard.scope.currentStep);
                    if(cuiWizard.config.bar) cuiWizard.reRender.bar(newStep);
                    scope.currentStep=cuiWizard.scope.currentStep=newStep;
                    if(newStep===cuiWizard.config.numberOfSteps) scope.wizardFinished=cuiWizard.scope.wizardFinished=true;
                    attrs.$set('step',newStep);
                }
            };
            cuiWizard.initScope();
            cuiWizard.render.indicators();
            if (cuiWizard.config.bar) cuiWizard.render.bar();
            cuiWizard.render.steps();
            cuiWizard.watchers.init();
            cuiWizard.selectors.$window.resize();
        }
    };
}]);