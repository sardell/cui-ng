describe('Cui-wizard',function(){
    var $compile,
        $rootScope,
        $timeout;

    beforeEach(module('cui-ng'));

    beforeEach(inject(function(_$compile_,_$rootScope_,_$timeout_){
        $compile= _$compile_;
        $rootScope= _$rootScope_;
        $timeout= _$timeout_;
    }));

    it('it counts the number of steps',function(){
        var element = $compile('<cui-wizard step="1"><indicator-container></indicator-container><step></step><step></step></cui-wizard>')($rootScope);
        $rootScope.$digest();
        expect(element.scope().init).toHaveBeenCalled();
        console.log(Object.keys(element.scope()));
        console.log(element.scope().numberOfSteps);
   
    
    });
});

