angular.module('cui-ng')
.directive('cuiWizard',['$timeout','$compile','$window','$rootScope',function($timeout,$compile,$window,$rootScope){
    return{
        restrict: 'E',
        scope: true,
        link:function(scope,elem,attrs){
            //init
            var init = function(){
         
                    scope.invalidForm=[];
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
                        }
                    };
                    scope.previous=function(state){
                        if(state){
                            scope.goToState(state);
                        }
                        else{
                            scope.currentStep--;
                            updateIndicators(); 
                        }
                    };
                    scope.goToStep=function(step){
                        scope.currentStep=step;
                        updateIndicators();
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
                    updateIndicators();
                    makeSureTheresRoom();
                    watchForWindowResize();
                    listenForLanguageChange();
                    observeStepAttr();
                },
                // creates indicators inside of <indicator-container>
                createIndicators = function(){
                    var stepTitles=[],
                        stepStates=[],
                        defaultString='default';
                    for(var i=0;i < scope.numberOfSteps;i++){
                        stepTitles[i]=scope.$steps[i].attributes.title.value;
                        if(scope.$steps[i].attributes.state){
                            stepStates[i]='' + scope.$steps[i].attributes.state.value + '';
                        }
                    }
                    stepTitles.forEach(function(e,i){
                        var div;
                        if(scope.clickableIndicators!==undefined){
                            div=angular.element('<span class="step-indicator" ng-click="goToStep(' + 
                                (i+1) + ');goToState(\'' + (stepStates[i] || defaultString) + '\')">' + stepTitles[i] + '</span>');
                            div[0].style.cursor='pointer';
                        }
                        else{
                            div=angular.element('<span class="step-indicator">' + stepTitles[i] + '</span>');
                        }
                        var compiled=$compile(div)(scope);
                        angular.element(scope.$indicatorContainer).append(compiled);
                    });
                    scope.$indicators=angular.element(elem[0].querySelectorAll('.step-indicator'));
                },
                // updates the current active indicator. Removes active class from other elements.
                updateIndicators = function(){
                    $timeout(function(){
                        var currentStep=scope.currentStep;
                        for(var i=0; i<scope.$steps.length ; i++){
                            scope.$steps[i].classList.remove('active');
                            scope.$indicators[i].classList.remove('active');
                        }
                        scope.$steps[currentStep-1].classList.add('active');
                        scope.$indicators[currentStep-1].classList.add('active');
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