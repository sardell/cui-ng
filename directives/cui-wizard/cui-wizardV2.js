angular.module('cui-ng')
.directive('cuiWizard',['$timeout','$compile','$window','$rootScope','$document',function($timeout,$compile,$window,$rootScope,$document){
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
                    }.bind(self));
                },
                config:{
                    mobileStack:attrs.mobileStack!==undefined,
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
                    $snap:angular.element(document.querySelectorAll('snap-content')),
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
                        form.$error.forEach(function(fields){
                            fields.forEach(function(errorField){
                                errorField.$setTouched();
                            });
                        });
                    },
                    getStepInfo:function(step){ // step goes from 0 to numberOfSteps
                        var $step=self.selectors.$steps[step];
                        return {
                            title: $step.attributes.title.value,
                            icon: $step.attributes.icon ? $step.attributes.icon.value : false,
                            state: $step.attributes.state ? $step.attributes.state.value: false
                        }
                    },
                    getIconMarkup:function(icon){
                        if(!icon) return '';
                        if(icon.indexOf('.')){ // if it's not an svg
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
                                    '<cui-icon cui-svg-icon="',icon,'"></cui-icon>',
                                '</div>',
                            '</div>');
                    },
                    getNgClickForIndicator:function(stepNumber,stepState){ // stepNUmber from 0 to numberOfSteps
                        if(!self.config.clickableIndicators) return '';
                        else return String.prototype.concat('ng-click="goToStep(', stepNumber+1 , (stepState? ','+ stepState : '') , ')" ');
                    },
                    getIndicatorMarkup:function(stepNumber){ // stepNUmber from 0 to numberOfSteps
                        var step = self.helpers.getStepInfo(stepNumber);
                        return String.prototype.concat('<span class="step-indicator" ',self.helpers.getNgClickForIndicator(stepNumber,step.state),
                            '>',step.title,self.helpers.getIconMarkup(step.icon),'</span>')
                    },
                    getNgClickForExpandable:function(stepNumber,stepState){
                        if(!self.config.clickableIndicators) return '';
                        else return String.prototype.concat('ng-click="goToStep(', stepNumber+1, (stepState? ','+ stepState : '') , ')" ');
                    },
                    getIndicatorsWidth:function(){
                        var totalWidth=0;
                        self.selectors.$indicators.forEach(function(indicator){
                            totalWidth += indicator.scrollWidth;
                        });
                        return totalWidth;
                    },
                    thereIsRoomForIndicators:function(){
                        if((self.helpers.getIndicatorsWidth() + (self.config.minimumPadding * ( self.config.numberOfSteps-1 ))) <
                            self.selectors.$indicatorContainer.scrollWidth) return true;
                        return false;
                    }
                },
                scope:{
                    currentStep:Number(elem[0].attributes.step.value),
                    wizardFinished:false,
                    next:function(state){ // state is optional.
                        if(state) self.scope.goToState(state);
                        else self.update(self.scope.currentStep+1); // TODO Change self to 'update'
                    },
                    nextWithErrorChecking:function(form,state){
                        if(self.helpers.isFormValid(form)) self.scope.next();
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
                render:{
                    indicators:function(){
                        self.selectors.$steps.each(function(i,step){
                            var indicator = angular.element(self.helpers.getIndicatorMarkup(i)),
                                compiledIndicator = $compile(indicator)(scope);
                            self.selectors.$indicatorContainer.append(compiledIndicator);
                        }.bind(self));
                        self.selectors.$indicators=angular.element(self.selectors.$indicatorContainer[0].querySelectorAll('.step-indicator'));
                        self.config.numberOfSteps=self.selectors.$indicators.length;
                    },
                    bar:function(){
                        self.selectors.$indicatorContainer.append('<div class="steps-bar"><div class="steps-bar-fill"></div></div>');
                        self.selectors.$bar=angular.element(self.selectors.$indicatorContainer[0].querySelector('.steps-bar'));
                        self.selectors.$barFill=angular.element(self.selectors.$indicatorContainer[0].querySelector('.steps-bar-fill'));
                        self.selectors.$bar[0].style.left=self.selectors.$indicators[0].scrollWidth/2+'px'; // bar starts at the center point of the 1st inicator
                        self.selectors.$bar[0].style.right=self.selectors.$indicators[self.config.numberOfSteps-1].scrollWidth/2+'px'; // ends at center of last indicator
                        if(self.scope.currentStep===1) self.selectors.$barFill[0].style.width='0px';
                        else {
                            self.selectors.$barFill[0].style.width=self.selectors.$indicators[self.scope.currentStep-1].offsetLeft - (self.selectors.$indicators[0]. scrollWidth/2) + (self.selectors.$indicators[self.scope.currentStep-1].scrollWidth/2) + 'px';
                        }
                    },
                    steps:function(){
                        if(!self.config.mobileStack) return;
                        self.selectors.$mobileExpandables=[];
                        self.selectors.$steps.each(function(i,step){
                            var stepInfo=self.helpers.getStepInfo(i);
                            $(String.prototype.concat(
                                '<cui-expandable-title class="cui-expandable__title cui-expandable__title--wizard"',
                                    self.helpers.getNgClickForExpandable(i,stepInfo.state),
                                '>',stepInfo.title,'</cui-expandable-title>'
                            )).insertBefore($(this).wrapInner('<cui-expandable-body class="cui-expandable__body cui-expandable__body--wizard"></cui-expandable-body>'));

                            $(this).add($(this)[0].previousSibling).wrapAll('<cui-expandable class="cui-expandable cui-expandable--wizard"></cui-expandable>');
                            // $compile($(this))(scope); // TODO : is self really needed?
                            self.selectors.$mobileExpandables.push($(this).parent());
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
                        self.selectors.$mobileExpandables.forEach(function(expandable,i){
                            if((i+1) < newStep) expandable.classList.add('visited');
                            else expandable.classList.remove('visited');
                        });
                        self.selectors.$mobileExpandables[oldStep-1].classList.remove('expanded');
                        self.selectors.$mobileExpandables[newStep-1].classList.add('expanded');
                    },
                    indicatorContainer:function(){
                        if(self.helpers.thereIsRoomForIndicators()) self.selectors.$indicatorContainer.classList.remove('small');
                        else self.selectors.$indicatorContainer.classList.add('small');
                    },
                    bar:function(newStep){
                        if(newStep===1) self.selectors.$barFill[0].style.width='0px';
                        else {
                            self.selectors.$barFill[0].style.width=self.selectors.$indicators[newStep-1].offsetLeft - (self.selectors.$indicators[0]. scrollWidth/2) + (self.selectors.$indicators[newStep-1].scrollWidth/2) + 'px';
                        }
                    }
                },
                update:function(newStep){
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
            cuiWizard.render.bar();
            if( cuiWizard.config.mobileStack ) cuiWizard.render.steps(); // if mobileStack make these expandables

        }
    };
}]);