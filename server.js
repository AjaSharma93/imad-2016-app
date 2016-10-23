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

counter=0;

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



//Code below is used to add comments to respective lists of the articles page

var art1comments=[];
var art2comments=[];
var art3comments=[];
var art4comments=[];

//adds the comments to the respective article with date and time on recieving request

app.get('/commentry', function(req, res)
{
	var details=req.query.details;
	var links=JSON.parse(details);
	var link=links[2];
	var currentDate=new Date();//parse the current date and time of the server
	
	//get the date and time in the following format: DD:MM:YYYY HH:MM:SS TimeZone 
	var serverTime= currentDate.getDate()+"/"+(currentDate.getMonth()+1)+"/"+currentDate.getFullYear()+" " 
					+currentDate.getHours()+":"+currentDate.getMinutes()+":"+currentDate.getSeconds()+" "
					+currentDate.toString().split('(')[1].slice(0, -1)  //gets the time zone
					
	links.push(serverTime);
	details=JSON.stringify(links); //added server time to JSON object
	if(link=="/articles/articleOne") art1comments.push(details);             //adding the comments to the 
	else if(link=="/articles/articleTwo") art2comments.push(details);        //respective articles
	else if(link=="/articles/articleThree") art3comments.push(details);
	else if(link=="/articles/articleFour") art4comments.push(details);
	else res.send('Invalid input');
	
	res.send("Comment submitted successfully");
});

//Object with article details

var articleArray={
	articleOne: {
	content: `
	<h1 style="text-align: center">Article 1</h1>
	<p> This is the content of article 1.This is the content of article 1.This is the content of article 1.This is the content of article 1.
	This is the content of article 1.This is the content of article 1.This is the content of article 1. </p>`,
	comment: art1comments },
	
	articleTwo:{ 
	content:`
	<h1 style="text-align: center">Article 2</h1>
	<p> This is article 2</p>`, 
	comment: art2comments},
	
	articleThree:{ 
	content: `
	<h1 style="text-align: center">Article 3</h1>
	<p> This is article 3</p>`,
	comment: art3comments},
	
	articleFour:{
	content: `
	<h1 style="text-align: center">Article 4</h1>
	<p> This is article 4</p>`,
	comment: art4comments}
}

//template for creating articles
function articleTemplate(data)
{
	var content=data.content;
	var comment=data.comment;
	var detailsArray=[];
	var commentList='';
	var detailsList='';
	if(comment== '')
	{
		for(var j=0;j<comment.length;j++)
		{
			detailsList=JSON.parse(comment[j]); //parse the comments JSON object
			for(var i=0; i<detailsList.length;i++)
				detailsArray.push(detailsList[i]); //comments list is parsed to an array of details
		}
		for ( i=0; i<detailsArray.length; i=i+5)
		{
			commentList+='<span class="bold">'+detailsArray[i]+'</span> posted on <span class=italics>'+detailsArray[i+4] +'</span><p>'+detailsArray[i+1]+'</p><hr/>'; //html statement formed from detailsArray
		}
		
		/* 	detailsArray[i]->Name 
			detailsArray[i+1]->Comment
			detailsArray[i+2]->Article Path
			detailsArray[i+3]->Email ID
			detailsArray[i+4]->Time when comment was posted
		*/
	} 
	
	
	
	//template for the creation of the article page
	var template=`
	<!doctype html>
		<html>
			<head>
				<link href="/ui/css/articles.css" rel="stylesheet" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
			</head>
			<style type="text/css">
			body{
				font-family: Georgia, serif;
			}
			</style>
			<body>
				<div class="container">
					${content}
					<h3>Comments:</h3><hr/>
					
				</div>
			</body>
		</html>`;
		
	return template;
}

var pool = new Pool(config)
app.get('/articles/articleOne', function(req, res){
	//var articleName=req.params.articleName;
	
	pool.query("SELECT * FROM article WHERE id=1;", function(err, result)
	{
	    if(err)
	    {
	        res.status(500).send(err.toString());
	    }
	    else
	    {
	        if(result.rows.length===0)
	        {
	            res.status(404).send('Article not found');
	        }
	        else
	        {
	            var articleData=result.rows[0];
	            res.send(articleTemplate(articleData));
	        }
	    }
	    
	});
	
});


app.get('/test-db', function(req, res)
{
    pool.query('SELECT * FROM TEST', function(err, result)
    {
       if(err)
       {
           res.status(500).send(err.toString());
       }
       else
       {
           res.send(JSON.stringify(result.rows));
       }
    });
});


var port = 8080; // Use 8080 for local development because you might already have apache running on 80
app.listen(8080, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});
