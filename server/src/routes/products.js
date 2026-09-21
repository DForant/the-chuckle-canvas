import express from "express";
import { fetchProductBySlug, ProductNotFoundError } from "../services/cms.js";

const router = express.Router();

router.get("/api/products/:slug", async (req, res, next) => {
  try {
    const { slug } = req.params;
    if (!slug) {
      return res.status(404).json({
        error: { message: "Product not found", status: 404 }
      });
    }

    const product = await fetchProductBySlug(slug);
    return res.status(200).json(product);
  } catch (error) {
    if (error.status === 404 || error instanceof ProductNotFoundError || error.name === "ProductNotFoundError") {
      return res.status(404).json({
        error: {
          message: "Product not found",
          status: 404
        }
      });
    }
    return res.status(500).json({
      error: {
        message: "Internal server error",
        status: 500
      }
    });
  }
});

export default router;
