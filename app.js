const express = require("express");
const Handlebars = require("handlebars");
const exphbs = require("express-handlebars");
const {
  allowInsecurePrototypeAccess,
} = require("@handlebars/allow-prototype-access");
const methodOverride = require("method-override");
const flash = require("connect-flash");
const session = require("express-session");

const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

//connect to mongoose
mongoose
  .connect("mongodb://localhost/vidjot-dev", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.log(err));

//load idea model
require("./models/Idea");
const Idea = mongoose.model("ideas");

// handlebars middleware
app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main",
    handlebars: allowInsecurePrototypeAccess(Handlebars),
  })
);
app.set("view engine", "handlebars");

//body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//method override middleware
app.use(methodOverride("_method"));

//express session middleware
app.use(
  session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(flash());

//global variables
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

//index route
app.get("/", (req, res) => {
  const title = "Welcome1";
  res.render("index", {
    title: title,
  });
});

//idea index page
app.get("/ideas", (req, res) => {
  Idea.find({})
    .sort({ date: "desc" })
    .then((ideas) => {
      res.render("ideas/index", {
        ideas: ideas,
      });
    });
});

//about route
app.get("/about", (req, res) => {
  res.render("about");
});

//add idea form
app.get("/ideas/add", (req, res) => {
  res.render("ideas/add");
});

//edit idea form
app.get("/ideas/edit/:id", (req, res) => {
  Idea.findOne({
    _id: req.params.id,
  }).then((idea) => {
    res.render("ideas/edit", {
      idea: idea,
    });
  });
});

//process form
app.post("/ideas", (req, res) => {
  let errors = [];
  if (!req.body.title) {
    errors.push({ text: "Please add a title" });
  }
  if (!req.body.details) {
    errors.push({ text: "Please add some details" });
  }
  if (errors.length > 0) {
    res.render("ideas/add", {
      errors: errors,
      title: req.body.title,
      details: req.body.details,
    });
  } else {
    const newUser = {
      title: req.body.title,
      details: req.body.details,
    };
    new Idea(newUser).save().then((idea) => {
      req.flash("success_msg", "Video idea added");

      res.redirect("/ideas");
    });
  }
});

//Edit form process
app.put("/ideas/:id", (req, res) => {
  Idea.findOne({
    _id: req.params.id,
  }).then((idea) => {
    // new values
    idea.title = req.body.title;
    idea.details = req.body.details;

    idea.save().then((idea) => {
      req.flash("success_msg", "Video idea updated");

      res.redirect("/ideas");
    });
  });
});

//delete idea
app.delete("/ideas/:id", (req, res) => {
  Idea.remove({ _id: req.params.id }).then(() => {
    req.flash("success_msg", "Video idea removed");
    res.redirect("/ideas");
  });
});

const port = 5000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
