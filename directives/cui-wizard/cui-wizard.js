angular.module('cui-ng')
.directive('cuiWizard',['$timeout','$compile','$window','$rootScope',function($timeout,$compile,$window,$rootScope){
    return{
        restrict: 'E',
        scope: true,
        link:function(scope,elem,attrs){
            //init
            var init = function(){
                    scope.invalidForm=[];
                    scope.bar=attrs.bar!==undefined;
                    scope.$steps=angular.element(elem[0].querySelectorAll('step'));
                    scope.numberOfSteps=scope.$steps.length;
                    scope.$indicatorContainer=angular.element(elem[0].querySelector('indicator-container'));
                    scope.$window=angular.element($window);
                    scope.currentStep=Number(elem[0].attributes.step.value);
                    scope.clickableIndicators=attrs.clickableIndicators;
                    scope.minimumPadding=attrs.minimumPadding;
                    scope.next=function(state){
                        if(state){
                            scope.goToState(state);
                        }
                        else{
                            scope.currentStep++;
                            updateIndicators();
                            if(scope.bar) updateBar();
                        }
                    };
                    scope.previous=function(state){
                        if(state){
                            scope.goToState(state);
                        }
                        else{
                            scope.currentStep--;
                            updateIndicators();
                            if(scope.bar) updateBar();
                        }
                    };
                    scope.goToStep=function(step){
                        scope.currentStep=step;
                        updateIndicators();
                        if(scope.bar) updateBar();
                    };
                    scope.goToState=function(state){
                        if(state==='default') return;
                        $rootScope.$broadcast('stepChange',{state:state});
                    };
                    scope.nextWithErrorChecking=function(form,nextState){
                        if(form.$invalid){
                            angular.forEach(form.$error, function (field) {
                                angular.forEach(field, function(errorField){
                                    errorField.$setTouched();
                                });
                            });
                            scope.invalidForm[scope.currentStep]=true;
                        }
                        else{
                            scope.invalidForm[scope.currentStep]=false;
                            if(nextState){
                                scope.goToState(nextState);
                            }
                            else{scope.next();}
                        }
                    };
                    if(isNaN(scope.currentStep)){
                        scope.currentStep=1;
                    }
                    else if(scope.currentStep>scope.numberOfSteps){
                        scope.currentStep=scope.numberOfSteps;
                    }
                    else if(scope.currentStep<1){
                        scope.currentStep=1;
                    }
                    createIndicators();
                    createBar();
                    updateIndicators();
                    if(scope.bar) updateBar();
                    makeSureTheresRoom();
                    watchForWindowResize();
                    listenForLanguageChange();
                    observeStepAttr();
                },
                // creates indicators inside of <indicator-container>
                createIndicators = function(){
                    var stepTitles=[],
                        stepStates=[],
                        stepIcons=[],
                        defaultString='default';
                    for(var i=0;i < scope.numberOfSteps;i++){
                        stepTitles[i]=scope.$steps[i].attributes.title.value;
                        if(scope.$steps[i].attributes.state){
                            stepStates[i]='' + scope.$steps[i].attributes.state.value + '';
                        }
                        if(scope.$steps[i].attributes.icon){
                            stepIcons[i]='' + scope.$steps[i].attributes.icon.value + '';
                        }
                    }
                    stepTitles.forEach(function(e,i){
                        var div,icons=[];
                        if(stepIcons[i]!==undefined){
                            if(stepIcons[i].indexOf('.')>-1){
                                icons[i]='<div class="icon-container"><img src="' +  stepIcons[i] + '" class="icon"/></div>';
                            }
                            else{
                                icons[i]='<div class="icon-container"><cui-icon cui-svg-icon="' + stepIcons[i] + '" class="icon"></cui-icon></div>';
                            }
                        }
                        if(scope.clickableIndicators!==undefined && icons[i]!==undefined){
                            div=angular.element('<span class="step-indicator" ng-click="goToStep(' + 
                                (i+1) + ');goToState(\'' + (stepStates[i] || defaultString) + '\')">' + 
                            stepTitles[i] + icons[i] + '</span>');
                            div[0].style.cursor='pointer';
                        }
                        else if(scope.clickableIndicators!==undefined && !icons[i]){
                            div=angular.element('<span class="step-indicator" ng-click="goToStep(' + 
                                (i+1) + ');goToState(\'' + (stepStates[i] || defaultString) + '\')">' + 
                            stepTitles[i] + '</span>');
                            div[0].style.cursor='pointer';
                        }
                        else{
                            div=angular.element('<span class="step-indicator">' + stepTitles[i] + 
                            (icons[i]? (icons[i]) : ('')) +
                            '</span>');
                        }
                        var compiled=$compile(div)(scope);
                        angular.element(scope.$indicatorContainer).append(compiled);
                    });
                    scope.$indicators=angular.element(elem[0].querySelectorAll('.step-indicator'));
                },
                createBar = function(){
                    //create a bar
                    if(scope.bar){
                        angular.element(scope.$indicatorContainer).append('<div class="steps-bar"></div>');
                        scope.$bar=$('.steps-bar');
                        scope.$bar[0].innerHTML='<div class="steps-bar-fill"></div>';
                        scope.$barFill=$('.steps-bar-fill');
                    } 
                },
                // updates the current active indicator. Removes active class from other elements.
                updateIndicators = function(){
                    $timeout(function(){
                        var currentStep=scope.currentStep;
                        for(var i=0; i<scope.$steps.length ; i++){
                            scope.$steps[i].classList.remove('active');
                            scope.$indicators[i].classList.remove('active');
                            if(i<(currentStep-1)){
                                scope.$indicators[i].classList.add('visited');
                            }
                            else{
                                scope.$indicators[i].classList.remove('visited');
                            }
                        }
                        console.log(scope.$steps);
                        scope.$steps[currentStep-1].classList.add('active');
                        scope.$indicators[currentStep-1].classList.add('active');
                    });
                },
                updateBar = function(){
                       $timeout(function(){
                            var currentStep=scope.currentStep;
                            scope.$bar[0].style.left=scope.$indicators[0].scrollWidth/2+'px';
                            scope.$bar[0].style.right=scope.$indicators[scope.$indicators.length-1].scrollWidth/2+'px';
                            if(currentStep==='1'){
                                scope.$barFill[0].style.width='0px';
                            }
                            else{
                                scope.$barFill[0].style.width=(scope.$indicators[currentStep-1].offsetLeft+
                                (scope.$indicators[scope.$indicators.length-1].scrollWidth/2)-(scope.$indicators[0].scrollWidth/2))+'px';
                            }
                        });
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
                    for(var i=0 ; i<scope.numberOfSteps ; i++){
                        totalWidth += scope.$indicators[i].scrollWidth;
                    }
                    //adds the minimum padding between the steps.
                    return totalWidth+((Number(scope.minimumPadding) || 0)*(scope.numberOfSteps-1));
                },
                getIndicatorContainerWidth = function(){
                    return scope.$indicatorContainer[0].clientWidth;
                },
                onlyShowCurrentIndicator = function(){
                    scope.$indicatorContainer[0].classList.add('small');
                },
                showAllIndicators = function(){
                    scope.$indicatorContainer[0].classList.remove('small');
                },
                //makes sure there's still room for the step indicators, has a debounce on it so it
                //doesn't fire too often.
                makeSureTheresRoom = debounce(function(){
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
                    scope.$window.bind('resize',function(){
                        makeSureTheresRoom();
                    });
                },
                listenForLanguageChange = function(){
                    scope.$on('languageChange',function(){
                        showAllIndicators();
                        makeSureTheresRoom();
                    });
                },
                observeStepAttr = function(){
                    attrs.$observe('step',function(newStep){
                        if(isNaN(newStep)){
                            scope.currentStep=1;
                        }
                        else if(newStep>scope.numberOfSteps){
                            scope.currentStep=scope.numberOfSteps;
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