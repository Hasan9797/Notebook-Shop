const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  name: String,
  avatarUrl: String,
  password: String,
  cart: {
    items: [
      {
        count: {
          type: Number,
          default: 1,
          required: true,
        },
        notebookId: {
          type: Schema.Types.ObjectId,
          ref: "Notebook",
          required: true,
        },
      },
    ],
  },
});

userSchema.methods.addToCart = function (notebook) {
  let items = [...this.cart.items];

  const idx = items.findIndex((h) => {
    return h.notebookId.toString() === notebook._id.toString();
  });

  if (idx >= 0) {
    items[idx].count = items[idx].count + 1;
  } else {
    items.push({
      count: 1,
      notebookId: notebook._id,
    });
  }

  this.cart = { items };
  return this.save();
};

userSchema.methods.removeToCart = function (id) {
  let items = [...this.cart.items];

  const idx = items.findIndex((h) => h.notebookId.toString() === id.toString());

  if (items[idx].count === 1) {
    items = items.filter((h) => h.notebookId.toString() !== id.toString());
  } else {
    items[idx].count--;
  }

  this.cart = { items };
  return this.save();
};

userSchema.methods.cleanCart = function () {
  this.cart = { items: [] };
  return this.save();
};

module.exports = model("user", userSchema);
