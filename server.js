var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool=require('pg').Pool;
var crypto=require('crypto');
var bodyParser=require('body-parser');
var session=require('express-session');

var config={
	user: 'ajasharma93',
	host: 'db.imad.hasura-app.io',
	port:'5432',
	database: 'ajasharma93',
	password: process.env.DB_PASSWORD;
}
var app = express();

app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(session({
    secret: 'someRandomSecretValue',
    cookie: {maxAge: 1000* 60 * 60 * 24 * 30}
}));

var pool = new Pool(config); //declaring a connection pool for database queries;

function hash(pass, salt)
{
	hashedString=crypto.pbkdf2Sync(pass, salt, 10000, 512, 'SHA512');
	return ['pdkdf2', '10000', salt, hashedString.toString('hex') ].join('$');
}

app.get("/hash/:keyString", function(req, res)
{
	keyString=req.params.keyString;
	salt=crypto.randomBytes(128).toString('hex');
	res.send(hash(keyString, salt));
});

function checkUsername(username, cb){
	re = /^\w+$/;
	if(re.test(username))
	{
		pool.query('SELECT * FROM users WHERE LOWER(username)=LOWER($1)', [username], 
		function(err, result){
			if(err)
			{
				cb("error occurred");			
			}
			else{
				if(result.rows.length===0)
				{
					cb(true);
				}
				else{
					cb(false);
				}
			}
		});
	}
	else{
		cb('invalid');
	}
}

function checkEmail(email, cb){
	var re=/\S+@\S+\.\S+/;
	if(re.test(email))
	{
		pool.query('SELECT * FROM users WHERE LOWER(email)=LOWER($1)',[email],
			function(err, result){
				if(err)
				{
					cb("error occurred");		
				}
				else{
					if(result.rows.length===0)
					{
						cb(true);
					}
					else{
						cb(false);
					}
			}
		});
	}else{
		cb('invalid');
	}
}

app.post('/create-user', function(req, res)
{
    var username=req.body.username;
	var email=req.body.email;
    var password=req.body.password;
    var salt= crypto.randomBytes(128).toString('hex');
    var dbString= hash(password, salt);
	if(username!=='' && password!=='' && email!=='')
	{
		checkUsername(username, function(userData){
			console.log(userData);
			if(userData===true)
			{
				
				checkEmail(email, function(emailData){
					console.log(emailData);
					if(emailData===true)
					{
						pool.query('INSERT INTO "users" (username, email ,password) VALUES($1, $2, $3)', [username, email, dbString],
						function(err, result)
						{
							if(err)
							{
								res.status(500).send(err.toString());
							}
							else
							{
								res.send('User successfully created: ' + username);
							}
						});
					}
					else{
						if(emailData==='invalid')
						{
							res.status(403).send('email invalid');
						}
						else if(emailData==false){
						res.status(403).send('email taken');
						}
						else{
							res.status(403).send(emailData);
						}
					}
				});
			}
			else{
				if(userData==='invalid')
				{
					res.status(403).send('username invalid');
				}
				else if(userData==false){
					res.status(403).send('username taken');
				}
				else{
					res.status(403).send(userData);
				}
			}
		});		
	}
	else{
		res.status(403).send('enter your details');
	}
    
});

app.post('/login', function(req, res)
{
    var username=req.body.username;
    var password=req.body.password;
    
    pool.query('SELECT * FROM "users" where username=$1', [username], 
    function(err, result){
         if(err)
        {
            res.status(500).send(err.toString());
        }
        else
        {
            if(result.rows.length===0)
            {
                 res.status(403).send('Username/Password is incorrect');
            }
            else{
                var dbString=result.rows[0].password;
                var salt=dbString.split('$')[2];
                var hashedPassword=hash(password, salt); //creating a password based on the password and the original salt
                if(hashedPassword===dbString)
                {
                    req.session.auth={userId: result.rows[0].id};
                    res.send('Credentials are correct');
                }
                else
                {
                    res.status(403).send('Username/Password is incorrect');
                }
            }
        }
    } );
});


function getUser(userId, callback) //get a username (and other details) from user ID
{
	 pool.query('SELECT username from users where id=$1', [userId], 
	   function(err, result)
	   {
		   if(err)
			{
				callback("error");
			}
			else
			{
				callback(result.rows[0].username);
			}
	   });
}



app.get('/check-login', function(req, res){
   if(req.session && req.session.auth && req.session.auth.userId)
   {
       getUser(req.session.auth.userId, function(data){
			if(data!=="error")
			{
				  /*res.send(`<li class="right"><a href="/logout"><p class="bold animated bounceInRight">Logout</p></li>
							<span class="right neontext whitetext">Logged in: ${data} </span>`); */
					res.send(`
							<div class="right dropdown">
								<button class="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown">${data}
								<span class="caret"></span></button>
								<div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
								 <a class= "dropdown-item" href="/logout">Logout</a>
								</div>
							 </div>`);
			}	
			else
			{
				res.send('error occured');
			}
	   });
   }
   else
   {
       res.send('<li class="right"><a href="/login.html"><p class="bold animated bounceInRight">Login/Register</p></li>');
   }
});


