angular.module('app')
.controller('cuiAvatarCtrl', function($timeout) {

	const cuiAvatar = this

	cuiAvatar.appUser = {
		names: ['Bill', 'Murray'],
		email: 'orin.fink@thirdwavellc.com'
	}

	$timeout(() => {
		cuiAvatar.appUser.avatar = 'https://www.fillmurray.com/140/100'
	}, 1500)

})
