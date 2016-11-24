
module.exports=function(app, pool){
	app.get('/fetch-articles', function(req, res){
		var articleList='<div class="row fadeIn"> ';
		pool.query('SELECT * FROM "Articles"', 
		function(err, result)
		{
			if(err)
			{
				res.status(500).send(err)
			}
			else
			{
				if(result.rows.length===0)
				{
					res.status(404).send('Failed to fetch articles');
				}
				else{	var i=0;		
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
	
	
	function getAuthor(aid, callback)
	{
		pool.query('SELECT author_name FROM "Authors" WHERE author_id=$1', [aid], 
		function(err, result)
		{
			if(err)
			{
				console.log(err);
				callback('error');
			}
			else
			{
				if(result.rows.length===0)
				{
					callback('error');
				}
				else
				{
					var author=result.rows[0].author_name;
					callback(author);
				}
			}
		});
	}
	
	function generateList(i, result, articleList, callback) //uses a recursive function with callback to generate a list of articles
	{
		var article=result.rows[i];
		getAuthor(article.author_id, function(author){
			if(author!=='error')
			{
				var articleSummary=article.article_content.substring(0, 200)+"...";
				articleList+=`
				<div class="col-md-4">
					<div class="panel panel-danger">
						<div class="panel-heading">${article.article_heading}</div>
						<div class="panel-content">${articleSummary}</div>
						<div class="panel-footer">
						<span class="bold">Author:</span>${author}
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
}