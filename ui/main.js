console.log('Loaded!');

var submit=document.getElementById('submit_btn');
var details=[];
submit.onclick=function(){
	var request=new XMLHttpRequest();
	request.onreadystatechange=function(){
		if(request.readyState==XMLHttpRequest.DONE){
			if(request.status==200)
			{
				var success=request.responseText;
				var acknowledge=document.getElementById('acknowledge');
				acknowledge.innerHTML=success.toString();
				details=[];
			}
		}
	}
	var fname=document.getElementById('fname');
	var name=fname.value;
	var commentInput=document.getElementById('comment');
	var comment=commentInput.value;
	var url=document.getElementById('articleWindow').contentWindow.location.pathname || document.getElementById('articleWindow').contentDocument.location.pathname;
	details.push(name);
	details.push(comment);
	details.push(url);
	request.open('GET','/commentry?details='+JSON.stringify(details), true);
	request.send(null);
};


