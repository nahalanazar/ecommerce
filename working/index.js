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

const userStore = new MongoDBSession({
  uri: mongoURI,
  collection: "userSessions",
});

const adminStore = new MongoDBSession({
  uri: mongoURI,
  collection: "adminSessions",
});

const userSession = session({
  secret: 'userSecret',
  resave: false,
  saveUninitialized: true,
  store: userStore,
  name: 'user_sid',
  cookie: { path: '/' }
});

const adminSession = session({
  secret: 'adminSecret',
  resave: false,
  saveUninitialized: true,
  store: adminStore,
  name: 'admin_sid',
  cookie: { path: '/admin' }
});

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());


  const userRouter = require('./routes/userRoute');
  const adminRouter = require('./routes/adminRoute');
  
  app.use('/admin', (req, res, next) => {
    return next();
  }, adminSession, adminRouter);

  app.use('/', (req, res, next) => {
    return next();
  }, userSession, userRouter);


app.set("view engine", "ejs");
app.set("views", "./views");

app.use(express.static("views"));

const nocache = require("nocache");
app.use(nocache());

const port = 3500;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
