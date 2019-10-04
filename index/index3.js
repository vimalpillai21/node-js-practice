var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var exphbs = require('express-handlebars');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/my_db', {useUnifiedTopology: true, useNewUrlParser: true});

var personSchema = mongoose.Schema({
    name: String,
    age: Number,
    nationality: String
});

var Person = mongoose.model("Person", personSchema);
var upload = multer();
var app = express();
const port = 3000;

// const hbs = exphbs.create();

app.engine("handlebars", exphbs({
    helpers: {
        ifeq: function (a, b, options) {
            if (a === b) {
                return options.fn(this);
            }
            return options.inverse(this);
        },
        ifnoteq: function (a, b, options) {
            if (a !== b) {
                return options.fn(this);
            }
            return options.inverse(this);
        }
    }, defaultLayout: "main"
}));
app.set("view engine", "handlebars");

app.use('/static', express.static('public'));

// for parsing application json
app.use(bodyParser.json());

// for parsing application/xwww
app.use(bodyParser.urlencoded({extended: true}));
// form-urlencoded

// for parsing multipart/form-data
app.use(upload.array());

app.get('/person', function (req, res) {
    res.render('person');
});

app.post('/person', function (req, res) {
    var personInfo = req.body;
    if (!personInfo.name || !personInfo.age || !personInfo.nationality) {
        res.render('show_message', {
            message: "Sorry, youy provided wrong info", type: "error"
        });
    } else {
        var newPerson = new Person({
            name: personInfo.name,
            age: personInfo.age,
            nationality: personInfo.nationality
        });

        newPerson.save(function (err, Person) {
            if (err) {
                res.render('show_message', {
                    message: "Database Error", type: "error"
                });
            } else {
                res.render("show_message", {
                    type: "success",
                    message: "New Person added",
                    person: personInfo
                });
            }
        });
    }
});
app.get('/people', function (req, res) {
    Person.find(function (err, response) {
        res.render('person_list', {person: JSON.parse(JSON.stringify(response)), languages: ['a', 'b', 'c']})
    });
});
app.listen(port);
