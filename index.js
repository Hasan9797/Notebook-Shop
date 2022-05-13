const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongodb-session")(session);
const flash = require("connect-flash");

// Handlebars Settings
const Handlebars = require("handlebars");
const {
  allowInsecurePrototypeAccess,
} = require("@handlebars/allow-prototype-access");
const exphbs = require("express-handlebars");
const hbs = exphbs.create({
  defaultLayout: "main",
  extname: "hbs",
  helpers: require("./util"),
  handlebars: allowInsecurePrototypeAccess(Handlebars),
});
app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", "views");

// middlewares
const varMiddleware = require("./middleware/var");
const userMiddleware = require("./middleware/userSession");
const errorPage = require("./middleware/notfound");
const fileMiddleware = require("./middleware/file");

//Routers
const homeRoutes = require("./routes/home");
const notebooksRoutes = require("./routes/notebooks");
const addRoutes = require("./routes/add");
const cardRoutes = require("./routes/card");
const ordersRoutes = require("./routes/order");
const authRoutes = require("./routes/auth");
const profileRouter = require("./routes/profile");

const MONGODB_URI =
  "mongodb+srv://hasan:dDw9OBeMdl8bk9Hp@cluster0.i3uxh.mongodb.net/Notebooks-Shop";

const store = new MongoStore({
  collection: "session",
  uri: MONGODB_URI,
});

app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(express.urlencoded({ extended: true }));

//session Settings
app.use(
  session({
    secret: "secret val",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use(fileMiddleware.single("avatar"));
app.use(flash());
app.use(varMiddleware);
app.use(userMiddleware);

//Use to Routers
app.use("/", homeRoutes);
app.use("/notebooks", notebooksRoutes);
app.use("/add", addRoutes);
app.use("/card", cardRoutes);
app.use("/orders", ordersRoutes);
app.use("/auth", authRoutes);
app.use("/profile", profileRouter);
app.use(errorPage);

// Port Server
async function start() {
  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server has been started on port ${PORT}...`);
    });
  } catch (e) {
    console.log(e);
  }
}

start();
