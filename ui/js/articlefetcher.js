$(document).ready(function(){
	$("#articleslist").html(`<span class="vertical-align">
								<i class=" whitetext fa fa-circle-o-notch fa-spin fa-5x fa-fw"></i>
								<span class="whitetext"><h1>Loading...</h1></span>
							</span>`);
	$.get('/fetch-articles', function(data, status){
		$('#articleslist').html(data);
	}).fail(function(){
		$('#articleslist').html('<h1 class="whitetext">Failed</h1>');
	});
});