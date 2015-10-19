$(function(){

	var cid = cui.idm();

	// 2. OAuth test
	//var cid = cui.idm();
	cid.setIdmService('STG');
	//cid.setClientId('ApJfJyJp3tyFWs337IjmomZl40NuC1Xb');
	$('#authButton').on('click', function() {
		cid.doThreeLeggedAuth({
			clientId: 'ApJfJyJp3tyFWs337IjmomZl40NuC1Xb'			
		});
	});
	//cid.storeToken();
	cid.handleAuthResponse();


	$('#sysAuthButton').on('click', function() {
		cid.doSysAuth({
			clientId: 'ApJfJyJp3tyFWs337IjmomZl40NuC1Xb',
			clientSecret: 'sAAprMJMZtgAOPCH'
		});
	});


	var tokenButtonState = false;
	$('#showTokenButton').on('click', function() {
		tokenButtonState = !tokenButtonState;
		if (tokenButtonState) {
			$(this).text('Hide Token');
			var token = decodeURIComponent(cid.getToken());
			cui.log('token', token);
			$('#authResult').empty().append($('<span></span>').text(token).addClass('running'));			
		}
		else {
			$(this).text('Show Token');
			$('#authResult').empty();			
		}
	});


	$('#idmLogoutButton').on('click', function() {
		cid.doIdmLogout({
			idmIdentityUrl: 'https://s-platform-covs.login.stg.covapp.io'
		});
	});
	
})