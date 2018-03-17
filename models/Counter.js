const mongoose = require("mongoose");

const counterSchemaObject = {
  _id: String,
  count: {type: Number, default: 1}
};

const counterSchema = mongoose.Schema(counterSchemaObject);
counterSchema.statics.getNextIndex = async function() {
  let result = await this.findByIdAndUpdate(
    "counter",
    { $inc: { count: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  )
  return result.count;
};;

const Counter = mongoose.model("Counter", counterSchema);


module.exports = Counter;
