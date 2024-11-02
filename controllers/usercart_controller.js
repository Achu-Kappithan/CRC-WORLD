const Cart = require("../models/cart");
const Product = require("../models/product");

// for loading the cart page

const load_cart = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const message = req.flash("message");
    const type = req.flash("type");
    let cartdata = await Cart.findOne({ user: userId });
    if (!userId) {
      return res.status(401).render("user404",{
        message: "User not authenticated plz login with your Creditials",
      });
    }
    // console.log("this is the user cartpage data", cartdata);
    res.status(200).render("cart", { cartdata ,message, type });
  } catch (err) {
    console.log("error for loading cart page".err);
    res.status(500).render("user404", { message: "unable to load cart page" });
  }
};

// for adding products to the cart pages

const addto_cart = async (req, res) => {
  try {
    const { productId, quantity, Salesprice, stock, Cartsize , Offerprice } = req.body;
    const userId = req.session.user_id;
    console.log(
      "this is the data  get form the frondend for adding cart ",
      req.body
    );

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
        alertType: "error",
        alertTitle: "Authentication Error",
      });
    }

    let cart = await Cart.findOne({ user: userId });
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        alertType: "error",
        alertTitle: "Product Not Found",
      });
    }

    if (stock < quantity) {
      return res.status(400).json({
        success: false,
        message: "Not enough stock available",
        alertType: "error",
        alertTitle: "Stock Error",
        alertText: "The requested quantity exceeds available stock.",
      });
    }

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [
          {
            productId: product._id,
            name: product.productname,
            quantity: quantity,
            Salesprice: Salesprice,
            priceafteroffer : Offerprice,
            stock: stock,
            productimage: product.productimage,
            Taxrate: product.Taxrate,
            size: Cartsize,
          },
        ],
      });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) =>
          item.productId.toString() === productId && item.size === Cartsize
      );
      // console.log("This is datatbase size",cart.items[0].size)
      console.log(Cartsize);

      if (itemIndex > -1) {
        return res.status(404).json({
          success: false,
          message: "Product already in the cart with the same size",
          alertType: "warning",
          alertTitle: "Duplicate Product",
          alertText: "This product with the same size is already in your cart.",
        });
      } else {
        cart.items.push({
          productId: product._id,
          name: product.productname,
          quantity: quantity,
          Salesprice: Salesprice,
          stock: stock,
          productimage: product.productimage,
          Taxrate: product.Taxrate,
          size: Cartsize,
        });
      }
    }

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Product added to cart",
      cart,
      alertType: "success",
      alertTitle: "Added to Cart!",
      alertText: `Added ${quantity} of ${product.productname} to your cart!`,
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      alertType: "error",
      alertTitle: "Error",
      alertText:
        "There was a problem adding the product to your cart. Please try again.",
    });
  }
};

// for removing  a product from the cart

const remove_cartitem = async (req,res)=>{
  try {
    const id = req.body.id
    const userId = req.session.user_id;
    console.log("id from the form",id)
    console.log("id form session",userId )

    if(!userId){
      return res.status(401).json({ success: false, message: "Unauthorized user" });
    }
   const updatedcart = await Cart.findOneAndUpdate({user:userId},
      {$pull:{items:{_id:id}}},
      {new:true});

      if(!updatedcart){
        return res.status(404).json({ success: false, message: "Cart not found" });
      }
      return res.status(200).json({ success: true, message: "Item successfully removed" });

  } catch (err) {
    console.log("error for removing cartitem",err);
    return res.status(500).json({ success: false, message: "Unable to complete the request. Try again!" });
  }
}


// for updating  the quentity of  items in the database

const update_quentity = async (req,res)=>{
  try {
    const userId = req.session.user_id;
    const { itemId, quantity } = req.body;
    const itemdata = await Cart.findOne({user:userId})

    const availablequentity = itemdata.items.find(item => {
        return item.productId.toString() === itemId.toString();
    })?.stock;

    if(availablequentity >= quantity){
       await Cart.findOneAndUpdate(
        {user:userId,"items.productId": itemId},
        {$set:{"items.$.quantity":quantity}},
        {new: true}
      )
      res.json({ success: true }); 
    } else {
      res.json({ stockError: true }); 
    }
    res.json()

  } catch (err) {
    console.log("error for updating the quentity from the cart ",err)
  }
}

module.exports = {
  load_cart,
  addto_cart,
  remove_cartitem,
  update_quentity
};
