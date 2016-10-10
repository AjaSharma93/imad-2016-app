var submit=document.getElementById('submit_btn');
var details=[];
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
				var acknowledge=document.getElementById('acknowledge');
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
};


$(document).ready(function(){
	$('.scroll-pane').jScrollPane();
});