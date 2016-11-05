$("#submit_btn").click(function{
  $.post("/login", {username: "username", password: "password"},
    function(data)
      {
        alert(data.toString());
      }, "json")
        .fail(function(){
          alert("failed");
        });
   });
