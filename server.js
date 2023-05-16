let app = require('express')()
const fs = require('fs')
const db = require('./db.js')
const util = require('./util.js')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
app.use(bodyParser.json())
app.use(cookieParser());
app.get('/Logout', function (req, res) {
  res.clearCookie('token')
  res.redirect('/')
});
app.post('/Register', function (req, res) {
  let username = req.body.username
  let password = req.body.password
  console.log('Register: ' + username + ' ' + password)
  if (!db.acceptablePassword(password)) {
    res.send("Password not acceptable")
    return;
  }
  if (!db.acceptableUserName(username)) {
    res.send("Username not acceptable")
    return;
  }
  db.addUser(username, password)
  res.send("Register success")
});
app.post('/Login', async function (req, res) {
  let username = req.body.username
  let password = req.body.password
  console.log('Login attempt via ' + username + ' ' + password)
  let user = await db.getUser(username)
  if (user == null) {
    res.send("Username not found")
    return;
  }
  if (user.password != password) {
    res.send("Password incorrect")
    return;
  }
  let token = db.getToken(username, password)
  res.cookie('token', token)
  res.send("Login success")
});
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/pages/index.html')
});
app.get('/styles/:f', function (req, res) {
  res.setHeader('content-type', "text/css")
  res.sendfile(__dirname + '/public/styles/' + req.params.f);

});
app.get('/javascript/:f', function (req, res) {
  res.sendFile(__dirname + '/public/javascript/' + req.params.f);

});
app.get('/:page', async function (req, res) {
  console.lo
  let p = req.params.page
  if (fs.existsSync(__dirname + '/public/pages/' + p + '.html')) {
    console.log('unlogged page')
    res.sendFile(__dirname + '/public/pages/' + p + '.html');
    return;
  } else if (fs.existsSync(__dirname + '/public/pages/loggedin/' + p + '.html')) {
    let b = await db.loggedIn(req)
    console.log("Logged in ?" + b)
    if (b) {
      res.sendFile(__dirname + '/public/pages/loggedin/' + p + '.html');
    }
    else {
      //TODO mention the error within the url
      res.redirect('/Login')
    }
  }
  else {
    res.sendFile(__dirname + '/public/pages/404.html');
  }
});
app.get('/images/:f', function (req, res) { //idk why this no work
  res.sendFile(__dirname + '/public/images/' + req.params.f);
});
console.log('Starting server');
app.listen(8000, async function(){
  await db.init();
})
console.log('Server started');