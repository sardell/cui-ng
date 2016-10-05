angular.module('app')
.controller('paginateCtrl', function($scope) {

	const paginate = this

    $scope.$on('$stateChangeSuccess', (event, toState, toParams, fromState, fromParams) => {
        if (toParams.page) paginate.page = parseInt($stateParams.page)
    })

    $scope.$watch('paginate.count', (newCount) => {
		if (paginate.rerenderPaginate) paginate.rerenderPaginate()
    })

    paginate.handlePageChange = (page) => {
        paginate.currentPage = page
    }

})
