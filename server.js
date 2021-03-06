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
	password: process.env.DB_PASSWORD
};

var app = express();

app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(session({
    secret: 'someRandomSecretValue',
    cookie: {maxAge: 1000* 60 * 60 * 24 * 30}
}));

var pool = new Pool(config); //declaring a connection pool for database queries;
require('./ui/nest/articles.js')(app, pool); //get a summary of all articles
require('./ui/nest/getArticle.js')(app, pool); //get a particular article page

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
	if(username.trim()!=='' && password.trim()!=='' && email.trim()!=='')
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
						else if(emailData===false){
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
				else if(userData===false){
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
							<span class="right dropdown">
								<button class="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown">
								<span class="glyphicon glyphicon-user"></span>
								${data}
								<span class="caret"></span></button>
								<p class="center dropdown-menu" aria-labelledby="dropdownMenuButton">
								 <a class= "dropdown-item" href="/logout">Logout</a>
								</p>
							 </span>`);
			}	
			else
			{
				res.send('error occured');
			}
	   });
   }
   else
   {
       res.send('<li class="right"><a href="/login.html"><p class="bold animated">Login/Register</p></li>');
   }
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
					<h4>Add a comment:</h4>
					<p>You are logged in as ${user}</p>
					<div class="form-group">
						<label for="comment" class="sr-only">Comment:</label>
						<textarea class="form-control" id="comment" placeholder="Your Comment" rows="3"></textarea>
					</div>
					<button type="submit"  class="btn btn-success" id="submit_btn">Submit</button>
					<script type="text/javascript" src="/ui/js/comments.js">
					</script>`;
				res.send (comments);
				}
				else{
					res.send('error occurred');
				}
			});
   }
   else
   {
       res.send('<h3>Login to post comments</h3><a href="/login.html">Click here to Login/Register</a>');
   }
});


//details of the about tab
/*var about={
	selected2: 'selected2',
	content:`
	`
};*/

//details of the contact tab
var contact={
	selected3: 'selected3',
	content:`
	<div class="padding-100px-top padding-100px-bottom center whitetext">
		<p>
			<h4>Email: aja.sharma1101@gmail.com</h4>
			<h4>GitHub: www.github.com/AjaSharma93</h4>
		</p>
		<br/>
		<span id="Social">
			<span id="Share" class="bold whitetext">Follow:</span>
			<span id="Share">
				<a href="https://twitter.com/ajasharma1101" target="_blank" style="text-decoration:none;">
				<img src="https://g.twimg.com/dev/documentation/image/Twitter_logo_blue_32.png" alt="Twitter" style="border:0;width:32px;height:32px"></a>
			</span>
			<span id="Share">
				<a href="//plus.google.com/u/0/106415896484965862024?prsrc=3"rel="publisher" target="_blank" style="text-decoration:none;">
				<img src="//ssl.gstatic.com/images/icons/gplus-32.png" alt="Google+" style="border:0;width:32px;height:32px;"/>
				</a>
			</span>
		</span>
	</div>
	<script>
              (function (w,i,d,g,e,t,s) {w[d] = w[d]||[];t= i.createElement(g);
                t.async=1;t.src=e;s=i.getElementsByTagName(g)[0];s.parentNode.insertBefore(t, s);
              })(window, document, '_gscq','script','//widgets.getsitecontrol.com/61950/script.js');
     </script>`
};


//template for creating the webpages of home, about, contact tabs
function createTemplate(data){
	var selected2=data.selected2;
	var selected3=data.selected3;
	var num=2;
	if(selected3!==undefined){
		num=3;
	};
	var content=data.content;
	var htmlTemplate=`
	<!doctype html>
	<html>
		<head>
			<title>Contact</title>
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
			<link href="/ui/css/footer.css" rel="stylesheet" />
			<link href="https://fonts.googleapis.com/css?family=Coming+Soon" rel="stylesheet">
			
			<script>
			$(function(){
				$("#navbar").load("/navbar.html", function(){
					$("ul li:nth-child(${num})").addClass("${selected2} ${selected3}");
					$.get('/check-login',function(data, status){
					$('#login').html(data.toString());
					});
				});
			});
			</script>
			<meta name="viewport" content="width=device-width, initial-scale=1">
		</head>
		<body class="bgimg">
			<nav>
			    <div class="navigation menu" id="navbar">
		    	 </div>
			</nav>
			<div class="container">
				${content}
			</div>
			
			<footer>
			</footer>
			<script>
				  $(document).ready(function(){
					  $.get('/footer.html', function(data, status){
						$("footer").html(data);
					  });
				  });
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
	res.sendFile(path.join(__dirname, 'ui', 'about.html')); //about tab
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

app.get('/navbar.html', function(req, res)
{
	res.sendFile(path.join(__dirname,'ui', 'navbar.html'));
});

app.get('/footer.html', function(req, res)
{
	res.sendFile(path.join(__dirname,'ui', 'footer.html'));
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





var port = 8080; // Use 8080 for local development because you might already have apache running on 80
app.listen(8080, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});
