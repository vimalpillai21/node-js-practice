var express = require('express');
var exphbs = require('express-handlebars');
var path = require('path');

const app = express()
const port = 3000
const hbs = exphbs.create();

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");


// app.set('view engine', 'ejs');

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/first',function(req,res){
    res.render('index');
});





app.listen(port, () => console.log(`Example app\
 listening on port!`));

