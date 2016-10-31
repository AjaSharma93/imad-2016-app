var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool=require('pg').Pool;

var config={
    user:'ajasharma93',
    database: 'ajasharma93',
    host: 'db.imad.hasura-app.io',
    port: '5432',
    password: process.env.DB_PASSWORD
}
var app = express();
app.use(morgan('combined'));

var pool = new Pool(config); //declaring a connection pool for database queries;

//details of the about tab
var about={
	selected2: 'class="selected2"',
	content:`
	<div class="inline">
		<img class="resizeProfileImg" src="/ui/images/me.jpg" alt="My Profile">
		<div id="wrapper">
			<p>Name: Aja Sharma</p>
			<p>From Bangalore, Karnataka</p>
			<p>Graduated in B.E(E.C.E) in 2016<p>
			<p>Android and Java developer</p>
			<p>Interests: Coding, Football, Music, Gaming</p>
			<p>Thrilled to work with IMAD</p>
		</div>
	</div>`
};

//details of the contact tab
var contact={
	selected3: 'class="selected3"',
	content:`
	<div class="centeredtext text-big whitetext neontext">
		<p>
			<p>Email: aja.sharma1101@gmail.com</p>
			<p>GitHub: www.github.com/AjaSharma93</p>
		</p>
	</div>`
};


//template for creating the webpages of home, about, contact tabs
function createTemplate(data){
	var selected1=data.selected1;
	var selected2=data.selected2;
	var selected3=data.selected3;
	var selected4=data.selected4;
	var content=data.content;
	var htmlTemplate=`
	<!doctype html>
	<html>
		<head>
			<!-- Bootstrap compiled and minified CSS -->
			<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" 
			integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
			<link href="/ui/css/style.css" rel="stylesheet" />
			<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.5.2/animate.min.css">
			<!-- latest jQuery direct from google's CDN -->
			<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js">
			</script>
			<meta name="viewport" content="width=device-width, initial-scale=1">
		</head>
		<body class="bgimg">
			<div class="navigation menu">
				<ul>
					<li ${selected1}><a href="/" ><p class="bold animated bounceInLeft">Home</p></a></li>
					<li ${selected2}><a href="/about"  ><p class="bold animated bounceInLeft">About Me</p></a></li>
					<li ${selected3}><a href="/contact" ><p class="bold animated bounceInLeft">Contact</p></a></li>
					<li ${selected4}><a href="/articles"><p class="bold animated bounceInLeft">Articles</p></a></li>
					<li id="Share" class="animated bounceInRight">
						<a href="https://twitter.com/ajasharma1101" target="_blank" style="text-decoration:none;">
						<img src="https://g.twimg.com/dev/documentation/image/Twitter_logo_blue_32.png" alt="Twitter" style="border:0;width:32px;height:32px"></a>
					</li>
					<li id="Share" class="animated bounceInRight">
						<a href="//plus.google.com/u/0/106415896484965862024?prsrc=3"rel="publisher" target="_blank" style="text-decoration:none;">
						<img src="//ssl.gstatic.com/images/icons/gplus-32.png" alt="Google+" style="border:0;width:32px;height:32px;"/>
						</a>
					</li>
					<li id="Share" class="bold"><p class="animated bounceInRight">Follow me on</p><li>
				</ul>
			</div>
			${content}
			<script type="text/javascript" src="/ui/main.js">
			</script>
		</body>
	</html>	`;
	return htmlTemplate;
}


app.use('/ui/images', express.static(path.join(__dirname,'ui','images'))); //getting the images from the images directory
app.use('/ui/css', express.static(path.join(__dirname,'ui','css'))); //getting the stylesheets
app.use('/ui/js', express.static(path.join(__dirname,'ui','js'))); //get the javascript file
app.use('/ui/fonts', express.static(path.join(__dirname,'ui','fonts'))); //get any fonts required

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html')); //homepage
});

app.get('/contact', function(req, res){
	res.send(createTemplate(contact)); //contacts tab
});

app.get('/about', function(req, res){
	res.send(createTemplate(about)); //about tab
});

app.get('/articles', function(req, res){
	res.sendFile(path.join(__dirname,'ui','articles.html')); //articles tab
});



app.get('/ui/main.js', function(req, res){
	res.sendFile(path.join(__dirname, 'ui','main.js'))
});



//Code below is used to add comments to respective articles page
app.get('/articles/:articleName/commentry', function(req, res)
{
	var name=req.query.name;
	var email=req.query.email;
	var articleName=req.params.articleName;
	var comment=req.query.comment;
	
	if(name!=='' && comment!=='')
	{
		if(email!=='')
		{
			var re=/\S+@\S+\.\S+/; //simple email validation regex
			var valid= re.test(email); //check the validity against string@string.com
			if(!valid)
			{
				res.send("Invalid Email");
			}
		}
		pool.query('INSERT INTO "Comments" values($1,$2,$3,$4,$5)',['now()',articleName, name, email, comment], 
		function(err, result)
		{
			if(err)
			{
				res.send(err.toString());
			}
			else
			{
				res.send("Comment submitted successfully for "+articleName);
			}
		});
	}
	else
	{
		res.send("Fill in all the details");
	}
	
});

//template for creating articles
function articleTemplate(data, commentData)
{
	var articleTitle=data.article_title;
	var articleHeading=data.article_heading;
	var articleContent=data.article_content;
	var publishDate=data.publish_date;
	var commentList='';
	for(var i=0; i<commentData.length; i++)
	{
		commentList+=`<p class="italics">${commentData[i].comment_author}
					  posted on ${commentData[i].comment_date.toDateString()} 
					  ${commentData[i].comment_date.toLocaleTimeString()}</p>
					  <p>${commentData[i].comment}</p><hr/>`;
	}
	var template=`
	<!doctype html>
		<html>
			<head>
				<title>${articleTitle}</title>
				<link href="/ui/css/articles.css" rel="stylesheet" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
			</head>
			<body>
				<div class="container">
					<h1 class="center">${articleHeading}</h1>
					<hr/>
					<p>${publishDate.toDateString()}</p>
					<p>${articleContent}</p>
					<h3>Comments:</h3><hr/>
					${commentList}
				</div>
			</body>
		</html>`;
		
		return template;
	
}


app.get('/articles/:articleName', function(req, res){
	var articleName=req.params.articleName; //article name obtained for GET request.
	pool.query('SELECT * FROM "Articles" where article_title= $1', [articleName], 
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

var port = 8080; // Use 8080 for local development because you might already have apache running on 80
app.listen(8080, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});
