
$("#submit_btn").click(function(){
    var user=$("#username").val();
    var pass=$("#password").val();
    $.post("/login", {username: user, password: pass},
        function(data)
          {
            alert(data.toString());
          }, "json")
            .fail(function(){
              alert("failed");
            });
   });
