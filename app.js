const express = require("express");
const path = require("path");
const Handlebars = require("handlebars");
const exphbs = require("express-handlebars");
const {
  allowInsecurePrototypeAccess,
} = require("@handlebars/allow-prototype-access");
const methodOverride = require("method-override");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");

const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

//load routes
const ideas = require("./routes/ideas");
const users = require("./routes/users");

//passport config
require("./config/passport")(passport);

//connect to mongoose
mongoose
  .connect("mongodb://localhost/vidjot-dev", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.log(err));

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

//satic folder
app.use(express.static(path.join(__dirname, "public")));

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

//password middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

//global variables
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  next();
});

//index route
app.get("/", (req, res) => {
  const title = "Welcome";
  res.render("index", {
    title: title,
  });
});

//about route
app.get("/about", (req, res) => {
  res.render("about");
});

app.use("/ideas", ideas);
app.use("/users", users);

const port = 5000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
