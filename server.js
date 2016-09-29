var express = require('express');
var morgan = require('morgan');
var path = require('path');

var app = express();
app.use(morgan('combined'));

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


//template for creating the webpages of home, about, contact and articles
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
			<link href="/ui/style.css" rel="stylesheet" />
			<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.5.2/animate.min.css">
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

app.get('/counter', function(req, res){
	counter=counter+1;
	res.send(counter.toString());
});

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

app.get('/ui/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'style.css'));
});

app.get('/ui/images/prism', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'images','prism.jpg'));
});

app.get('/ui/animate.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'animate.css'));
});

app.get('/contact', function(req, res){
	res.send(createTemplate(contact));
});

app.get('/about', function(req, res){
	res.send(createTemplate(about));
});

app.get('/ui/images/me.jpg', function(req, res){
	res.sendFile(path.join(__dirname,'ui','images','me.jpg'));
});

app.get('/ui/main.js', function(req, res){
	res.sendFile(path.join(__dirname, 'ui','main.js'))
});

app.get('/articles', function(req, res){
	res.sendFile(path.join(__dirname,'ui','articles.html'));
});

//Code below is used to add comments to the articles page

var art1comments=[];
var art2comments=[];
var art3comments=[];
var art4comments=[];

//adds the comments to the respective article on recieving request

app.get('/commentry', function(req, res)
{
	var details=req.query.details;
	var links=JSON.parse(details);
	var link=links[2];
	if(link=="/articleOne") art1comments.push(details);
	else if(link=="/articleTwo") art2comments.push(details);
	else if(link=="/articleThree") art3comments.push(details);
	else if(link=="/articleFour") art4comments.push(details);
	res.send("Success");
});

//Object with article details

var articleArray={
	articleOne: {
	content: `
	<h1 style="text-align: center">Article 1</h1>
	<p> This is article 1</p>`,
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
	if(comment!= '')
	{
		for(var j=0;j<comment.length;j++)
		{
			detailsList=JSON.parse(comment[j]); //parse the comments JSON object
			for(var i=0; i<detailsList.length;i++)
				detailsArray.push(detailsList[i]);
		}
		for (var i=0; i<detailsArray.length; i=i+3)
		{
			commentList+='<h3>'+detailsArray[i]+'</h3><p>'+detailsArray[i+1]+'</p><hr/>';
		}
	}
	var template=`
	<!doctype html>
		<html>
			<head>
				<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
			</head>
			<body>
				<div class="container">
					${content}
					<h2>Comments:</h2><hr/>
					${commentList}
				</div>
			</body>
		</html>`;
		
	return template;
}

app.get('/:articleName', function(req, res){
	var articleName=req.params.articleName
	res.send(articleTemplate(articleArray[articleName]));
});


var port = 8080; // Use 8080 for local development because you might already have apache running on 80
app.listen(8080, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});
