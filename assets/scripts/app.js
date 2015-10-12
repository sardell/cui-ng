(function(angular){

	angular
	.module('app',[])
	.controller('appCtrl',[function(){
		var app=this;
		app.user={
			name: 'Bill Murray',
			avatar: '//www.fillmurray.com/200/200'
		};
		app.logo='assets/img/logo.png'
	}])


	//cui-header ----------------------------------
	.directive('cuiHeader',[function(){
		return{
			restrict: 'E',
			replace:true,
			templateUrl:'assets/angular-templates/header.html',
			link: function(scope,elem,attrs){
				//read attributes
				var logo;
				attrs.logo!==undefined ? logo = attrs.logo : true;
				attrs.user!==undefined ? scope.cuiUser = attrs.user : true;
				attrs.topMenu!==undefined ? scope.cuiTopMenu=true : scope.cuiTopMenu=false;
				
				//set logo image
				$logo = document.querySelector('.cui__header__logo');
				$logo.style.backgroundImage = 'url("' + logo + '")';
			}
		}
	}])


	//cui-avatar -----------------------------------
	.directive('cuiAvatar',[function(){
		return{
			restrict: 'E',
			templateUrl:'assets/angular-templates/avatar.html',
			link:function(scope,elem,attrs){
				//read attributes
				var user;
				attrs.user!==undefined ? user=attrs.user : console.log('No user passed.');

				scope.userName=user.name;
			}
		}
	}]);

})(angular)