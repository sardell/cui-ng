(function(angular){
    'use strict';

    angular
    .module('app',['translate','ngMessages'])
    .controller('appCtrl',[function(){
        var app=this;
        app.user={
            name: 'Bill Murray',
            avatar: '//www.fillmurray.com/200/200'
        };

        //for the wizard
        app.step=1;
        app.organization={};
        app.organization.name='Thirdwave LLC';
        app.organization.divisions=['Web design','UI development','Wordpress development','Ruby development'];
        app.organization.cities=['Chicago','Aurora','Rockford','Joliet','Naperville','Springfiled'];
        app.organization.states=['IL','FL','NY','CA'];
        app.organization.countries=['U.S.A','Portugal','Spain'];

        app.signOn={};
        app.signOn.questions=['cui-favorite-pet-q','cui-mother-q',
        'cui-best-friend-q'];
        app.signOn.password1='';

        app.user={};
        app.user.timezones=['-08:00','-07:00','-06:00','-05:00','-04:00'];
    }])


    //cui-header ----------------------------------
    .directive('cuiHeader',[function(){
        return{
            restrict: 'E',
            replace:true,
            templateUrl:'assets/angular-templates/header.html',
            link: function(scope,elem,attrs){
                //read attributes
                attrs.user!==undefined ? scope.cuiUser = attrs.user : true;
                attrs.topMenu!==undefined ? scope.cuiTopMenu=true : scope.cuiTopMenu=false;
            }
        };
    }])


    //cui-avatar -----------------------------------
    .directive('cuiAvatar',[function(){
        return{
            restrict: 'E',
            templateUrl:'assets/angular-templates/avatar.html',
            link:function(scope,elem,attrs){
                //read attributes
                var user;
                attrs.user!==undefined ? user=attrs.user :
                 console.log('No user passed.');

                scope.userName=user.name;
            }
        };
    }])

    //cui-wizard -------------------------------------
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
    }])

    //password-validation
    .directive('passwordValidation', [function(){
        return {
            require: 'ngModel',
            restrict: 'A',
            link: function(scope, element, attrs, ctrl){
                ctrl.$validators.length = function(modelValue,viewValue){
                    if(/^.{8,20}$/.test(viewValue)){ return true; } else { return false; }
                }
                ctrl.$validators.lowercase = function(modelValue,viewValue){
                    if(/.*[a-z].*/.test(viewValue)){ return true; } else { return false; }
                }
                ctrl.$validators.uppercase = function(modelValue,viewValue){
                    if(/.*[A-Z].*/.test(viewValue)){ return true; } else { return false; }
                }
                ctrl.$validators.number = function(modelValue,viewValue){
                    if(/.*[0-9].*/.test(viewValue)){ return true; } else { return false; }
                }
                ctrl.$validators.complex = function(modelValue,viewValue){
                    if(/[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/.test(viewValue)){ return true; } else { return false; }
                }
            }
        };
    }])

    //cui-expandable ----------------------------
    .directive('cuiExpandable',[function(){
        return{
            restrict:'E',
            scope: true,
            link:function(scope,elem,attrs){
                scope.toggleExpand=function(){
                    attrs.$set('expanded',!attrs.expanded);
                };
            }
        };
    }]);

})(angular);