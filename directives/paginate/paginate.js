angular.module('cui-ng')
.directive('paginate',['$compile','$timeout','$interval',function($compile,$timeout,$interval){
    return {
        restrict: 'AE',
        scope: {
            resultsPerPage: '&',
            count: '&',
            onPageChange: '&',
            page: '=ngModel'
        },
        link: function(scope, elem, attrs){
            var self,resizeInterval;
            var paginate={
                initScope:function(){
                    self=this;
                    self.config.numberOfPages=self.helpers.getNumberOfPages();
                    self.config.howManyPagesWeCanShow=self.helpers.howManyPagesWeCanShow();
                    scope.paginate={
                        currentPage:scope.page? self.helpers.normalizePage(scope.page) : 1
                    };
                    if(scope.onPageChange()) {
                        scope.onPageChange()(scope.paginate.currentPage);
                    }
                    angular.forEach(self.scope,function(func,key){
                        scope.paginate[key]=func;
                    });
                },
                selectors:{
                    $paginate:angular.element(elem[0])
                },
                config:{
                    pageClass:attrs.pageClass || 'cui-paginate__page',
                    activePageClass:attrs.activePageClass || 'cui-paginate__page--active',
                    ellipsesClass: attrs.ellipsesClass || 'cui-paginate__ellipses',
                    previousClass: attrs.previousNextClass || 'cui-paginate__previous',
                    nextClass: attrs.previousNextClass || 'cui-paginate__next',
                    pageContainerClass: attrs.pageContainerClass || 'cui-paginate__page-container',
                    ellipsesButton: attrs.ellipses || '...',
                    previousButton: attrs.previousButton || '<',
                    nextButton: attrs.nextButton || '>'
                },
                watchers:{
                    resultsPerPage:function(){
                        scope.$watch(scope.resultsPerPage,function(newResultsPerPage,oldResultsPerPage){
                            if(newResultsPerPage && newResultsPerPage!==oldResultsPerPage) self.helpers.updateConfigAndRerender();
                        });
                    },
                    count:function(){
                        scope.$watch(scope.count,function(newCount,oldCount){
                            if(newCount && newCount!==oldCount) self.helpers.updateConfigAndRerender();
                        });
                    },
                    page:function(){
                        scope.$watch('page',function(newPage){
                            if(newPage && newPage!==scope.paginate.currentPage) {
                                if(newPage > self.config.numberOfPages) scope.paginate.currentPage=self.config.numberOfPages;
                                else if(newPage < 1) scope.paginate.currentPage=1;
                                else scope.paginate.currentPage=newPage;
                                self.helpers.handleStepChange();
                            }
                        });
                    },
                    paginateResize:function(){
                        resizeInterval=$interval(self.helpers.resizeHandler,20);
                    },
                    scopeDestroy:function(){
                        scope.$on('$destroy',function(){
                            $interval.cancel(resizeInterval); // unbinds the resize interval
                        });
                    }
                },
                helpers:{
                    updateConfigAndRerender:function(){
                        self.config.numberOfPages=self.helpers.getNumberOfPages();
                        self.config.howManyPagesWeCanShow=self.helpers.howManyPagesWeCanShow();
                        self.selectors.$pageContainer.replaceWith(self.render.pageContainer());
                    },
                    getNumberOfPages:function(){
                        return Math.ceil(scope.count()/scope.resultsPerPage());
                    },
                    getWidthOfAPage:function(){
                        return self.helpers.getWidthOfElement($(self.render.pageNumber(1)));
                    },
                    getAvailableSpaceForPages:function(){
                        var paginateWidth=self.config.width || self.selectors.$paginate.width();
                        var previousWidth=self.helpers.getWidthOfElement(self.render.previousButton());
                        var nextWidth=self.helpers.getWidthOfElement(self.render.nextButton());
                        return paginateWidth - ( previousWidth + nextWidth )-1; // - 1 because at certain widths the width() method was off by a pixel
                    },
                    getWidthOfElement:function(element){ // this appends the element to the body, get its width, and removes it. Used for measuring.
                        element.appendTo(document.body);
                        var width=element.outerWidth(true);
                        element.remove();
                        return width;
                    },
                    howManyPagesWeCanShow:function(){
                        return Math.floor(self.helpers.getAvailableSpaceForPages()/self.helpers.getWidthOfAPage());
                    },
                    handleStepChange:function(){
                        scope.page=scope.paginate.currentPage;
                        if(scope.onPageChange()) scope.onPageChange()(scope.paginate.currentPage);
                        self.selectors.$pageContainer.replaceWith(self.render.pageContainer());
                    },
                    resizeHandler:function(){
                        if(!self.config.width) self.config.width=self.selectors.$paginate.width();
                        else if(self.selectors.$paginate.width()!==self.config.width) {
                            self.config.width=self.selectors.$paginate.width();
                            self.config.widthOfAPage=self.helpers.getWidthOfAPage();
                            self.config.availableSpaceForPages=self.helpers.getAvailableSpaceForPages();
                            self.helpers.updateConfigAndRerender();
                        }
                    },
                    whatEllipsesToShow:function(){
                        if(self.config.numberOfPages <= self.config.howManyPagesWeCanShow) return 'none';
                        else if(scope.paginate.currentPage < ((self.config.howManyPagesWeCanShow/2)+1)) return 'right';
                        else if(scope.paginate.currentPage < (self.config.numberOfPages -  ((self.config.howManyPagesWeCanShow/2)))) return 'both';
                        else return 'left';
                    },
                    normalizePage:function(page){
                        var page=parseInt(page);
                        if(page <= self.config.numberOfPages && page >= 1){
                            return page;
                        }
                        else if(page < 1){
                            return 1;
                        }
                        else return self.config.numberOfPages;
                    }
                },
                scope:{
                    previous:function(){
                        if(scope.paginate.currentPage > 1){
                            scope.paginate.currentPage--;
                            self.helpers.handleStepChange();
                        }
                    },
                    next:function(){
                        if(scope.paginate.currentPage+1 <= self.config.numberOfPages){
                            scope.paginate.currentPage++;
                            self.helpers.handleStepChange();
                        }
                    },
                    goToPage:function(page){
                        if(page===scope.paginate.currentPage) return;
                        scope.paginate.currentPage=self.helpers.normalizePage(page);
                        self.helpers.handleStepChange();
                    }
                },
                render:{
                    init:function(){
                        self.selectors.$paginate.append(self.render.previousButton());
                        self.selectors.$paginate.append(self.render.pageContainer());
                        self.selectors.$paginate.append(self.render.nextButton());
                    },
                    previousButton:function(){
                        var previousButton=$compile(
                            String.prototype.concat(
                                '<span ng-click="paginate.previous()" class="', self.config.previousClass , '">',
                                    self.config.previousButton,
                                '</span>'
                            )
                        )(scope);
                        return previousButton;
                    },
                    nextButton:function(){
                        var nextButton=$compile(
                            String.prototype.concat(
                                '<span ng-click="paginate.next()" class="', self.config.nextClass , '">',
                                    self.config.nextButton,
                                '</span>'
                            )
                        )(scope);
                        return nextButton;
                    },
                    ellipses:function(page){
                        var ngClick=' ng-click="paginate.goToPage(' + page + ')" ';
                        var ellipses=$compile(
                            String.prototype.concat(
                                '<span', ngClick, 'class="', self.config.ellipsesClass, '">', self.config.ellipsesButton, '</span>'
                            )
                        )(scope);
                        return ellipses;
                    },
                    pageNumber:function(page,active){
                        var activeClass,ngClick;
                        ngClick=' ng-click="paginate.goToPage(' + page + ')" ';
                        if(active) activeClass=' ' + self.config.activePageClass;
                        else activeClass='';
                        var button=String.prototype.concat(
                            '<span', ngClick, 'class="', self.config.pageClass , activeClass , '">', page , '</span>'
                        );
                        return $compile(button)(scope);
                    },
                    pagesXToY:function(x,y){
                        var pages=[];
                        do {
                            var page=self.render.pageNumber(x,x===scope.paginate.currentPage);
                            pages.push(page);
                            x++
                        }
                        while(x <= y);
                        return pages;
                    },
                    pageNumbers:function(){
                        var pages=[],
                            whatEllipsesToShow=self.helpers.whatEllipsesToShow();

                        if(whatEllipsesToShow==='none'){
                            pages.push(self.render.pagesXToY(1,self.config.numberOfPages));
                        }
                        else if(whatEllipsesToShow==='right') {
                            var ellipsesPoint=self.config.howManyPagesWeCanShow-1;
                            pages.push(self.render.pagesXToY(1,ellipsesPoint-1));
                            pages.push(self.render.ellipses(ellipsesPoint));
                            pages.push(self.render.pageNumber(self.config.numberOfPages));
                        }
                        else if(whatEllipsesToShow==='both') {
                            var firstEllipsesPoint=scope.paginate.currentPage-(Math.ceil(self.config.howManyPagesWeCanShow/2)-2);
                            var secondEllipsesPoint=scope.paginate.currentPage + (Math.floor(self.config.howManyPagesWeCanShow/2)-1);
                            pages.push(self.render.pageNumber(1));
                            pages.push(self.render.ellipses(firstEllipsesPoint));
                            pages.push(self.render.pagesXToY(firstEllipsesPoint+1,secondEllipsesPoint-1));
                            pages.push(self.render.ellipses(secondEllipsesPoint));
                            pages.push(self.render.pageNumber(self.config.numberOfPages));
                        }
                        else  { // if the ellipses is on the left
                            var ellipsesPoint=self.config.numberOfPages-(self.config.howManyPagesWeCanShow-2);
                            pages.push(self.render.pageNumber(1));
                            pages.push(self.render.ellipses(ellipsesPoint));
                            pages.push(self.render.pagesXToY(ellipsesPoint+1,self.config.numberOfPages));
                        }
                        return pages;
                    },
                    pageContainer:function(){
                        var pageContainer=$('<span class="' + self.config.pageContainerClass + '"></span>');
                        self.selectors.$pageContainer=pageContainer;
                        self.render.pageNumbers().forEach(function(page){
                            pageContainer.append(page);
                        });
                        return pageContainer;
                    }
                }
            };

            $timeout(function(){
                paginate.initScope();
                paginate.render.init();
                angular.forEach(paginate.watchers,function(initWatcher){
                    initWatcher();
                });
            });
        }
    };
}]);