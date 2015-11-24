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

    it('counts the number of steps',function(){
        var element = $compile('<cui-wizard step="1" minimum-padding="20"><indicator-container></indicator-container><step title="test"></step><step title="test2"></step></cui-wizard>')($rootScope);
        $rootScope.$digest();
        expect(element.scope().numberOfSteps).toBe(2);
    });
    it('creates indicators',function(){
        var element = $compile('<cui-wizard step="1" minimum-padding="20"><indicator-container></indicator-container><step title="test"></step><step title="test2"></step></cui-wizard>')($rootScope);
        $rootScope.$digest();
        expect(element.scope().$indicators.length).toBe(2); 
    });
    it('updates the indicators at compile and after each step change',function(){
        var element = $compile('<cui-wizard step="1" minimum-padding="20"><indicator-container></indicator-container><step title="test"></step><step title="test2"></step></cui-wizard>')($rootScope);
        $rootScope.$digest();
        $timeout.flush();
        expect(element.scope().$steps[0].classList).toMatch(/active/);
        element.scope().next();
        $timeout.flush();
        expect(element.scope().$steps[0].classList).not.toMatch(/active/);
        expect(element.scope().$steps[1].classList).toMatch(/active/);
    });

    describe('next()',function(){
        it('navigates to the next step',function(){
            var element = $compile('<cui-wizard step="1" minimum-padding="20"><indicator-container></indicator-container><step title="test"></step><step title="test2"></step></cui-wizard>')($rootScope);
            $rootScope.$digest();
            element.scope().next();
            expect(element.scope().currentStep).toBe(2);
        });
        it('broadcasts stepChange when a state is passed',function(){
            var element = $compile('<cui-wizard step="1" minimum-padding="20"><indicator-container></indicator-container><step title="test"></step><step title="test2"></step></cui-wizard>')($rootScope);
            $rootScope.$digest();
            element.scope().next('newState');
            expect($rootScope.$broadcast).toHaveBeenCalledWith('stepChange',{state:'newState'});
        })
    });

    describe('previous()',function(){
        it('navigates to the previous step',function(){
            var element = $compile('<cui-wizard step="2" minimum-padding="20"><indicator-container></indicator-container><step title="test"></step><step title="test2"></step></cui-wizard>')($rootScope);
            $rootScope.$digest();
            element.scope().previous();
            expect(element.scope().currentStep).toBe(1);
        });
        it('broadcasts stepChange when a state is passed',function(){
            var element = $compile('<cui-wizard step="2" minimum-padding="20"><indicator-container></indicator-container><step title="test"></step><step title="test2"></step></cui-wizard>')($rootScope);
            $rootScope.$digest();
            element.scope().next('previousState');
            expect($rootScope.$broadcast).toHaveBeenCalledWith('stepChange',{state:'previousState'});
        })
    });

    describe('goToStep()',function(){
        it('navigates to the step that was passed',function(){
            var element = $compile('<cui-wizard step="1" minimum-padding="20"><indicator-container></indicator-container><step title="test"></step><step title="test2"></step></cui-wizard>')($rootScope);
            $rootScope.$digest();
            element.scope().goToStep(2);
            expect(element.scope().currentStep).toBe(2);
        });
    });
    describe('goToState()',function(){
        it('broadcasts stepChange with the state passed',function(){
            var element = $compile('<cui-wizard step="1" minimum-padding="20"><indicator-container></indicator-container><step title="test"></step><step title="test2"></step></cui-wizard>')($rootScope);
            $rootScope.$digest();
            element.scope().goToState('Trial');
            expect($rootScope.$broadcast).toHaveBeenCalledWith('stepChange',{state:'Trial'});
        });
    });

});

