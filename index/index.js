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
    res.render('index',
    {
        'title':'Handle Bar',
         languages:['A','B','C'],
         user: {
            admin: true
          },
          user2: {
            contact: {
              email: 'handlebar@node.com',
              twitter: 'handle_bar'
            },
            address: {
              city: 'San Francisco',
              state: 'California'
            },
            name: 'Handle Bar'
          }
    }
);
});





app.listen(port, () => console.log(`Example app\
 listening on port!`));

