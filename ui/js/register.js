//registration page 
$("#submit_btn").click(
function(){
	var user=$("#username").val();
	var email=$("#email").val();
	var pass=$("#password").val();
	$("#submit_btn").html('<i class="fa fa-circle-o-notch fa-spin fa-lg fa-fw"></i> Please wait...');
	$('#notifyuser').html('');
	$('#notifyemail').html('');
	$.ajax({
			url: "/create-user",
			type: "POST",
			content: "json",
			data: JSON.stringify({username: user, email: email, password: pass}),
			contentType: "application/json",
			success: function(data){
				alert(data.toString());
				window.location.href='/login.html';
				
			},
			error: function(xhr, status, errorThrown){
				if(xhr.status=== 403)
				{
					if(xhr.responseText==='username invalid')
					{
						$("#notifyuser").html('Invalid username. Use only alphanumeric characters(A-Z, a-z, 0-9) and _');
					}
					else if(xhr.responseText==='email invalid')
					{
						$("#notifyemail").html('Email is invalid');
					}
					else if(xhr.responseText==='enter your details')
					{
						alert('Enter your details');
					}
					else if(xhr.responseText==='username taken')
					{
						$("#notifyuser").html('Username unavailable. Try another.');
					}
					else if(xhr.responseText==='email taken')
					{
						$("#notifyemail").html('Email is already registered to another account');
					}
					else{
						alert(xhr.responseText);
					}
				}
				else
				{
				alert(xhr.responseText);
				}
				$("#submit_btn").html('Login');
			}
		});
});