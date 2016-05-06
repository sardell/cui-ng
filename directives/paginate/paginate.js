angular.module('cui-ng')
.directive('paginate',['$compile','$timeout','$interval',($compile,$timeout,$interval) => {
    return {
        restrict: 'AE',
        scope: {
            resultsPerPage: '&',
            count: '&',
            onPageChange: '&',
            page: '=ngModel'
        },
        link: (scope, elem, attrs) => {
            let resizeInterval;
            const paginate = {
                initScope:() => {
                    paginate.config.numberOfPages = paginate.helpers.getNumberOfPages();
                    paginate.config.howManyPagesWeCanShow = paginate.helpers.howManyPagesWeCanShow();
                    scope.paginate = {
                        currentPage:scope.page? paginate.helpers.normalizePage(scope.page) : 1
                    };
                    if(scope.onPageChange()) {
                        scope.onPageChange()(scope.paginate.currentPage);
                    }
                    angular.forEach(paginate.scope,(func,key) => {
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
                    resultsPerPage:() => {
                        scope.$watch(scope.resultsPerPage,(newResultsPerPage,oldResultsPerPage) => {
                            if(newResultsPerPage && newResultsPerPage!==oldResultsPerPage) paginate.helpers.updateConfigAndRerender();
                        });
                    },
                    count:() => {
                        scope.$watch(scope.count,(newCount,oldCount) => {
                            if(newCount && newCount!==oldCount) paginate.helpers.updateConfigAndRerender();
                        });
                    },
                    page:() => {
                        scope.$watch('page',(newPage) => {
                            if(newPage && newPage!==scope.paginate.currentPage) {
                                if(newPage > paginate.config.numberOfPages) scope.paginate.currentPage=paginate.config.numberOfPages;
                                else if(newPage < 1) scope.paginate.currentPage=1;
                                else scope.paginate.currentPage=newPage;
                                paginate.helpers.handleStepChange();
                            }
                        });
                    },
                    paginateResize:() => {
                        resizeInterval=$interval(paginate.helpers.resizeHandler,50);
                    },
                    scopeDestroy:() => {
                        scope.$on('$destroy',() => {
                            $interval.cancel(resizeInterval); // unbinds the resize interval
                        });
                    }
                },
                helpers:{
                    updateConfigAndRerender:() => {
                        paginate.config.numberOfPages = paginate.helpers.getNumberOfPages();
                        paginate.config.howManyPagesWeCanShow = paginate.helpers.howManyPagesWeCanShow();
                        paginate.selectors.$pageContainer.replaceWith(paginate.render.pageContainer());
                    },
                    getNumberOfPages:() => Math.ceil(scope.count()/scope.resultsPerPage()),
                    getWidthOfAPage:() => paginate.helpers.getWidthOfElement($(paginate.render.pageNumber(1))),
                    getAvailableSpaceForPages:() => {
                        const paginateWidth = paginate.config.width || paginate.selectors.$paginate.width();
                        const previousWidth = paginate.helpers.getWidthOfElement(paginate.render.previousButton());
                        const nextWidth = paginate.helpers.getWidthOfElement(paginate.render.nextButton());
                        return paginateWidth - ( previousWidth + nextWidth )-1; // - 1 because at certain widths the width() method was off by a pixel
                    },
                    getWidthOfElement:(element) => { // this appends the element to the body, get its width, and removes it. Used for measuring.
                        element.appendTo(document.body);
                        const width=element.outerWidth(true);
                        element.remove();
                        return width;
                    },
                    howManyPagesWeCanShow:() => Math.floor(paginate.helpers.getAvailableSpaceForPages()/paginate.helpers.getWidthOfAPage()),
                    handleStepChange:() => {
                        scope.page = scope.paginate.currentPage;
                        if(scope.onPageChange()) scope.onPageChange()(scope.paginate.currentPage);
                        paginate.selectors.$pageContainer.replaceWith(paginate.render.pageContainer());
                    },
                    resizeHandler:() => {
                        if(!paginate.config.width) paginate.config.width = paginate.selectors.$paginate.width();
                        else if(paginate.selectors.$paginate.width() !== paginate.config.width) {
                            paginate.config.width = paginate.selectors.$paginate.width();
                            paginate.config.widthOfAPage = paginate.helpers.getWidthOfAPage();
                            paginate.config.availableSpaceForPages = paginate.helpers.getAvailableSpaceForPages();
                            paginate.helpers.updateConfigAndRerender();
                        }
                    },
                    whatEllipsesToShow:() => {
                        if(paginate.config.numberOfPages <= paginate.config.howManyPagesWeCanShow) return 'none';
                        else if(scope.paginate.currentPage < ((paginate.config.howManyPagesWeCanShow/2)+1)) return 'right';
                        else if(scope.paginate.currentPage < (paginate.config.numberOfPages -  (paginate.config.howManyPagesWeCanShow/2))) return 'both';
                        else return 'left';
                    },
                    normalizePage:(pageNumber) => {
                        const page = parseInt(pageNumber);
                        if(page <= paginate.config.numberOfPages && page >= 1){
                            return page;
                        }
                        else if(page < 1){
                            return 1;
                        }
                        else return paginate.config.numberOfPages;
                    }
                },
                scope:{
                    previous:() => {
                        if(scope.paginate.currentPage > 1){
                            scope.paginate.currentPage--;
                            paginate.helpers.handleStepChange();
                        }
                    },
                    next:() => {
                        if(scope.paginate.currentPage+1 <= paginate.config.numberOfPages){
                            scope.paginate.currentPage++;
                            paginate.helpers.handleStepChange();
                        }
                    },
                    goToPage:(page) => {
                        if(page === scope.paginate.currentPage) return;
                        scope.paginate.currentPage = paginate.helpers.normalizePage(page);
                        paginate.helpers.handleStepChange();
                    }
                },
                render:{
                    init:() => {
                        paginate.selectors.$paginate.append(paginate.render.previousButton());
                        paginate.selectors.$paginate.append(paginate.render.pageContainer());
                        paginate.selectors.$paginate.append(paginate.render.nextButton());
                    },
                    previousButton:() => {
                        const previousButton = $compile(
                            `<span ng-click="paginate.previous()" class="${paginate.config.previousClass}">
                                ${paginate.config.previousButton}
                            </span>`
                        )(scope);
                        return previousButton;
                    },
                    nextButton:() => {
                        const nextButton = $compile(
                            `<span ng-click="paginate.next()" class="${paginate.config.nextClass}">
                                ${paginate.config.nextButton}
                            </span>`
                        )(scope);
                        return nextButton;
                    },
                    ellipses:(page) => {
                        const ngClick=`ng-click="paginate.goToPage(${page})"`;
                        const ellipses = $compile(`<span ${ngClick} class="${paginate.config.ellipsesClass}">${paginate.config.ellipsesButton}</span>`)(scope);
                        return ellipses;
                    },
                    pageNumber:(page,active) => {
                        let activeClass, ngClick;
                        ngClick = `ng-click="paginate.goToPage(${page})"`;
                        active? activeClass=`${paginate.config.activePageClass}` : activeClass='';
                        const button=$compile(`<span ${ngClick} class="${paginate.config.pageClass} ${activeClass}">${page}</span>`)(scope);
                        return button;
                    },
                    pagesXToY:(x,y) => {
                        let pages=[];
                        do {
                            const page = paginate.render.pageNumber(x, x===scope.paginate.currentPage);
                            pages.push(page);
                            x++;
                        }
                        while(x <= y);
                        return pages;
                    },
                    pageNumbers:() => {
                        const whatEllipsesToShow = paginate.helpers.whatEllipsesToShow();
                        let pages = [];
                        switch (whatEllipsesToShow){
                            case 'none':
                                pages.push(paginate.render.pagesXToY(1, paginate.config.numberOfPages));
                                break;
                            case 'right':
                                const ellipsesPoint = paginate.config.howManyPagesWeCanShow - 1;
                                pages.push(paginate.render.pagesXToY(1,ellipsesPoint-1));
                                pages.push(paginate.render.ellipses(ellipsesPoint));
                                pages.push(paginate.render.pageNumber(paginate.config.numberOfPages));
                                break;
                            case 'left':
                                const ellipsesPointLeft = paginate.config.numberOfPages - (paginate.config.howManyPagesWeCanShow-2);
                                pages.push(paginate.render.pageNumber(1));
                                pages.push(paginate.render.ellipses(ellipsesPointLeft));
                                pages.push(paginate.render.pagesXToY(ellipsesPointLeft+1, paginate.config.numberOfPages));
                                break;
                            case 'both':
                                const firstEllipsesPoint=scope.paginate.currentPage - (Math.ceil(paginate.config.howManyPagesWeCanShow/2)-2);
                                const secondEllipsesPoint=scope.paginate.currentPage + (Math.floor(paginate.config.howManyPagesWeCanShow/2)-1);
                                pages.push(paginate.render.pageNumber(1));
                                pages.push(paginate.render.ellipses(firstEllipsesPoint));
                                pages.push(paginate.render.pagesXToY(firstEllipsesPoint+1, secondEllipsesPoint-1));
                                pages.push(paginate.render.ellipses(secondEllipsesPoint));
                                pages.push(paginate.render.pageNumber(paginate.config.numberOfPages));
                                break;
                        };
                        return pages;
                    },
                    pageContainer:() => {
                        const pageContainer = $(`<span class="${paginate.config.pageContainerClass}"></span>`);
                        paginate.selectors.$pageContainer = pageContainer;
                        paginate.render.pageNumbers().forEach((page) => {
                            pageContainer.append(page);
                        });
                        return pageContainer;
                    }
                }
            };

            $timeout(() => {
                paginate.initScope();
                paginate.render.init();
                angular.forEach(paginate.watchers,(initWatcher) => {
                    initWatcher();
                });
            });
        }
    };
}]);