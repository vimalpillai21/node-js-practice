var express = require('express');
var cookieParser = require('cookie-parser');
var app = express();

app.use(cookieParser());

app.get('/',function(req,res){
    res.cookie('name','express').send('cookie set');
    res.setHeader('Content-Type', 'text/html');
    // res.cookie('app', 'stream', {expire: 360000 + Date.now()});
    // res.cookie('speed', 'very-fast', {maxAge: 360000});
});

app.get('/clear_cookie', function(req, res){
    res.clearCookie('name');
    res.send('cookie foo cleared');
});

app.listen(3000);

