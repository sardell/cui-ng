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
            var element = $compile('<cui-expandable></cui-expandable>')($rootScope);
            $rootScope.$digest();
            element.scope().toggleExpand();
            expect(element[0].classList).toMatch(/expanded/);
            element.scope().toggleExpand();
            expect(element[0].classList).not.toMatch(/expanded/);
        });
        it('toggles scope.expanded',function(){
            var element = $compile('<cui-expandable></cui-expandable>')($rootScope);
            element.scope().toggleExpand();
            $rootScope.$digest();
            expect(element.scope().expanded).toBe(true);
            element.scope().toggleExpand();
            $rootScope.$digest();
            expect(element.scope().expanded).toBe(false);
        });
    });

    describe('expand()',function(){
        it('adds expanded class to the element, if it\'s not already expanded',function(){
            var element = $compile('<cui-expandable></cui-expandable>')($rootScope);
            $rootScope.$digest();
            element.scope().expand();
            expect(element[0].classList).toMatch(/expanded/);
            var element = $compile('<cui-expandable class="expanded"></cui-expandable>')($rootScope);
            $rootScope.$digest();
            element.scope().expand();
            expect(element[0].classList).toMatch(/expanded/);
        });
    });

    describe('collapse()',function(){
        it('removes expanded class from the element, if it\'s expanded',function(){
            var element = $compile('<cui-expandable></cui-expandable>')($rootScope);
            $rootScope.$digest();
            element.scope().collapse();
            expect(element[0].classList).not.toMatch(/expanded/);
            var element = $compile('<cui-expandable class="expanded"></cui-expandable>')($rootScope);
            $rootScope.$digest();
            element.scope().collapse();
            expect(element[0].classList).not.toMatch(/expanded/);
        });
    });

    it('sets scope.expanded to true if the element is expanded by default',function(){
        var element = $compile('<cui-expandable class="expanded"></cui-expandable>')($rootScope);
        $rootScope.$digest();
        expect(element.scope().expanded).toBe(true);
    });
});

