const { Router } = require("express");
const User = require("../models/user");
const { body, validationResult } = require("express-validator");
const { registerValidator } = require("../util/validators");
const bcrypt = require("bcrypt");
const router = Router();

router.get("/login", async (req, res) => {
  res.render("auth/login", {
    title: "register",
    isLogin: true,
    error: req.flash("loginErr"),
    errRegis: req.flash("regisError"),
  });
});

router.get("/logaut", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/auth/login#login");
  });
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      const bcPast = await bcrypt.compare(password, user.password);
      if (bcPast) {
        req.session.user = user;
        req.session.isAuthenticated = true;
        req.session.save((err) => {
          if (err) throw err;
          res.redirect("/");
        });
      }
    } else {
      req.flash("loginErr", "Password or Email wrong");
      res.redirect("/auth/login#login");
    }
  } catch (e) {
    req.flash("loginErr", "Karochi not faund");
    console.log(e);
  }
});

router.post("/register", registerValidator, async (req, res) => {
  try {
    const { name, email, password, confirm } = req.body;
  
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash("regisError", errors.array()[0].msg);
      return res.status(422).redirect("/auth/login#register");
    }

    const bcryptPass = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: bcryptPass,
      cart: { items: [] },
    });
    await user.save();
    res.redirect("/auth/login#login");
    
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
