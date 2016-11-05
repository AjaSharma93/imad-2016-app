
$("#submit_btn").click(function(){
    var user=$("#username").val();
    var pass=$("#password").val();
            
    $.ajax({
        url: "/login",
        type: "POST",
        data: {username: user, password: pass},
        contentType: "application/json; charset=UTF-8;",
        success: function(data){
            alert(data.toString());
        },
        fail: function(data){
            alert(data.toString());
        }
    });
   });
