angular.module('app')
.controller('cuiTableCtrl', function(User, $pagination, $state, $stateParams) {

	const cuiTable = this

	cuiTable.sortBy = {}
	cuiTable.page = parseInt($stateParams.page || 1)
	cuiTable.pageSize = parseInt($stateParams.pageSize || $pagination.getUserValue() || $pagination.getPaginationOptions[0])

    // HELPER FUNCTIONS START --------------------------------------------------

    const updateStateParams = ({ page, pageSize } = {}) => {
        if (page && pageSize) {
            cuiTable.sortBy.page = page
            cuiTable.sortBy.pageSize = pageSize
        }
        $state.transitionTo('cuiTable', cuiTable.sortBy, { notify: false })
    }

    const populateUsers = ({ page, pageSize, userList} = {}) => {
        cuiTable.userList = _.drop(cuiTable.unparsedUserList, (page -1) * pageSize).slice(0, pageSize)
        if (cuiTable.sortBy.hasOwnProperty('sortBy')) {
            cuiTable.sortingCallbacks[cuiTable.sortBy.sortBy]()
        }
    }

    // HELPER FUNCTIONS END ----------------------------------------------------

    // ON LOAD START -----------------------------------------------------------

    cuiTable.unparsedUserList = cuiTable.userList = User.getUserList()

    cuiTable.cuiTableOptions = {
        paginate: true,
        recordCount: cuiTable.unparsedUserList.length,
        pageSize: cuiTable.pageSize,
        initialPage: cuiTable.page,
        onPageChange: (page, pageSize) => {
            updateStateParams({ page, pageSize })
            populateUsers({ page, pageSize })
        }
    }

    cuiTable.cuiTableOptions.onPageChange(cuiTable.page, cuiTable.pageSize)

    // ON LOAD END -------------------------------------------------------------

    // ON CLICK FUNCTIONS START ------------------------------------------------

    cuiTable.sortingCallbacks = {
        name () {
            cuiTable.sortBy.sortBy = 'name'
            cuiTable.sort(['name.given', 'name.surname'], cuiTable.sortBy.sortType)
            updateStateParams()
        },
        username () {
            cuiTable.sortBy.sortBy = 'username'
            cuiTable.sort('username', cuiTable.sortBy.sortType)
            updateStateParams()
        },
        status () {
            cuiTable.sortBy.sortBy = 'status'
            cuiTable.sort('status', cuiTable.sortBy.sortType)
            updateStateParams()
        }
    }

    cuiTable.sort = (sortBy, order) => {
        cuiTable.userList = _.orderBy(cuiTable.userList, sortBy, order)
    }

    cuiTable.userSearch = (user) => {
        if (!cuiTable.userSearchQuery) return user
        else {
            const searchQuery = angular.lowercase(cuiTable.userSearchQuery)
            const fullName = user.name.given + ' ' + user.name.surname
            
            return (angular.lowercase(fullName).indexOf(searchQuery) || '') !== -1
                || (angular.lowercase(user.status).indexOf(searchQuery) || '') !== -1
                || (angular.lowercase(user.username).indexOf(searchQuery) || '') !== -1
        }
    }

    // ON CLICK FUNCTIONS END --------------------------------------------------

})
