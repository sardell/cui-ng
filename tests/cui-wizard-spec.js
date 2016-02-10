describe('Cui-wizard',function(){
    var $compile,
        $rootScope,
        $timeout;

    beforeEach(module('cui-ng'));

    beforeEach(inject(function(_$compile_,_$rootScope_,_$timeout_){
        $compile= _$compile_;
        $rootScope= _$rootScope_;
        $timeout= _$timeout_;
        spyOn($rootScope, '$broadcast');
    }));

    it('creates indicators',function(){
        var element = $compile('<cui-wizard mobile-stack step="1" minimum-padding="20"><indicator-container></indicator-container><step title="test"></step><step title="test2"></step></cui-wizard>')($rootScope);
        $rootScope.$digest();
        expect(element.scope().$indicators.length).toBe(2);
    });

    describe('next()',function(){
        it('navigates to the next step',function(){
            var element = $compile('<cui-wizard mobile-stack step="1" minimum-padding="20"><indicator-container></indicator-container><step title="test"></step><step title="test2"></step></cui-wizard>')($rootScope);
            $rootScope.$digest();
            element.scope().next();
            expect(element.scope().currentStep).toBe(2);
        });
        it('broadcasts stepChange when a state is passed',function(){
            var element = $compile('<cui-wizard mobile-stack step="1" minimum-padding="20"><indicator-container></indicator-container><step title="test"></step><step title="test2"></step></cui-wizard>')($rootScope);
            $rootScope.$digest();
            element.scope().next('newState');
            expect($rootScope.$broadcast).toHaveBeenCalledWith('stepChange',{state:'newState'});
        })
    });

    describe('previous()',function(){
        it('navigates to the previous step',function(){
            var element = $compile('<cui-wizard mobile-stack step="2" minimum-padding="20"><indicator-container></indicator-container><step title="test"></step><step title="test2"></step></cui-wizard>')($rootScope);
            $rootScope.$digest();
            element.scope().previous();
            expect(element.scope().currentStep).toBe(1);
        });
        it('broadcasts stepChange when a state is passed',function(){
            var element = $compile('<cui-wizard mobile-stack step="2" minimum-padding="20"><indicator-container></indicator-container><step title="test"></step><step title="test2"></step></cui-wizard>')($rootScope);
            $rootScope.$digest();
            element.scope().next('previousState');
            expect($rootScope.$broadcast).toHaveBeenCalledWith('stepChange',{state:'previousState'});
        })
    });

    describe('goToStep()',function(){
        it('navigates to the step that was passed',function(){
            var element = $compile('<cui-wizard mobile-stack step="1" minimum-padding="20"><indicator-container></indicator-container><step title="test"></step><step title="test2"></step></cui-wizard>')($rootScope);
            $rootScope.$digest();
            element.scope().goToStep(2);
            expect(element.scope().currentStep).toBe(2);
        });
    });
    describe('goToState()',function(){
        it('broadcasts stepChange with the state passed',function(){
            var element = $compile('<cui-wizard mobile-stack step="1" minimum-padding="20"><indicator-container></indicator-container><step title="test"></step><step title="test2"></step></cui-wizard>')($rootScope);
            $rootScope.$digest();
            element.scope().goToState('Trial');
            expect($rootScope.$broadcast).toHaveBeenCalledWith('stepChange',{state:'Trial'});
        });
    });
    describe('wizardFinished',function(){
        it('is true if the user has been to the last step of the wizard',function(){
               var element = $compile('<cui-wizard mobile-stack step="1" minimum-padding="20"><indicator-container></indicator-container><step title="test"></step><step title="test2"></step></cui-wizard>')($rootScope);
               $rootScope.$digest();
               element.scope().next();
               expect(element.scope().wizardFinished).toBe(true);
        });
    })

});

