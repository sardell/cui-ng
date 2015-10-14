(function(angular){
    'use strict';

    angular
    .module('app',['translate'])
    .controller('appCtrl',[function(){
        var app=this;
        app.user={
            name: 'Bill Murray',
            avatar: '//www.fillmurray.com/200/200'
        };
        app.logo='assets/img/logo.png';

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
                var logo;
                attrs.logo!==undefined ? logo = attrs.logo : true;
                attrs.user!==undefined ? scope.cuiUser = attrs.user : true;
                attrs.topMenu!==undefined ? scope.cuiTopMenu=true : scope.cuiTopMenu=false;
                
                //set logo image
                var $logo = document.querySelector('.cui-header__logo');
                $logo.style.backgroundImage = 'url("' + logo + '")';
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
    .directive('cuiWizard',['$timeout','$compile',function($timeout,$compile){
        return{
            restrict: 'E',
            scope: true,
            link:function(scope,elem,attrs){
                //init
                var init = function(){
                        scope.$steps=document.querySelectorAll('cui-wizard>step');
                        scope.$indicatorContainer=document.querySelector('indicator-container');
                        scope.$previousBtn=document.querySelector('.cui-wizard__previous');
                        scope.$nextBtn=document.querySelector('.cui-wizard__next');
                        scope.currentStep=Number(elem[0].attributes.step.value);
                        scope.next=function(){
                            scope.currentStep++;
                            updateIndicators();
                        };
                        scope.previous=function(){
                            scope.currentStep--;
                            updateIndicators();
                        };
                        scope.goToStep=function(step){
                            scope.currentStep=step;
                            updateIndicators();
                        };
                        createIndicators();
                        updateIndicators();
                    },
                    // creates indicators inside of <indicator-container>
                    createIndicators = function(){
                        scope.numberOfSteps=scope.$steps.length;
                        var stepTitles=[];
                        for(var i=0;i < scope.numberOfSteps;i++){
                            stepTitles[i]=scope.$steps[i].attributes.title.value;
                        }
                        stepTitles.forEach(function(e,i){
                            var div=angular.element('<span class="step-indicator" ng-click="goToStep(' + 
                                (i+1) + ')">' + stepTitles[i] + '</span>');
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
                            // currentStep>1 ? scope.$previousBtn.classList.add('active') :
                            //  scope.$previousBtn.classList.remove('active');
                        });
                    };

                init();
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