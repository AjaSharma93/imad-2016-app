/* authenticate the user */

$(document).ready(function(){
	$.get('/check-login',function(data, status){
		$('#login').html(data.toString());
	});
});