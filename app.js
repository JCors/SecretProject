/** @format */
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require(`mongoose-encryption`);

const app = express();

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

// Connect to the Database
mongoose.connect("mongodb://localhost:27017/secretDB", {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

// Create Schema for the Database
const userSchema = new mongoose.Schema({
	email: String,
	password: String
});

// pass in a single secret string instead of two keys.
userSchema.plugin(encrypt, { secret: process.env.SECRET , encryptedFields: ['password']});

// Create Model for the User Schema
const User = mongoose.model("User", userSchema);

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
	const username = req.body.username;
	const password = req.body.password;
	User.findOne({ email: username }, function (err, foundUser) {
		if (err) {
			console.log(err);
		} else {
			if (foundUser) {
				if (foundUser.password === password) {
					res.render("secrets");
					console.log("Successfully login");
				}
			}
		}
	});
});

// Create routes for Register
app.get("/register", function (req, res) {
	res.render("register");
});

app.post("/register", function (req, res) {
	const user = new User({
		email: req.body.username,
		password: req.body.password,
	});

	user.save(function (err) {
		if (!err) {
			res.redirect("/login");
			console.log("Successfully registered");
		} else {
			console.log(err);
		}
	});
});

// Port listener
app.listen(PORT, () => {
	console.log(`Server is running at port ${PORT}`);
});
