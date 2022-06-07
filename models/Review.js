const mongoose = require("mongoose");

const ReviewSchema = mongoose.Schema(
  {
    rating: {
      type: Number,
      required: [true, "Please provide ratings"],
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      trim: true,
      required: [true, "Please provide title"],
      maxLength: 100,
    },
    comment: {
      type: String,
      required: [true, "Please provide comment"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      reqired: true,
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      reqired: true,
    },
  },
  { timestamps: true }
);

ReviewSchema.index({ product: 1, user: 1 }, { unique: true });
//scheama static function
ReviewSchema.statics.calculateAverageRating = async function (productId) {
  const result = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        numOfReviews: {
          $sum: 1,
        },
      },
    },
  ]);
  //console.log(result);
  try {
    await this.model("Product").findOneAndUpdate(
      { _id: productId },
      {
        averageRating: Math.ceil(result[0]?.averageRating || 0),
        numOfReviews: result[0]?.numOfReviews || 0, //optional chaining
      }
    );
  } catch (err) {
    console.log(err);
  }
};

ReviewSchema.post("save", async function (next) {
  await this.constructor.calculateAverageRating(this.product);
});

ReviewSchema.post("remove", async function (next) {
  await this.constructor.calculateAverageRating(this.product);
});

module.exports = mongoose.model("Review", ReviewSchema);
