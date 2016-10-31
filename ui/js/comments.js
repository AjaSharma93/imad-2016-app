var submit=document.getElementById('submit_btn');
/*var details=[];
submit.onclick=function(){
	var request=new XMLHttpRequest();
	var fname=document.getElementById('fname');
	var name=fname.value;
	var commentInput=document.getElementById('comment');
	var comment=commentInput.value;
	var emailInput=document.getElementById('emailID');
	var email=emailInput.value;
	request.onreadystatechange=function(){
		if(request.readyState==XMLHttpRequest.DONE){
			if(request.status==200)
			{
				var success=request.responseText;
				alert('Comment submitted successfully!')
				details=[];
				fname.value='';
				commentInput.value='';
				emailInput.value='';
			}
		}
	}
	var articlepath=document.getElementById('articleWindow').contentWindow.location.pathname || document.getElementById('articleWindow').contentDocument.location.pathname;
	details.push(name);
	details.push(comment);
	details.push(articlepath);
	details.push(email);
	request.open('GET','/commentry?details='+JSON.stringify(details), true);
	request.send(null);
}; */

$("#submit_btn").click(function(){
	var fname=$("#fname");
	var name=fname.val();
	var commentInput=$("#comment");
	var comment=commentInput.val();
	var emailInput=$("#emailID");
	var email=emailInput.val();
	var articlepath=document.getElementById('articleWindow').contentWindow.location.pathname 
						|| document.getElementById('articleWindow').contentDocument.location.pathname;
	
	
	//send the JSON object(details) to the server using a get request and get a response.
	$.get(articlepath+"/commentry?name="+name+"&comment="+comment+"&email="+email,
		function(data, status){
			alert(data);
			fname.val('');
			commentInput.val('');
			emailInput.val('');
    });
}
);


$(document).ready(function(){
	$('.scroll-pane').jScrollPane();
});