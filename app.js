const express = require("express");
const session = require("express-session");
const configRoutes = require("./routes");
const { engine } = require("express-handlebars");

const static = express.static(__dirname + "/public");
const app = express();

const PORT = 3000;

app.use("/public", static);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");

//used for removing cache and handling back buttons after sign-ups or logins
app.use(function (request, response, next) {
    response.header(
        "Cache-Control",
        "private, no-cache, no-store, must-revalidate"
    );
    response.header("Expires", "-1");
    response.header("Pragma", "no-cache");
    next();
});

app.use(
    session({
        name: "AuthCookie",
        secret: `There !$ /\/0 $ecret f0r /\/\Y $e$$!0/\/`,
        resave: false,
        saveUninitialized: true,
    })
);

configRoutes(app);

app.listen(PORT, () => {
    console.log("We've now got a server!");
    console.log(`Your routes will be running on http://localhost:${PORT}`);
});
