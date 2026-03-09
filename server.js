const express = require("express");
const fs = require("fs");

const app = express();

app.set("view engine", "ejs");
app.set("views", "./profile");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("signin_signup"));
app.use("/profile", express.static("profile"));

let users = require("./data.json");


// SIGNUP
app.post("/signup", (req, res) => {

    const { name, email, password } = req.body;

    const newUser = {
        id: users.length + 1,
        name,
        email,
        password
    };

    users.push(newUser);

    fs.writeFileSync("./data.json", JSON.stringify(users, null, 2));

    res.redirect("/profile/" + name);
});


// LOGIN
app.post("/login", (req, res) => {

    const { email, password } = req.body;

    const user = users.find(
        u => u.email === email && u.password === password
    );

    if (user) {
        res.redirect("/profile/" + user.name);
    } else {
        res.send("Invalid login");
    }

});


// PROFILE PAGE
app.get("/profile/:name", (req, res) => {

    const name = req.params.name;

    res.render("profile", { name });

});


app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});