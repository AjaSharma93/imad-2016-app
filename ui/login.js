
$("#submit_btn").click(function(){
    var user=$("#username").val();
    var pass=$("#password").val();
            
    $.ajax({
        url: "/login",
        type: "POST",
        content: "json",
        data: JSON.stringify({username: user, password: pass}),
        contentType: "application/json",
        success: function(data){
            alert(data.toString());
        },
        error: function(xhr, status, errorThrown){
            alert(xhr.responseText);
        }
    });
   });
