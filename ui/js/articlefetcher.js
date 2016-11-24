$(document).ready(function(){
	$.get('/fetch-articles', function(data, status){
		$('#articleslist').html(data);
	}).fail(function(){
		alert("error occurred");
	});
});