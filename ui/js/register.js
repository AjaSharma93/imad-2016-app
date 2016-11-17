//registration page 
$("#submit_btn").click(function(){
    var user=$("#username").val();
	var email=$("#email").val();
    var pass=$("#password").val();
            
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
            if(xhr.status=== 500)
			{
				 alert('Username already taken');
			}
			else
			{
            alert(xhr.responseText);
			}
        }
    });
   });