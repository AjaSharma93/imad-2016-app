
$("#submit_btn").click(function(){
    var user=$("#username").val();
    var pass=$("#password").val();
            
    $.ajax({
        url: "/login",
        type: "POST",
        data: {username: user, password: pass},
        contentType: "application/json",
        success: function(data){
            alert(data.toString());
        },
        error: function(errorThrown){
            alert(errorThrown.toString());
        }
    });
   });
