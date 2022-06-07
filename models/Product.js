const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "please provide a name"],
      maxLength: [100, "Name cannot be more than 100 characters"],
    },
    price: {
      type: Number,
      required: [true, "please provide price"],
      default: 10,
    },
    description: {
      type: String,
      required: [true, "please provide product description"],
      maxLength: [1000, "Description cannot be more than 1000 characters"],
    },
    image: {
      type: String,
      // default:
      //   "https://res.cloudinary.com/dvazcm4fi/image/upload/v1654159236/file-upload/example_jrpw7r.jpg",
      default: "/uploads/couch.jpg",
    },
    category: {
      type: String,
      required: [true, "please provide category"],
      enum: ["bedroom", "office", "kitchen"],
    },
    company: {
      type: String,
      required: [true, "please provide company name"],
      enum: {
        values: ["ikea", "liddy", "marcos"],
        message: `{VALUE} is not supported`,
      },
    },
    colors: {
      type: [String],
      required: true,
      default: ["#222"],
    },
    featured: {
      type: Boolean,
      deafult: false,
    },
    freeShipping: {
      type: Boolean,
      deafult: false,
    },
    inventory: {
      type: Number,
      required: true,
      deafult: 15,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

ProductSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "product",
  justOne: false,
  // match :{rating:5}
});

ProductSchema.pre("remove", async function (next) {
  await this.model("Review").deleteMany({ product: this._id });
});

module.exports = mongoose.model("Product", ProductSchema);
