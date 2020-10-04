/** @format */

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const app = express();
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");

//	Server Port
const PORT = process.env.PORT || 3000;

// Body Parser
app.use(
	bodyParser.urlencoded({
		extended: true,
	})
);
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// EJS
app.set("view engine", "ejs");

app.use(
	session({
		secret: "keyboard cat",
		resave: false,
		saveUninitialized: true,
	})
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.CLIENT_ID,
			clientSecret: process.env.CLIENT_SECRET,
			callbackURL: "http://localhost:3000/auth/google/secrets",
			userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
		},
		function (accessToken, refreshToken, profile, cb) {
			console.log(profile);
			User.findOrCreate({ googleId: profile.id }, function (err, user) {
				return cb(err, user);
			});
		}
	)
);

// Connect to the Database
mongoose.connect("mongodb://localhost:27017/secretDB", {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

mongoose.set("useCreateIndex", true);

// Create Schema for the Database
const userSchema = new mongoose.Schema({
	email: String,
	password: String,
	googleId: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

// Create Model for the User Schema
const User = mongoose.model("User", userSchema);

// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

passport.serializeUser(function (user, done) {
	done(null, user.id);
});

passport.deserializeUser(function (id, done) {
	User.findById(id, function (err, user) {
		done(err, user);
	});
});

// Create routes for Home
app.get("/", function (req, res) {
	res.render("home");
});

// Create routes for Login Page
app.get("/login", function (req, res) {
	res.render("login");
});

// Post route for Login Page
app.post("/login", function (req, res) {
	const user = new User({
		username: req.body.username,
		password: req.body.password,
	});

	req.login(user, function (err) {
		if (err) {
			console.log(err);
		} else {
			passport.authenticate("local")(req, res, function () {
				res.redirect("/secrets");
			});
		}
	});
});

app.get("/secrets", function (req, res) {
	if (req.isAuthenticated()) {
		res.render("secrets");
	} else {
		res.redirect("/login");
	}
});

// Create routes for Register
app.get("/register", function (req, res) {
	res.render("register");
});

app.post("/register", function (req, res) {
	User.register({ username: req.body.username }, req.body.password, function (
		err,
		user
	) {
		if (err) {
			console.log(err);
			res.redirect("/register");
		} else {
			passport.authenticate("local", function (req, res) {
				res.redirect("/secrets");
			});
		}
	});
});

app.get(
	"/auth/google",
	passport.authenticate("google", { scope: ["profile"] })
);

app.get(
	"/auth/google/secrets",
	passport.authenticate("google", { failureRedirect: "/login" }),
	function (req, res) {
		// Successful authentication, redirect home.
		res.redirect("/secrets");
		console.log("Successfully login");
	}
);

app.get("/logout", function (req, res) {
	req.logout();
	res.redirect("/");
});

// Port listener
app.listen(PORT, () => {
	console.log(`Server is running at port ${PORT}`);
});
