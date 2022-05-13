const { Router } = require("express");
const Notebook = require("../models/notebook");
const auth = require("../middleware/userSession");
const auth1 = require("../middleware/auth");
const router = Router();

function mapToCart(cart) {
  return cart.items.map((s) => ({
    ...s.notebookId._doc,
    id: s.notebookId.id,
    count: s.count,
  }));
}

function calkulate(notebook) {
  return notebook.reduce((total, calculat) => {
    return (total += calculat.price * calculat.count);
  }, 0);
}

router.post("/add", auth, async (req, res) => {
  const notebook = await Notebook.findById(req.body.id);
  await req.user.addToCart(notebook);
  res.redirect("/card");
});

router.delete("/remove/:id", async (req, res) => {
  await req.user.removeToCart(req.params.id);
  const user = await req.user.populate("cart.items.notebookId");
  const notebooks = mapToCart(user.cart);
  const card = {
    notebooks,
    price: calkulate(notebooks),
  };
  res.status(200).send(card);
});

router.get("/", auth1, async (req, res) => {
  const user = await req.user.populate("cart.items.notebookId");
  const notebooks = mapToCart(user.cart);
  res.render("card", {
    title: "Basket",
    isCard: true,
    notebooks: notebooks,
    price: calkulate(notebooks),
  });
});

module.exports = router;
