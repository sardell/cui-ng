angular.module('cui-ng')
.directive('paginate',['$window','$compile','$timeout',function($window,$compile,$timeout){
    return {
        restrict: 'AE',
        scope: {
            resultsPerPage: '&',
            count: '&',
            page: '=',
            onPageChange: '&'
        },
        link: function(scope, elem, attrs){
            var self;
            var paginate={
                initScope:function(){
                    self=this;
                    scope.paginate={
                        currentPage:scope.page || 1
                    };
                    angular.forEach(self.scope,function(func,key){
                        scope.paginate[key]=func;
                    });
                },
                selectors:{
                    $paginate:angular.element(elem[0]),
                    $window:angular.element($window)
                },
                config:{
                    pageClass:attrs.pageClass || 'paginate__page',
                    activePageClass:attrs.activePageClass || 'paginate__page--active',
                    ellipsesClass: attrs.ellipsesClass || 'paginate__ellipses',
                    previousAndNextClass: attrs.previousNextClass || 'paginate__previous-and-next',
                    pageContainerClass: attrs.pageContainerClass || 'paginate__page-container',
                    ellipses: angular.isDefined(attrs.ellipses) ? true : false,
                    ellipsesButton: attrs.ellipses || '...',
                    previousButton: attrs.previousButton || '<',
                    nextButton: attrs.nextButton || '>',
                },
                watchers:{
                    resultsPerPage:function(){
                        scope.$watch('resultsPerPage',function(newResultsPerPage){

                        });
                    },
                    count:function(){
                        scope.$watch('count',function(newCount){

                        });
                    },
                    page:function(){
                        scope.$watch('page',function(newPage){

                        });
                    },
                    windowResize:function(){
                        self.selectors.$window.bind('resize',self.helpers.resizeHandler);
                    }
                },
                helpers:{
                    getNumberOfPages:function(){
                        console.log('number of pages ',Math.ceil(scope.count()/scope.resultsPerPage()));
                        return Math.ceil(scope.count()/scope.resultsPerPage());
                    },
                    getAvailableSpaceForPages:function(){
                        var paginateWidth=self.helpers.getWidthOfElement(self.selectors.$paginate);
                        console.log('paginate width ',paginateWidth);
                        var previousWidth=self.helpers.getWidthOfElement(self.render.previousButton());
                        var nextWidth=self.helpers.getWidthOfElement(self.render.nextButton());
                        console.log('next width ',nextWidth);
                        return paginateWidth - ( previousWidth + nextWidth );
                    },
                    getWidthOfElement:function(element){ // this appends the element to the body, get its width, and removes it. Used for measuring.
                        element.appendTo(document.body);
                        var width=element.width();
                        element.remove();
                        return width;
                    },
                    thereIsRoomToShowAllPages:function(){
                        var widthOfPage=self.helpers.getWidthOfElement(self.render.pageNumber(1));
                        if(widthOfPage*self.helpers.getNumberOfPages() <= self.helpers.getAvailableSpaceForPages()){
                            return true;
                        }
                        else {
                            return false;
                        }
                    },
                    handleStepChange:function(){
                        console.log('changed Step');
                    }
                },
                scope:{
                    previous:function(){
                        if(scope.paginate.currentPage > 1) {
                            scope.paginate.currentPage--;
                            self.helpers.handleStepChange();
                        }
                    },
                    next:function(){
                        if(scope.paginate.currentPage+1 <= self.helpers.getNumberOfPages()){
                            scope.paginate.currentPage++;
                            self.helpers.handleStepChange();
                        }
                    },
                    goToPage:function(page){
                        if(page===scope.paginate.currentPage) return;
                        if(page <= self.helpers.getNumberOfPages()){
                            scope.paginate.currentPage=page;
                            self.helpers.handleStepChange();
                        }
                        else if(!scope.paginate.currentPage){
                            scope.paginate.currentPage=1; // if the user tries to go to a page that does not exist
                            self.helpers.handleStepChange();
                        }
                    },
                    navigateXSteps:function(stepsToNavigate){
                        if(scope.paginate.currentPage + stepsToNavigate < 1 || scope.paginate.currentPage + stepsToNavigate > self.helpers.getNumberOfPages()){
                            return;
                        }
                        scope.paginate.currentPage += stepsToNavigate;
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
                                '<span ng-click="paginate.previous()" class="', self.config.previousAndNextClass , '">',
                                    self.config.previousButton,
                                '</span>'
                            )
                        )(scope);
                        return previousButton;
                    },
                    nextButton:function(){
                        var nextButton=$compile(
                            String.prototype.concat(
                                '<span ng-click="paginate.next()" class="', self.config.previousAndNextClass , '">',
                                    self.config.nextButton,
                                '</span>'
                            )
                        )(scope);
                        console.log('nextButton ',nextButton);
                        return nextButton;
                    },
                    pageContainer:function(){
                        var pageContainer=$(String.prototype.concat('<span class="',self.config.pageContainerClass,'"></span>'));
                        self.render.pageNumbers().forEach(function(page){
                            pageContainer.append(page);
                        });
                        console.log('pageContainer ',pageContainer);
                        return pageContainer;
                    },
                    pageNumber:function(page,active){
                        var activeClass,ngClick;
                        if(active){
                            activeClass=' ' + self.config.activePageClass;
                            ngClick=' ';
                        }
                        else{
                            activeClass='';
                            ngClick=' ng-click="paginate.goToPage(' + page + ')" ';
                        }
                        var button=$compile(
                                String.prototype.concat(
                                    '<span', ngClick, 'class="', self.config.pageClass , activeClass , '">', page , '</span>'
                                )
                        )(scope);
                        return button;
                    },
                    pageNumbers:function(){
                        var pages=[];
                        if(self.helpers.thereIsRoomToShowAllPages()){
                            for(var i=0;i<self.helpers.getNumberOfPages();i++){
                                var page=self.render.pageNumber(i+1,i+1===scope.paginate.currentPage);
                                pages.push(page);
                            }
                        }
                        return pages;
                    },
                    ellipses:function(ammountOfStepsToNavigate){
                        var ngClick=' ng-click="paginate.navigateXSteps(' + ammountOfStepsToNavigate + ')" ';
                        var ellipses=$compile(
                            String.prototype.concat(
                                '<span', ngClick, 'class="', self.config.ellipsesClass, '">', self.config.ellipsesButton, '</span>'
                            )
                        )(scope);
                        return ellipses;
                    }
                }
            };

            $timeout(function(){
                paginate.initScope();
                paginate.render.init();
            })
        }
    };
}]);