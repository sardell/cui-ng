angular.module('cui-ng')
.directive('cuiWizard',['$timeout','$compile','$window','$rootScope','$document',
    function($timeout,$compile,$window,$rootScope,$document){
    return{
        restrict: 'E',
        scope: true,
        link:function(scope,elem,attrs){
            var numberOfSteps,invalidForm,mobileStack,$steps,bar,$indicatorContainer,clickableIndicators,minimumPadding,
                snap,$body,$mobileSteps,$cuiExpandableTitle;

            var init = function(){
                invalidForm=[];
                mobileStack=attrs.mobileStack!==undefined;
                $steps=angular.element(elem[0].querySelectorAll('step'));
                numberOfSteps=$steps.length;
                bar=(attrs.bar!==undefined && numberOfSteps!==1);
                $indicatorContainer=angular.element(elem[0].querySelector('indicator-container'));
                $window=angular.element($window);
                scope.currentStep=Number(elem[0].attributes.step.value);
                clickableIndicators=attrs.clickableIndicators;
                minimumPadding=attrs.minimumPadding;
                snap=angular.element(document.querySelector('snap-content'));
                $body=angular.element('body');
                scope.wizardFinished=false;
                scope.next=function(state){
                    if(state) scope.goToState(state);
                    else {
                        scope.currentStep++;
                        updateIndicators();
                        updateBar();
                        updateStep();
                    }
                    if(!scope.wizardFinished && scope.currentStep===numberOfSteps) scope.wizardFinished=true;
                    calculateWhereToScroll();
                };
                scope.previous=function(state){
                    if(state){
                        scope.goToState(state);
                    }
                    else{
                        scope.currentStep--;
                        updateIndicators();
                        updateBar();
                        updateStep();
                    }
                    calculateWhereToScroll();
                };
                scope.goToStep=function(step){
                    if(step===scope.currentStep) return;
                    scope.currentStep=step;
                    updateIndicators();
                    updateBar();
                    updateStep();
                    calculateWhereToScroll();
                    if(!scope.wizardFinished && scope.currentStep===numberOfSteps) scope.wizardFinished=true;
                };
                scope.goToState=function(state){
                    if(state==='default') return;
                    $rootScope.$broadcast('stepChange',{state:state});
                };
                scope.nextWithErrorChecking=function(form,nextState){
                    if(!form.$valid){
                        angular.forEach(form.$error, function (field) {
                            angular.forEach(field, function(errorField){
                                errorField.$setTouched();
                            });
                        });
                        invalidForm[scope.currentStep]=true;
                    }
                    else{
                        invalidForm[scope.currentStep]=false;
                        calculateWhereToScroll();
                        if(nextState){
                            scope.goToState(nextState);
                        }
                        else{scope.next();}
                    }
                };
                if(isNaN(scope.currentStep)) scope.currentStep=1; // check if step is not a number, only runs once
                else if(scope.currentStep>numberOfSteps) scope.currentStep=numberOfSteps;
                else if(scope.currentStep<1) scope.currentStep=1;
                createIndicators();
                createBar();
                if(mobileStack) createMobileStack();
                if(bar) updateBar();
                updateIndicators();
                makeSureTheresRoom();
                watchForWindowResize();
                listenForLanguageChange();
                observeStepAttr();
            },
            // creates indicators inside of <indicator-container>
            createIndicators = function(){
                var stepTitles=[],
                    stepIcons=[];
                scope.defaultString='default';
                scope.stepStates=[];
                for(var i=0;i < numberOfSteps;i++){
                    stepTitles[i]=$steps[i].attributes.title.value;
                    if($steps[i].attributes.state){
                        scope.stepStates[i]='' + $steps[i].attributes.state.value + '';
                    }
                    if($steps[i].attributes.icon){
                        stepIcons[i]='' + $steps[i].attributes.icon.value + '';
                    }
                }
                scope.icons=[];
                stepTitles.forEach(function(e,i){
                    var div;
                    if(stepIcons[i]!==undefined){
                        if(stepIcons[i].indexOf('.')>-1){
                            scope.icons[i]='<div class="icon-container"><div class="icon"><img src="' +  stepIcons[i] + '" class="cui-icon-rotate"/></div></div>';
                        }
                        else{
                            scope.icons[i]='<div class="icon-container"><div class="icon"><cui-icon cui-svg-icon="' + stepIcons[i] + '" svg-class="cui-icon-rotate"></cui-icon></div></div>'; // adding svg-class for now until new wizard is out.
                        }
                    }
                    if(clickableIndicators!==undefined && scope.icons[i]!==undefined){
                        div=angular.element('<span class="step-indicator" id="cui-wizard-ref-pointer-'+ i + '" ng-click="goToStep(' +
                            (i+1) + ');goToState(\'' + (scope.stepStates[i] || scope.defaultString) + '\')">' +
                        stepTitles[i] + scope.icons[i] + '</span>');
                        div[0].style.cursor='pointer';
                    }
                    else if(clickableIndicators!==undefined && !scope.icons[i]){
                        div=angular.element('<span class="step-indicator" id="cui-wizard-ref-pointer-'+ i + '" ng-click="goToStep(' +
                            (i+1) + ');goToState(\'' + (scope.stepStates[i] || scope.defaultString) + '\')">' +
                        stepTitles[i] + '</span>');
                        div[0].style.cursor='pointer';
                    }
                    else{
                        div=angular.element('<span class="step-indicator" id="cui-wizard-ref-pointer-'+ i + '">' + stepTitles[i] +
                        (scope.icons[i]? (scope.icons[i]) : ('')) +
                        '</span>');
                    }
                    var compiled=$compile(div)(scope);
                    angular.element($indicatorContainer).append(compiled);
                });
                scope.$indicators=angular.element(elem[0].querySelectorAll('.step-indicator'));
            },
            createBar = function(){
                //create a bar
                if(bar){
                    angular.element($indicatorContainer).append('<div class="steps-bar"></div>');
                    scope.$bar=$('.steps-bar');
                    scope.$bar[0].innerHTML='<div class="steps-bar-fill"></div>';
                    scope.$barFill=$('.steps-bar-fill');
                }
            },
            // updates the current active indicator. Removes active class from other elements.
            updateIndicators = function(){
                $timeout(function(){
                    for(var i=0; i<$steps.length ; i++){
                        $steps[i].classList.remove('active');
                        scope.$indicators[i].classList.remove('active');
                        if(mobileStack){ $mobileSteps[i].classList.remove('expanded'); }
                        if(i<(scope.currentStep-1)){
                            scope.$indicators[i].classList.add('visited');
                            if(mobileStack){ $mobileSteps[i].classList.add('visited'); }
                        }
                        else{
                            scope.$indicators[i].classList.remove('visited');
                            if(mobileStack){ $mobileSteps[i].classList.remove('visited'); }
                        }
                    }
                    $steps[scope.currentStep-1].classList.add('active');
                    scope.$indicators[scope.currentStep-1].classList.add('active');
                    if(mobileStack){ $mobileSteps[scope.currentStep-1].classList.add('expanded'); }
                });
            },
            updateBar = function(){
                if(!bar) return;
                $timeout(function(){
                    scope.$bar[0].style.left=scope.$indicators[0].scrollWidth/2+'px';
                    scope.$bar[0].style.right=scope.$indicators[scope.$indicators.length-1].scrollWidth/2+'px';
                    if(scope.currentStep==1){
                        scope.$barFill[0].style.width='0px';
                    }
                    else{
                        scope.$barFill[0].style.width=scope.$indicators[scope.currentStep-1].offsetLeft-(scope.$indicators[0].scrollWidth/2) +
                        (scope.$indicators[scope.currentStep-1].scrollWidth/2)+'px';
                    }
                });
            },
            createMobileStack = function(){
                angular.forEach($steps,function(step,i){
                    var ngIncludeSrc;
                    if(step.innerHTML.indexOf('<!-- ngInclude:')>-1){
                      ngIncludeSrc=step.innerHTML.split('<!-- ngInclude:')[1].split(' -->')[0];
                    }
                    step.classList.add('desktop-element');
                    var newElement=$compile(
                        '<cui-expandable class="cui-expandable mobile-element">' +
                        '<cui-expandable-title class="cui-expandable__title"' +
                        (clickableIndicators!==undefined? 'ng-click="goToStep(' +
                        (i+1) + ');goToState(\'' + (scope.stepStates[i] || scope.defaultString) + '\')">' : '>') +
                        (scope.icons[i]? scope.icons[i] : '') + '<span>' + step.title + '</span></cui-expandable-title>' +
                        '<cui-expandable-body class="cui-expandable__body">' +
                        (ngIncludeSrc? '<div ng-include="' + ngIncludeSrc + '"></div>' : step.innerHTML) + '</cui-expandable-body>' +
                        '</cui-expandable>')(scope);
                    angular.element(elem[0]).append(newElement);
                });
                $mobileSteps=angular.element(elem[0].querySelectorAll('cui-expandable.mobile-element'));
            },
            debounce = function(func, wait, immediate) {
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
            getIndicatorsWidth = function(){
                var totalWidth=0;
                for(var i=0 ; i<numberOfSteps ; i++){
                    totalWidth += scope.$indicators[i].scrollWidth;
                }
                //adds the minimum padding between the steps.
                return totalWidth+((Number(minimumPadding) || 0)*(numberOfSteps-1));
            },
            getIndicatorContainerWidth = function(){
                return $indicatorContainer[0].clientWidth;
            },
            onlyShowCurrentIndicator = function(){
                $indicatorContainer[0].classList.add('small');
                updateBar();
            },
            showAllIndicators = function(){
                $indicatorContainer[0].classList.remove('small');
                updateBar();
            },
            //makes sure there's still room for the step indicators, has a debounce on it so it
            //doesn't fire too often.
            makeSureTheresRoom = debounce(function(){
                updateBar();
                var indicatorsWidth=getIndicatorsWidth();
                var indicatorContainerWidth=getIndicatorContainerWidth();
                if((indicatorContainerWidth < indicatorsWidth) &&
                        (indicatorContainerWidth < (Math.max((scope.indicatorsWidth || 0),indicatorsWidth)))){
                    scope.indicatorsWidth=indicatorsWidth;
                    onlyShowCurrentIndicator();
                }
                else if(indicatorContainerWidth > scope.indicatorsWidth){
                    showAllIndicators();
                }
            }, 40),
            watchForWindowResize = function(){
                $window.bind('resize',function(){
                    makeSureTheresRoom();
                });
            },
            listenForLanguageChange = function(){
                scope.$on('languageChange',function(){
                    showAllIndicators();
                    makeSureTheresRoom();
                });
            },
            calculateWhereToScroll = function(){
                var wizardOffset;
                $cuiExpandableTitle=angular.element(elem[0].querySelector('cui-expandable.mobile-element>cui-expandable-title'))
                if($cuiExpandableTitle.length!==0) {
                    var titleHeight=$cuiExpandableTitle[0].clientHeight;
                }
                else var titleHeight=0;
                if(snap.length!==0){
                    var snapOffset=snap.scrollTop();
                    wizardOffset=elem[0].getBoundingClientRect().top;
                    scrollTo(snapOffset+wizardOffset+(titleHeight*(scope.currentStep-1)));
                }
                else{
                    var bodyOffset=$body.scrollTop();
                    wizardOffset=elem[0].getBoundingClientRect().top;
                    scrollTo(bodyOffset+wizardOffset+(titleHeight*(scope.currentStep-1)));
                }
            },
            scrollTo = function(position){
                if(snap.length!==0) snap.animate({scrollTop:position},300,'linear');
                else $body.animate({scrollTop:position},300,'linear');
            },
            updateStep = function(){
                attrs.$set('step',scope.currentStep);
            },
            observeStepAttr = function(){
                attrs.$observe('step',function(newStep){
                    if(isNaN(newStep)){
                        scope.currentStep=1;
                    }
                    else if(newStep>numberOfSteps){
                        scope.currentStep=numberOfSteps;
                    }
                    else if(newStep<1){
                        scope.currentStep=1;
                    }
                    else{
                        scope.currentStep=newStep;
                    }
                    updateIndicators();
                });
            };
            init();
        }
    };
}]);