app.get('/template', function(req, res){
	res.send(`<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
  <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
</head>
<body>

   <div class="dropdown">
    <button class="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown">User
    <span class="caret"></span></button>
    <ul class="dropdown-menu">
      <li><a href="/logout">Logout</a></li>
    </ul>
  </div>

</body>`);
});

app.get('/logout', function(req, res){
   delete req.session.auth;
   res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

app.get('/comments-authenticate', function(req, res){
   if(req.session && req.session.auth && req.session.auth.userId)
   {
			getUser(req.session.auth.userId, function(user)
			{
				if(user !== "error")
				{
				var comments= `
				<h3 class="whitetext">Add a comment:</h3>
					<p class="whitetext">You are logged in as ${user}</p>
					<div class="form-group">
						<label for="comment" class="sr-only">Comment:</label>
						<textarea class="form-control" id="comment" placeholder="Your Comment" rows="3"></textarea>
					</div>
					<button type="submit"  class="btn btn-default" id="submit_btn">Submit</button>
					<script type="text/javascript" src="/ui/js/comments.js">
					</script>`;
				res.send (comments);
				}
				else{
					res.send('Error occurred');
				}
			});
   }
   else
   {
       res.send('<h3 class="whitetext">Login to post comments</h3>');
   }
});


//details of the about tab
var about={
	selected2: 'selected2',
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
	selected3: 'selected3',
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
			<title>My WebApp</title>
			<!-- FontAwesome CDN -->
			<script src="https://use.fontawesome.com/70cfc12727.js"></script>
			<!-- latest jQuery direct from google's CDN -->
			<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
			<!-- Bootstrap compiled and minified JS -->
			<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
			<!-- Bootstrap compiled and minified CSS -->
			<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" 
			integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
			<link href="/ui/css/style.css" rel="stylesheet" />
			<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.5.2/animate.min.css">
			
			<meta name="viewport" content="width=device-width, initial-scale=1">
		</head>
		<body class="bgimg">
			<div class="navigation menu">
				<ul>
					<li class="${selected1} left"><a href="/"><p class="bold animated bounceInLeft">Home</p></a></li>
					<li class="${selected2} left"><a href="/about"><p class="bold animated bounceInLeft">About Me</p></a></li>
					<li class="${selected3} left"><a href="/contact"><p class="bold animated bounceInLeft">Contact</p></a></li>
					<li class="${selected4} left"><a href="/articles"><p class="bold animated bounceInLeft">Articles</p></a></li>
					<span id="login"></span>
				</ul>
			</div>
			${content}
			<div id="Social">
				<ul>
					<li id="Share" class="bold whitetext">Follow:</li>
					<li id="Share">
						<a href="https://twitter.com/ajasharma1101" target="_blank" style="text-decoration:none;">
						<img src="https://g.twimg.com/dev/documentation/image/Twitter_logo_blue_32.png" alt="Twitter" style="border:0;width:32px;height:32px"></a>
					</li>
					<li id="Share">
						<a href="//plus.google.com/u/0/106415896484965862024?prsrc=3"rel="publisher" target="_blank" style="text-decoration:none;">
						<img src="//ssl.gstatic.com/images/icons/gplus-32.png" alt="Google+" style="border:0;width:32px;height:32px;"/>
						</a>
					</li>
				</ul>
		</div>
		<script src="/ui/js/authentication.js"></script>
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


app.get('/login.html', function(req, res){
	if(req.session && req.session.auth && req.session.auth.userId)
	{
		res.sendFile(path.join(__dirname, 'ui','index.html'));
	}
	else
	{
	res.sendFile(path.join(__dirname,'ui','login.html')); //Login page
	}
});

app.get('/register.html', function(req, res){
	if(req.session && req.session.auth && req.session.auth.userId)
	{
		res.sendFile(path.join(__dirname, 'ui','index.html'));
	}
	else
	{
	res.sendFile(path.join(__dirname,'ui','register.html')); //register page
	}
});


app.get('/ui/main.js', function(req, res){
	res.sendFile(path.join(__dirname, 'ui','main.js'))
});

app.get('/ui/css/style.css', function(req, res)
{
	res.sendFile(path.join(__dirname,'ui', 'style.css'));
});

//Code below is used to add comments to respective articles page
app.get('/articles/:articleName/commentry', function(req, res)
{
	var articleName=req.params.articleName;
	var comment=req.query.comment;
	
	if(comment!=='')
	{
		if(req.session && req.session.auth && req.session.auth.userId )
		{
		getUser(req.session.auth.userId, function(user){
		if(user!="error")
		{
			pool.query('INSERT INTO "Comments"(comment_date, article_title, comment_author, comment) values($1,$2,$3,$4)',['now()',articleName, user, comment], 
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
		});
		}else{
			res.send("You are not logged in");
		}
	}
	else
	{
		res.send("Cannot make an empty comment.");
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
