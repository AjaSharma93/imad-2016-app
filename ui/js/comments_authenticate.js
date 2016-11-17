$(document).ready(function(){
	$.get('/comments-authenticate', function(data, status)
	{
		$('.comments').html(data);
	});
});