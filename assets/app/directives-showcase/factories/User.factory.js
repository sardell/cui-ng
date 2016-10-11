angular.module('app')
.factory('User', function($rootScope) {
	
	return {
        getUser: () => {
            return $rootScope.appUser
        },
        setUser: (user) => {
            $rootScope.appUser = user
        },
        getUserList: () => {
        	return [{
				name: {
					given: 'Steven',
					surname: 'Seagal'
				},
				status: 'Active',
				username: 'AkidoMaster1952'
			}, {
				name: {
					given: 'Bill',
					surname: 'Murray'
				},
				status: 'Pending',
				username: 'MysteriousMurray111'
			}, {
				name: {
					given: 'Mr.',
					surname: 'Anderson'
				},
				status: 'Pending',
				username: 'Neo'
			}, {
				name: {
					given: 'Ricardo',
					surname: 'Developer'
				},
				status: 'Locked',
				username: 'Meida'
			}, {
				name: {
					given: 'Peter',
					surname: 'Developer'
				},
				status: 'Active',
				username: 'Peter1123'
			}, {
				name: {
					given: 'The',
					surname: 'Tad'
				},
				status: 'Active',
				username: 'Thadius'
			}, {
				name: {
					given: 'Bruce',
					surname: 'Wayne'
				},
				status: 'Pending',
				username: 'DefinitelyNotBatman'
			}, {
				name: {
					given: 'Bob',
					surname: 'Marley'
				},
				status: 'Active',
				username: 'Smokin.Marley'
			}, {
				name: {
					given: 'Mike',
					surname: 'Z'
				},
				status: 'Locked',
				username: 'Mike.Zee'
			}, {
				name: {
					given: 'Bob',
					surname: 'Ross'
				},
				status: 'Active',
				username: 'HappyLittleMistake'
			}, {
				name: {
					given: 'Orin',
					surname: 'Developer'
				},
				status: 'Active',
				username: 'Orin.Developer'
			}, {
				name: {
					given: 'Shane',
					surname: 'Developer'
				},
				status: 'Active',
				username: 'Shane.Developer'
			}]
        }
    }

})
