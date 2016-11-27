
module.exports=function(app, pool){
	app.get('/fetch-articles', function(req, res){
		var articleList='<div class="row fadeIn"> ';
		pool.query('SELECT * FROM "Articles" a, "Authors" b where a.author_id=b.author_id', //get all the details about the Articles and their authors
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
					res.status(404).send('Failed to fetch articles');
				}
				else{	
						var i=0;	
						generateList(i, result, articleList, function(data){
							if(data!='error')
							{
							data+="</div>";
							res.send(data);
							}
							else
							{
								res.send('error');
							}
						});
					}
			}
		});
	});
	
	
	function generateList(i, result, articleList, callback) //uses a recursive function with callback to generate a list of articles
	{
		var article=result.rows[i];
		getCommentNumber(article.article_title, function(comment_count){
			if(comment_count!=='error')
			{
				var articleSummary=article.article_content.substring(0, 200)+"...";
				articleList+=`
				<div class="col-md-4">
					<div class="panel panel-danger">
						<div class="panel-heading">
							${article.article_heading}
						</div>
						<div class="panel-content">
							${articleSummary}
							<br/>
							<span class="bold right comment_count_color">${comment_count}</span>
							<i class="glyphicon glyphicon-comment right"></i>
						</div>
						
						<div class="panel-footer">
							<span class="bold">Author:</span>${article.author_name}
							<span class="right">
								<a href="/articles/${article.article_title}">Read more...</a>
							</span>
						</div>
					</div>
				</div>
				`;
				if(i<result.rows.length-1)
				{
					generateList(++i, result, articleList, callback);
				}
				else
				{
					callback(articleList);
				}
			}
			else{
				callback('error');
			}
		});
		
	}
	
	function getCommentNumber(atitle, callback) //returns number of comments in article
	{
		
		pool.query(' SELECT count(article_title) as numbr_comments FROM "Comments" where article_title=$1', [atitle],
			function(err, result)
			{
				if(err)
				{
					callback('error');
				}else{
					if(result.rows.length===0)
					{
						callback('error');
					}
					else
					{
						callback(result.rows[0].numbr_comments);
					}
				}
			});
	}
}