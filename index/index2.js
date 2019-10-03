var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var exphbs = require('express-handlebars');

var upload = multer();
var app = express();

const port = 3000;
const hbs = exphbs.create();

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
app.use('/static', express.static('public'));

// for parsing application json
app.use(bodyParser.json());

// for parsing application/xwww
app.use(bodyParser.urlencoded({extended:true}));
// form-urlencoded

// for parsing multipart/form-data
app.use(upload.array()); 

app.get('/',function(req,res){
    res.render('form');
});

app.post('/',function(req,res){
    console.log(req.body);
    res.send("received your request!");
});

app.listen(3000);