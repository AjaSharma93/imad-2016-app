/*
This script sends the comments to the server and receives the response
*/
$("#submit_btn").click(function(){
	var fname=$("#fname");
	var name=fname.val();
	var commentInput=$("#comment");
	var comment=commentInput.val();
	var emailInput=$("#emailID");
	var email=emailInput.val();
	var articlepath=document.getElementById('articleWindow').contentWindow.location.pathname 
						|| document.getElementById('articleWindow').contentDocument.location.pathname;
	
	
	//send the details to the server using a get request and get a response.
	$.get(articlepath+"/commentry?name="+name+"&comment="+comment+"&email="+email,
		function(data, status){
			alert(data);
			fname.val('');
			commentInput.val('');
			emailInput.val('');
    });
}
);

//JScrollPane for the articles list 
$(document).ready(function(){
	$('.scroll-pane').jScrollPane();
});


//addition of articles list text effect
$("#article_list a").bind("click", function(){
        $("#article_list a").removeClass("clicked"); // Remove all highlights
        $(this).addClass("clicked"); // Add the class only for actually clicked element
});