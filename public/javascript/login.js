/*Function called when the user wants to sign up using facebook */
function facebookSignUp(){

	//first it checks if the user is already connected in facebook and if the user has authorized our application
	FB.getLoginStatus(function(response){

		if(response.status == 'not_authorized'){
			FB.login(function(response){

				if(response.authResponse){

					FB.api('/me?fields=email,name,location,hometown,picture', function(data){
						console.log(data);
						signUpForm(data);
					});

				}

			},{
				scope:'public_profile,email,user_location,user_hometown',
				retun_scopes:true
			});
		}

	});

}

/*Function called when the user wants to connect through facebook*/
function facebookLogIn(){

	FB.getLoginStatus(function(response){

		if(response.status == "connected"){
	
			FB.login(function(response){

				if (response.authResponse) {

					    FB.api('/me', function(data) {
					    	console.log(data);
					    	logForm(data);
					    });
					

			    } else {
			    	console.log('User cancelled login or did not fully authorize.');
			    }

			},{
				scope:'public_profile',
				retun_scopes:true
			});

		}

	});

}

/*Auxiliary function that creates the login form to send to the server*/
function logForm(response){

	var form = document.createElement('form');
	var username = document.createElement('input');

	form.method = "POST";
	form.action = "/facebookLog";

	username.value = response.name;
	username.name = "username";
	form.appendChild(username);

	document.body.appendChild(form);

	form.submit();
}

/*Auxiliary function that creates the sign up form to send to the server*/
function signUpForm(data){

	var form = document.createElement('form');
	var username = document.createElement('input');
	var password = document.createElement('input');
	var email = document.createElement('input');
	var name = document.createElement('input');
	var profilePicture = document.createElement('input');

	form.method = "POST";
	form.action = "/facebookSignUp";

	username.value = data.name;
	username.name = "username";
	name.value = data.name;
	name.name = "name";
	password.value =  data.id;
	password.name = "password"
	email.value = data.email;
	email.name = "email";
	profilePicture.value = data.picture.data.url;
	profilePicture.name = "profilePicture"

	form.appendChild(username);
	form.appendChild(password);
	form.appendChild(email);
	form.appendChild(name);
	form.appendChild(profilePicture);

	document.body.appendChild(form);

	form.submit();

}