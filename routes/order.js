const { Router } = require("express");
const Order = require("../models/order");
const auth = require("../middleware/auth");
const router = Router();

router.get("/", auth, async (req, res) => {
  try {
    const user = await Order.find({ "user.userId": req.user._id }).populate(
      "user.userId"
    );
    res.render("orders", {
      title: "Order",
      isOrder: true,
      orders: user.map((s) => ({
        ...s._doc,
        price: s.notebooks.reduce((total, notebok) => {
          return (total += notebok.count * notebok.notebook.price);
        }, 0),
      })),
    });
  } catch (e) {
    console.log(e);
  }
});

router.post("/", async (req, res) => {
  try {
    const user = await req.user.populate("cart.items.notebookId");
    const notebooks = user.cart.items.map((s) => ({
      count: s.count,
      notebook: { ...s.notebookId._doc },
    }));
    const order = new Order({
      notebooks,
      user: {
        name: req.user.name,
        userId: req.user,
      },
    });
    await order.save();
    await req.user.cleanCart();
    res.redirect("/orders");
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
