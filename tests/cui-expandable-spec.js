describe('Cui-exandable',function(){
    var $compile,
        $rootScope;

    beforeEach(module('cui-ng'));

    beforeEach(inject(function(_$compile_,_$rootScope_){
        $compile= _$compile_;
        $rootScope= _$rootScope_;
    }));

    describe('toggleExpand()',function(){
        it('toggles the expanded class',function(){
            var element = $compile('<cui-expandable></cui-expandable')($rootScope);
            $rootScope.$digest();
            element.scope().toggleExpand();
            expect(element[0].classList).toMatch(/expanded/);
        })
    })
})

