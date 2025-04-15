import Product from "../models/product.model.js"; //import the Product model
import mongoose from "mongoose"; //import mongoose for object id validation

export const createProduct = async (req, res) => {
  try {
    res.status(201).json({ message: 'Create product' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    res.status(200).json({ message: 'Get all products' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find(); //get all products from the database
    res.status(200).json(products); //send the products as a response
  } catch (error) {
    console.log("Error GET method:", error.message); //log the error to the console
    res.status(500).json({ message: "Error fetching products" }); //send error message
  }
};

export const updateProduct = async (req, res) => {
  const { id } = req.params; //get the id from the url
  const product = req.body; //get the product data from the request body

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: "Invalid ID" }); //send error message if id is invalid
  }
  try {
    const updatedProduct = await Product.findByIdAndUpdate(id, product, { new: true }); //update the product in the database
    res.status(200).json(updatedProduct); //send the updated product as a response
  } catch (error) {
    console.log("Error PATCH method:", error.message); //log the error to the console
    res.status(500).json({ message: "Server Error" }); //send error message
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params; //get the id from the url

  try {
    await Product.findByIdAndDelete(id); //delete the product from the database
    res.status(200).json({ message: "Product deleted successfully" }); //send success message
  } catch (error) {
    console.log("Error DELETE method:", error.message); //log the error to the console
    res.status(500).json({ message: "Server Error" }); //send error message
  }
};

