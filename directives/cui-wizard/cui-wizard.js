(function(angular){
    angular.module('cui-ng')
    .directive('cuiWizard',['$timeout','$compile','$window',function($timeout,$compile,$window){
        return{
            restrict: 'E',
            link:function(scope,elem,attrs){
                //init
                var init = function(){
                        scope.invalidForm=[];
                        scope.$steps=document.querySelectorAll('cui-wizard>step');
                        scope.$indicatorContainer=document.querySelector('indicator-container');
                        scope.$window=angular.element($window);
                        scope.currentStep=Number(elem[0].attributes.step.value);
                        scope.clickableIndicators=attrs.clickableIndicators;
                        scope.minimumPadding=attrs.minimumPadding;
                        scope.next=function(){
                            scope.currentStep++;
                            updateIndicators();
                        };
                        scope.previous=function(form){
                            if(form && form.$invalid){
                                scope.invalidForm[currentStep]=true;
                            }
                            scope.currentStep--;
                            updateIndicators();
                        };
                        scope.goToStep=function(step){
                            scope.currentStep=step;
                            updateIndicators();
                        };
                        scope.nextWithErrorChecking=function(form){
                            if(form.$invalid){
                                angular.forEach(form.$error, function (field) {
                                    angular.forEach(field, function(errorField){
                                        errorField.$setTouched();
                                    })
                                });
                                scope.invalidForm[scope.currentStep]=true;
                            }
                            else{
                                scope.invalidForm[scope.currentStep]=false;
                                scope.next();
                            }
                        };
                        createIndicators();
                        updateIndicators();
                        makeSureTheresRoom();
                        watchForWindowResize();
                        listenForLanguageChange();
                    },
                    // creates indicators inside of <indicator-container>
                    createIndicators = function(){
                        scope.numberOfSteps=scope.$steps.length;
                        var stepTitles=[];
                        for(var i=0;i < scope.numberOfSteps;i++){
                            stepTitles[i]=scope.$steps[i].attributes.title.value;
                        }
                        stepTitles.forEach(function(e,i){
                            var div;
                            if(scope.clickableIndicators!==undefined){
                                div=angular.element('<span class="step-indicator" ng-click="goToStep(' + 
                                    (i+1) + ')">' + stepTitles[i] + '</span>');
                                div[0].style.cursor="pointer";
                            }
                            else{
                                div=angular.element('<span class="step-indicator">' + stepTitles[i] + '</span>');
                            }
                            var compiled=$compile(div)(scope);
                            angular.element(scope.$indicatorContainer).append(compiled);
                        });
                        scope.$indicators=document.querySelectorAll('.step-indicator');
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
                                if (!immediate) func.apply(context, args);
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
                        return scope.$indicatorContainer.clientWidth;
                    },
                    onlyShowCurrentIndicator = function(){
                        scope.$indicatorContainer.classList.add('small');
                    },
                    showAllIndicators = function(){
                        scope.$indicatorContainer.classList.remove('small');
                    },
                    //makes sure there's still room for the step indicators, has a debounce on it so it
                    //doesn't fire too often.
                    makeSureTheresRoom = debounce(function(){
                        if((getIndicatorContainerWidth() < getIndicatorsWidth()) && 
                                (getIndicatorContainerWidth() < (Math.max((scope.indicatorsWidth || 0),getIndicatorsWidth())))){
                            scope.indicatorsWidth=getIndicatorsWidth();
                            onlyShowCurrentIndicator();
                        }
                        else if(getIndicatorContainerWidth() > scope.indicatorsWidth){
                            showAllIndicators();
                        }
                    }, 40),
                    watchForWindowResize = function(){
                        scope.$window.bind('resize',function(){
                            makeSureTheresRoom();
                        })
                    },
                    listenForLanguageChange = function(){
                        scope.$on('languageChange',makeSureTheresRoom);
                    };
                init();
            }
        };
    }]);
})(angular);