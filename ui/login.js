var user=$("#username").val();
var pass=$("#password").val();
$("#submit_btn").click(function(){
  $.post("/login", {username: user, password: pass},
    function(data)
      {
        alert(data.toString());
      }, "json")
        .fail(function(){
          alert("failed");
        });
   });
