/** @format */
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
// const encrypt = require(`mongoose-encryption`);
// const md5 = require("md5");
const saltRounds = 10;

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
	password: String,
});

// // pass in a single secret string instead of two keys.
// userSchema.plugin(encrypt, { secret: process.env.SECRET , encryptedFields: ['password']});

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
	// Load hash from your password DB.
	const username = req.body.username;

	User.findOne({ email: username }, function (err, foundUser) {
		if (err) {
			console.log(err);
		} else {
			if (foundUser) {
				bcrypt.compare(req.body.password, foundUser.password, function (
					err,
					result
				) {
					if (result) {
						res.render("secrets");
						console.log("Successfully login");
					}
				});
			}
		}
	});
});

// Create routes for Register
app.get("/register", function (req, res) {
	res.render("register");
});

app.post("/register", function (req, res) {
	bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
		const user = new User({
			email: req.body.username,
			password: hash,
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
});

// Port listener
app.listen(PORT, () => {
	console.log(`Server is running at port ${PORT}`);
});
