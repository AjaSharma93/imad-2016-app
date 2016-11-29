module.exports=function(app, pool){
		//template for creating articles
		function articleTemplate(data, commentData)
		{
			var articleTitle=data.article_title;
			var articleHeading=data.article_heading;
			var articleContent=data.article_content;
			var publishDate=data.publish_date;
			var commentList='';
			var imgsrc='';
			var author_name=data.author_name;
			if(data.article_image)
			{
				imgsrc=data.article_image;
			}
			for(var i=0; i<commentData.length; i++)
			{
				safe_tags(commentData[i].comment, function(data){
				commentList+=`<p><span class="bold">${commentData[i].comment_author}</span>
							  posted on <span class="italic">${commentData[i].comment_date.toDateString()} 
							  ${commentData[i].comment_date.toLocaleTimeString()}</span></p>
							  <p>${data}</p><hr/>`;
				});
			}

			var template=`
			<!doctype html>
				<html>
					<head>
						<title>My WebApp</title>
						<!-- latest jQuery direct from google's CDN -->
						<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
						<!-- FontAwesome CDN -->
						<script src="https://use.fontawesome.com/70cfc12727.js"></script>
						<!-- Bootstrap compiled and minified JS -->
						<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
						<!-- styles needed by jScrollPane -->
						<link type="text/css" href="/ui/css/jquery.jscrollpane.css" rel="stylesheet" media="all" />

						<!-- the mousewheel plugin - optional to provide mousewheel support -->
						<script type="text/javascript" src="/ui/js/jquery.mousewheel.js"></script>

						<!-- the jScrollPane script -->
						<script type="text/javascript" src="/ui/js/jquery.jscrollpane.min.js"></script>
						
						<!-- Bootstrap compiled and minified CSS -->
						<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" 
						integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
						
						<!-- Animate.css for text animations -->
						<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.5.2/animate.min.css">
						
						<link href="/ui/css/footer.css" rel="stylesheet" />
						<link href="/ui/css/style.css" rel="stylesheet" />
						<link href="/ui/css/articles.css" rel="stylesheet" />
						
						<!-- Quicksand font -->
						<link rel="stylesheet" type="text/css" href="//fonts.googleapis.com/css?family=Quicksand" />
						<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
						<script>
							$(function(){
								$("#navbar").load("/navbar.html", function(){
									$("ul li:nth-child(4)").addClass("selected4");
									$.get('/check-login',function(data, status){
									$('#login').html(data.toString());
									});
								});
							});
						</script>
					</head>
					<body class="bgimg">
						<nav>
							<div class="navigation menu" id="navbar">
							 </div>
						</nav>
						<div class="container whitetext">
							<div class="article">
								<button id="back" class="btn btn-danger"><i class=" glyphicon glyphicon-chevron-left"></i>Go back</button>
								<h1 class="center">${articleHeading}</h1>
								<hr/>
								<img src="${imgsrc}" alt="${articleHeading}"  class="img-responsive center-block" width="60%"/>
								<hr/>
								<p class="bold">Author:${author_name}</p>
								<p>${publishDate.toDateString()}</p><hr/>
								<span class="content">${articleContent}</span>
								<button id="previous" class="btn btn-danger">
									<i class=" glyphicon glyphicon-chevron-left"></i>Previous
								</button>
								
								<button id="next" class="right btn btn-primary">
									Next<i class=" glyphicon glyphicon-chevron-right"></i>
								</button>
								
								<h3>Comments:</h3><hr/>
								${commentList}
								<div id="commentbox">
								</div>
							</div>
						</div>
						<script>
						$(document).ready(function()
							{
								$.get('/comments-authenticate', function(data, status){
									$("#commentbox").html(data);
								});
							});
						$("#back").click(function()
						{
							window.location.href="/articles";
						});
						</script>
						
						<footer>
						</footer>
						<script>
							  $(document).ready(function(){
								  $.get('/footer.html', function(data, status){
									$("footer").html(data);
								  });
							  });
						</script>
						<script src="/ui/js/prev_next.js"></script>
					</body>
				</html>`;
				return template;
		}




		function safe_tags(str, callback) { //tag replacement of comments
			str=str.replace(/&/g,'&amp;')
				.replace(/</g,'&lt;')
				.replace(/>/g,'&gt;')
				.replace(/"/g, '&quot;')
				.replace(/'/g, '&#39;');
			str=str.replace(new RegExp("&lt;br /&gt;", "g"), "<br />");
			callback(str) ;
		}


		app.get('/articles/:articleName', function(req, res){
			var articleName=req.params.articleName; //article name obtained for GET request.
			pool.query('SELECT * FROM "Articles" a, "Authors" b where article_title= $1 and a.author_id=b.author_id', [articleName], 
			function(err, result)
			{
				if(err)
				{
					res.status(500).send(err.toString()); //error occurred during query
				}
				else{
					if(result.rows.length === 0)
					{
						res.status(404).send('Article not found'); //for return of no rows
					}
					else
					{
						var articleData=result.rows[0];
						
						pool.query('SELECT * FROM "Comments" where article_title= $1',[articleData.article_title], 
						function(err, result)
						{
							if(err)
							{
								res.status(500).send(err.toString()); //error occurred during query
							}
							else
							{
								var commentData;
								if(result.rows.length===0)
								{
									commentData=''; //no comments on the article
								}
								else
								{
									commentData=result.rows;
								}
								res.send(articleTemplate(articleData, commentData));
							}
						});
						
						
					}
				}
			});
			
		}); 
		
		
		//Functionality for the next and previous buttons of a particular article
		app.get('/prev-article/articles/:ArticleName', function(req, res){
			var currentArticle=req.params.ArticleName;
			pool.query(`select a.prev_article from (select article_title, LAG(article_title) over(order by article_id asc) as prev_article from "Articles") a
							where a.article_title=$1`, [currentArticle],
			function(err, result)
			{
				if(err)
				{
					res.status(500).send(err.toString());
				}
				else
				{
					if(result.rows.length===0)
					{
						res.send(currentArticle);
					}
					else
					{
						var prevArticle=result.rows[0].prev_article;
						if(prevArticle!==null)
							res.send(prevArticle);
						else
							res.send(currentArticle);
					}	
				}
			});
		});
		
		
		app.get('/next-article/articles/:ArticleName', function(req, res){
			var currentArticle=req.params.ArticleName;
			pool.query(`select a.next_article from (select article_title, LEAD(article_title) over(order by article_id asc) as next_article from "Articles") a
							where a.article_title=$1`, [currentArticle],
			function(err, result)
			{
				if(err)
				{
					res.status(500).send(err.toString());
				}
				else
				{
					if(result.rows.length===0)
					{
						res.send(currentArticle);
					}
					else
					{
						var nextArticle=result.rows[0].next_article;
						if(nextArticle!==null)
							res.send(nextArticle);
						else
							res.send(currentArticle);
					}	
				}
			});
		});
}