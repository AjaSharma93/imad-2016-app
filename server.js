var express = require('express');
var morgan = require('morgan');
var path = require('path');

var app = express();
app.use(morgan('combined'));

var about={
	selected2: 'class="selected2"',
	content:``
};

var contact={
	selected3: 'class="selected3"',
	content:`
	<p>Email: aja.sharma1101@gmail.com</p>
	<p>GitHub: www.github.com/AjaSharma93</p>`
};

var help={
	selected4: 'class="selected4"',
	content:``
};

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
			<div class="navigation">
				<ul>
					<li ${selected1}><a href="/" ><p class="bold animated bounceInLeft">Home</p></a></li>
					<li ${selected2}><a href="/about"  ><p class="bold animated bounceInLeft">About Me</p></a></li>
					<li ${selected3}><a href="/contact" ><p class="bold animated bounceInLeft">Contact</p></a></li>
					<li ${selected4}><a href="/help"><p class="bold animated bounceInLeft">Help</p></a></li>
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
			<div class="centeredtext text-big whitetext neontext">
				<p class="midsection"> ${content} </p>
			</div>
			<script type="text/javascript" src="/ui/main.js">
			</script>
		</body>
	</html>	`;
	return htmlTemplate;
}

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

app.get('/ui/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'style.css'));
});

app.get('/ui/Eyes.jpg', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'Eyes.jpg'));
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

app.get('/help', function(req, res){
	res.send(createTemplate(help));
});



var port = 8080; // Use 8080 for local development because you might already have apache running on 80
app.listen(8080, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});
