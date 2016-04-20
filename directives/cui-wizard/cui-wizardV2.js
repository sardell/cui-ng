angular.module('cui-ng')
.directive('cuiWizard',['$timeout','$compile','$window','$rootScope',function($timeout,$compile,$window,$rootScope){
    return{
        restrict: 'E',
        scope: true,
        link:function(scope,elem,attrs){
            var self;
            var cuiWizard={
                initScope:function(){
                    self=this;
                    Object.keys(self.scope).forEach(function(property){
                        scope[property]=self.scope[property];
                    });
                },
                config:{
                    mobileStack:attrs.mobileStack!==undefined,
                    mobileStackBreakingPoint:parseInt(attrs.mobileStack),
                    clickableIndicators:attrs.clickableIndicators!==undefined,
                    minimumPadding:attrs.minimumPadding || 0,
                    bar:attrs.bar!==undefined
                },
                selectors:{
                    $wizard:angular.element(elem[0]),
                    $steps:angular.element(elem[0].querySelectorAll('step')),
                    $bar:function(){ return (attrs.bar!==undefined && self.selectors.$steps.length > 0) },
                    $indicatorContainer:angular.element(elem[0].querySelectorAll('indicator-container')),
                    $window:angular.element($window),
                    $body:angular.element('body')
                },
                helpers:{
                    isFormValid:function(form){
                        if(!form.$valid){
                            self.helpers.setErrorFieldsToTouched(form);
                            return false;
                        }
                        return true;
                    },
                    setErrorFieldsToTouched:function(form){
                        angular.forEach(form.$error, function (field) {
                            angular.forEach(field, function(errorField){
                                errorField.$setTouched();
                            });
                        });
                    },
                    getStepInfo:function(step){ // step goes from 0 to numberOfSteps
                        var $step = self.selectors.$steps[step];
                        return {
                            stepTitle: $step.attributes['step-title'].value,
                            icon: $step.attributes.icon ? $step.attributes.icon.value : false,
                            state: $step.attributes.state ? $step.attributes.state.value: false
                        };
                    },
                    getIconMarkup:function(icon){
                        if(!icon) return '';
                        if(icon.indexOf('.')>-1){ // if it's not an svg
                            return String.prototype.concat(
                                '<div class="icon-container">',
                                    '<div class="icon">',
                                        '<img src="',icon,'" class="cui-icon-rotate"/>',
                                    '</div>',
                                '</div>');
                        }
                        else return String.prototype.concat(
                            '<div class="icon-container">',
                                '<div class="icon">',
                                    '<cui-icon cui-svg-icon="',icon,'" svg-class="icon-svg"></cui-icon>',
                                '</div>',
                            '</div>');
                    },
                    getNgClickForIndicator:function(stepNumber,stepState){ // stepNUmber from 0 to numberOfSteps
                        if(!self.config.clickableIndicators) return '';
                        else return String.prototype.concat('ng-click="goToStep(', stepNumber+1 , (stepState? ','+ stepState : '') , ')" ');
                    },
                    getIndicatorMarkup:function(stepNumber){ // stepNUmber from 0 to numberOfSteps
                        var step = self.helpers.getStepInfo(stepNumber),
                            indicatorClass;
                        stepNumber+1===self.scope.currentStep ? indicatorClass='active' : stepNumber+1 < self.scope.currentStep ? indicatorClass='visited' : indicatorClass='';
                        return String.prototype.concat(
                            '<span class="step-indicator ', indicatorClass,'"',self.helpers.getNgClickForIndicator(stepNumber,step.state),'>',
                                '<span class="step-indicator__title">',step.stepTitle,'</span>',self.helpers.getIconMarkup(step.icon),
                            '</span>');
                    },
                    getIndicatorsWidth:function(){
                        var totalWidth=0;
                        self.selectors.$indicators.each(function(i,indicator){
                            totalWidth += $(this).width();
                        });
                        return totalWidth;
                    },
                    thereIsRoomForIndicators:function(){
                        if((self.helpers.getIndicatorsWidth() + (self.config.minimumPadding * ( self.config.numberOfSteps-1 ))) <
                            self.selectors.$indicatorContainer.width()) return true;
                        return false;
                    },
                    debounce:function(func, wait, immediate){
                        var timeout;
                        return function() {
                            var context = this, args = arguments;
                            var later = function() {
                                timeout = null;
                                if (!immediate) {func.apply(context, args);}
                            };
                            var callNow = immediate && !timeout;
                            clearTimeout(timeout);
                            timeout = setTimeout(later, wait);
                            if (callNow) func.apply(context, args);
                        };
                    },
                    resizeHandler:function(){
                        self.helpers.debounce(function(){
                            if(self.config.bar) self.reRender.bar(self.scope.currentStep);
                            if(self.helpers.thereIsRoomForIndicators() && self.config.stepsCollapsed) {
                                self.config.stepsCollapsed=false;
                                self.selectors.$indicatorContainer.removeClass('small');
                            }
                            else if(!self.helpers.thereIsRoomForIndicators() && !self.config.stepsCollapsed) {
                                self.config.stepsCollapsed=true;
                                self.selectors.$indicatorContainer.addClass('small');
                            }
                            if(self.config.mobileStack && (self.selectors.$window.width()<=self.config.mobileStackBreakingPoint) && !self.config.mobileMode){
                                self.selectors.$expandables.forEach(function(expandable,e){
                                    expandable.attr('transition-speed',300);
                                    expandable.addClass('mobile-element');
                                });
                                self.config.mobileMode=true;
                            }
                            else if(self.config.mobileStack && (self.selectors.$window.width()>self.config.mobileStackBreakingPoint) && self.config.mobileMode){
                                self.selectors.$expandables.forEach(function(expandable,e){
                                    expandable.attr('transition-speed',0);
                                    expandable.removeClass('mobile-element');
                                });
                                self.config.mobileMode=false;
                            }
                        },200)();
                    },
                    scrollToStep:function(newStep){
                        var firstExpandableTitle=angular.element(self.selectors.$expandables[0].children()[0]);
                        var firstExpandableOffset=firstExpandableTitle.offset();
                        var titleHeight=firstExpandableTitle[0].scrollHeight;
                        self.selectors.$body.animate({ scrollTop: firstExpandableOffset.top + (titleHeight*(newStep-1)) } ,300,'linear');
                    }
                },
                scope:{
                    currentStep:Number(elem[0].attributes.step.value),
                    wizardFinished:false,
                    next:function(state){ // state is optional
                        if(state) self.scope.goToState(state);
                        else self.update(self.scope.currentStep+1);
                    },
                    nextWithErrorChecking:function(form,state){
                        if(self.helpers.isFormValid(form)) self.scope.next(state);
                    },
                    previous:function(state){
                        if(state) self.scope.goToSate(state);
                        else self.update(self.scope.currentStep-1);
                    },
                    goToStep:function(newStep,state){
                        if(newStep===self.scope.currentStep) return;
                        if(state) self.scope.goToState(state);
                        self.update(newStep);
                    },
                    goToState:function(state){
                        $rootScope.$broadcast('stepChange',{ state:state,element:elem });
                    }
                },
                watchers:{
                    init:function(){
                        this.windowResize();
                        this.languageChange();
                    },
                    windowResize:function(){
                        self.selectors.$window.bind('resize',self.helpers.resizeHandler);
                    },
                    languageChange:function(){
                        scope.$on('languageChange',function(){
                            if(self.helpers.thereIsRoomForIndicators() && self.config.stepsCollapsed) {
                                self.config.stepsCollapsed=false;
                                self.selectors.$indicatorContainer.removeClass('small');
                            }
                            else if(!self.helpers.thereIsRoomForIndicators() && !self.config.stepsCollapsed) {
                                self.config.stepsCollapsed=true;
                                self.selectors.$indicatorContainer.addClass('small');
                            }
                            if(self.config.bar) self.reRender.bar(self.scope.currentStep);
                        })
                    }
                },
                render:{
                    indicators:function(){
                        self.selectors.$indicatorContainer.append('<div class="cui-steps"></div>');
                        self.selectors.$stepIndicatorContainer=angular.element(self.selectors.$indicatorContainer[0].querySelector('.cui-steps'));
                        self.selectors.$steps.each(function(i,step){
                            var indicator = angular.element(self.helpers.getIndicatorMarkup(i)),
                                compiledIndicator = $compile(indicator)(scope);
                            self.selectors.$stepIndicatorContainer.append(compiledIndicator);
                        });
                        self.selectors.$indicators=angular.element(self.selectors.$stepIndicatorContainer[0].querySelectorAll('.step-indicator'));
                        self.config.numberOfSteps=self.selectors.$indicators.length;
                    },
                    bar:function(){
                      $timeout(function(){
                        self.selectors.$indicatorContainer.append('<div class="steps-bar"><div class="steps-bar-fill"></div></div>');
                        self.selectors.$bar=angular.element(self.selectors.$indicatorContainer[0].querySelector('.steps-bar'));
                        self.selectors.$barFill=angular.element(self.selectors.$indicatorContainer[0].querySelector('.steps-bar-fill'));
                        self.selectors.$bar[0].style.left=self.selectors.$indicators[0].scrollWidth/2+'px'; // bar starts at the center point of the 1st inicator
                        self.selectors.$bar[0].style.right=self.selectors.$indicators[self.config.numberOfSteps-1].scrollWidth/2+'px'; // ends at center of last indicator
                        if(self.scope.currentStep===1) self.selectors.$barFill[0].style.width='0px';
                        else {
                            self.selectors.$barFill[0].style.width=self.selectors.$indicators[self.scope.currentStep-1].offsetLeft - (self.selectors.$indicators[0]. scrollWidth/2) + (self.selectors.$indicators[self.scope.currentStep-1].scrollWidth/2) + 'px';
                        }
                      })
                    },
                    steps:function(){
                        if(!self.config.mobileStack) return;
                        self.selectors.$expandables=[];
                        self.selectors.$steps.each(function(i,step){
                            var stepInfo=self.helpers.getStepInfo(i);
                            var expandableClass='';
                            if(self.scope.currentStep===i+1) {
                                $(this).addClass('active');
                                expandableClass=' expanded';
                            }
                            var expandable=$($compile( // compile a new expandable
                                String.prototype.concat(
                                    '<cui-expandable class="cui-expandable cui-expandable--wizard',expandableClass,'" transition-speed="0">',
                                        '<cui-expandable-title class="cui-expandable__title cui-expandable__title--wizard">',
                                        self.helpers.getIndicatorMarkup(i),'</cui-expandable-title>',
                                        '<cui-expandable-body class="cui-expandable__body cui-expandable__body--wizard"></cui-expandable-body>',
                                    '</cui-expandable>'
                                )
                            )(scope));
                            expandable.insertBefore($(this));
                            $(this).detach().appendTo(expandable.children()[1]);
                            self.selectors.$expandables.push($(this).parent().parent());
                        });
                    }
                },
                reRender:{
                    indicators:function(newStep,oldStep){ // newStep goes from 1 to numberOfSteps+1
                        self.selectors.$indicators.each(function(i,indicator){
                            if((i+1) < newStep) $(this).addClass('visited');
                            else $(this).removeClass('visited');
                        });
                        self.selectors.$indicators[oldStep-1].classList.remove('active');
                        self.selectors.$indicators[newStep-1].classList.add('active');
                    },
                    steps:function(newStep,oldStep){
                        self.selectors.$expandables.forEach(function(expandable,i){
                            if((i+1) < newStep) expandable.addClass('visited');
                            else expandable.removeClass('visited');
                        });
                        self.selectors.$steps[oldStep-1].classList.remove('active');
                        self.selectors.$steps[newStep-1].classList.add('active');
                        self.selectors.$expandables[oldStep-1].removeClass('expanded');
                        self.selectors.$expandables[newStep-1].addClass('expanded');
                    },
                    indicatorContainer:function(){
                        if(self.helpers.thereIsRoomForIndicators() && self.config.stepsCollapsed) {
                            self.config.stepsCollapsed=false;
                            self.selectors.$indicatorContainer.addClass('small');
                        }
                        else if(!self.helpers.thereIsRoomForIndicators() && !self.config.stepsCollapsed) {
                            self.config.stepsCollapsed=true;
                            self.selectors.$indicatorContainer.addClass('small');
                        }
                    },
                    bar:function(newStep){
                        if(newStep===1) self.selectors.$barFill[0].style.width='0px';
                        else {
                            self.selectors.$barFill[0].style.width=self.selectors.$indicators[newStep-1].offsetLeft - (self.selectors.$indicators[0]. scrollWidth/2) + (self.selectors.$indicators[newStep-1].scrollWidth/2) + 'px';
                        }
                    }
                },
                update:function(newStep,oldStep){
                    if(self.config.mobileMode) self.helpers.scrollToStep(newStep);
                    self.reRender.indicators(newStep,self.scope.currentStep);
                    if(self.config.mobileStack) self.reRender.steps(newStep,self.scope.currentStep);
                    if(self.config.bar) self.reRender.bar(newStep);
                    scope.currentStep=self.scope.currentStep=newStep;
                    if(newStep===self.config.numberOfSteps) scope.wizardFinished=self.scope.wizardFinished=true;
                    attrs.$set('step',newStep);
                }
            };
            cuiWizard.initScope();
            cuiWizard.render.indicators();
            if (self.config.bar) { cuiWizard.render.bar(); }
            cuiWizard.render.steps();
            cuiWizard.watchers.init();
            cuiWizard.selectors.$window.resize();
        }
    };
}]);