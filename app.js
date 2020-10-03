/** @format */

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

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
// mongoose.connect("mongodb://localhost:27017/secretDB", {
// 	useNewUrlParser: true,
// 	useUnifiedTopology: true,
// });

// Create Schema for the Database
// const articleSchema = {
// 	title: String,
// 	content: String,
// };

// Create Model for the Article Schema
// const Article = mongoose.model("Article", articleSchema);

// Create routes for Home

app.get("/", function (req, res) {
	res.send("home");
});

app.get("/login", function (req, res) {
	res.send("login");
});

app.get("/register", function (req, res) {
	res.send("register");
});

// Port listener
app.listen(PORT, () => {
	console.log(`Server is running at port ${PORT}`);
});
