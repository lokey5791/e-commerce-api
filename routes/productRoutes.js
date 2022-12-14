const express = require("express");
const router = express.Router();
const {
  authenticateUser,
  authorizeUser,
} = require("../middleware/authentication");

const {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
} = require("../controllers/productController");

const { getSingleProductReviews } = require("../controllers/reviewController");

router
  .route("/")
  .get(getAllProducts)
  .post(authenticateUser, authorizeUser("admin"), createProduct);

router.route("/uploadImage").post(uploadImage);

router
  .route("/:id")
  .get(getSingleProduct)
  .patch(authenticateUser, authorizeUser("admin"), updateProduct)
  .delete(authenticateUser, authorizeUser("admin"), deleteProduct);

router.route("/:id/reviews").get(getSingleProductReviews);

module.exports = router;
