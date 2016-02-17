describe('Class-toggle',function(){
    var $compile,
        $rootScope;

    beforeEach(module('cui-ng'));

    beforeEach(inject(function(_$compile_,_$rootScope_){
        $compile= _$compile_;
        $rootScope= _$rootScope_;
    }));

    describe('toggleClass()',function(){
        it('toggles the toggled-class class',function(){
            var element = $compile('<class-toggle toggled-class="toggled"></class-toggle>')($rootScope);
            $rootScope.$digest();
            element.scope().toggleClass();
            expect(element[0].classList).toMatch(/toggled/);
            element.scope().toggleClass();
            expect(element[0].classList).not.toMatch(/toggled/);
        });
        it('toggles scope.toggled',function(){
            var element = $compile('<class-toggle toggled-class="toggled"></class-toggle>')($rootScope);
            element.scope().toggleClass();
            $rootScope.$digest();
            expect(element.scope().toggled).toBe(true);
            element.scope().toggleClass();
            $rootScope.$digest();
            expect(element.scope().toggled).toBe(false);
        });
    });

    describe('toggleOn()',function(){
        it('adds the toggled-class class to the element, if the element doesn\'t already have it',function(){
            var element = $compile('<class-toggle toggled-class="toggled"></class-toggle>')($rootScope);
            $rootScope.$digest();
            element.scope().toggleOn();
            expect(element[0].classList).toMatch(/toggled/);
            var element = $compile('<class-toggle class="toggled" toggled-class="toggled"></class-toggle>')($rootScope);
            $rootScope.$digest();
            element.scope().toggleOn();
            expect(element[0].classList).toMatch(/toggled/);
        });
    });

    describe('toggleOff()',function(){
        it('removes the toggled-class class from the element, if the element has that class',function(){
            var element = $compile('<class-toggle toggled-class="toggled"></class-toggle>')($rootScope);
            $rootScope.$digest();
            element.scope().toggleOff();
            expect(element[0].classList).not.toMatch(/toggled/);
            var element = $compile('<class-toggle class="toggled" toggled-class="toggled"></class-toggle>')($rootScope);
            $rootScope.$digest();
            element.scope().toggleOff();
            expect(element[0].classList).not.toMatch(/toggled/);
        });
    });

    it('sets scope.toggled to true if the element is expanded by default',function(){
        var element = $compile('<class-toggle class="toggled" toggled-class="toggled"></class-toggle>')($rootScope);
        $rootScope.$digest();
        expect(element.scope().toggled).toBe(true);
    });
});

