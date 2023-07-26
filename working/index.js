require('dotenv').config();
const express = require("express");
const session = require("express-session");
const MongoDBSession = require("connect-mongodb-session")(session);
const mongoose = require("mongoose");
const config = require("./configuration/config");

const app = express();

const mongoURI = "mongodb://127.0.0.1:27017/e_commerce_site";

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
  .then((res) => {
    console.log("MongoDB Connected");
  });

const store = new MongoDBSession({
  uri: mongoURI,
  collection: "mySessions",
});

app.use(
  session({
    secret: config.sessionSecret,
    resave: true,
    saveUninitialized: true,
    store: store,
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set("view engine", "ejs");
app.set("views", "./views");

app.use(express.static("views"));

const nocache = require("nocache");
app.use(nocache());

// for user route
const userRoute = require("./routes/userRoute");
app.use("/", userRoute);

// for admin route
const adminRoute = require('./routes/adminRoute')
app.use("/admin", adminRoute)

const port = 3500;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
