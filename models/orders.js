const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  item_id: { type: String, required: true },
  item_name: { type: String, required: true },
  item_quantity: { type: Number, required: true },
  image: { type: String, required: true },
  weight: { type: String, required: true },
  item_price: { type: Number, default: 1000 },
});

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  address: { type: String, required: true },
  placedAt: { type: Date, default: Date.now },
  deliveredAt: { type: Date },
});

// Calculate totalAmount before saving the order
orderSchema.pre('save', function (next) {
  let total = 0;
  this.items.forEach(item => {
    total += item.item_price * item.item_quantity;
  });
  this.totalAmount = total;
  next();
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
