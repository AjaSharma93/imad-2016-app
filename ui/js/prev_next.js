$("#previous").click(function(){
	$(".article").html(`<span class="vertical-align">
								<i class=" whitetext fa fa-circle-o-notch fa-spin fa-5x fa-fw"></i>
								<span class="whitetext"><h1>Loading...</h1></span>
							</span>`);
							
	var articletitle=window.location.pathname || document.location.pathname;
	$.get("/prev-article"+ articletitle, function(data, status){
		window.location.href="/articles/"+data;
	}).fail(function(){
		alert('failed');
	});
});


$("#next").click(function(){
	$(".article").html(`<span class="vertical-align">
								<i class=" whitetext fa fa-circle-o-notch fa-spin fa-5x fa-fw"></i>
								<span class="whitetext"><h1>Loading...</h1></span>
							</span>`);
							
	var articletitle=window.location.pathname || document.location.pathname;
	$.get("/next-article"+ articletitle, function(data, status){
		window.location.href="/articles/"+data;
	}).fail(function(){
		alert('failed');
	});
});