/*
This script sends the comments to the server and receives the response
*/
$("#submit_btn").click(function(){
	var commentInput=$("#comment");
	var comment=commentInput.val();
	var articlepath=document.getElementById('articleWindow').contentWindow.location.pathname 
						|| document.getElementById('articleWindow').contentDocument.location.pathname;
	
	
	//send the details to the server using a get request and get a response.
	$.get(articlepath+"/commentry?comment="+comment,
		function(data, status){
			alert(data);
			commentInput.val('');
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