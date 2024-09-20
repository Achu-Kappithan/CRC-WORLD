const brand = require("../models/brand")
const cloudinary = require("cloudinary")

// for loding brand page

const load_brand = async (req,res)=>{
    try {
      const branddata = await brand.find({is_delited:false})
      return res.render("brand",{brand:branddata})
    } catch (err) {
        console.log(err)
        
    }
}


// load create new brand  page

const load_newbrand = async (req,res)=>{
    try {
       return res.render("add_brand")
    } catch (err) {
        console.log(err)
    }
}

// add new brand to database

const add_newbrand = async (req, res) => {
    try {
      const { brandname, branddescription } = req.body;
      const imageFile = req.file;
  
      if (!brandname || !branddescription || !imageFile) {
        req.flash('error', 'All fields including image are required');
        return res.redirect('/newbrand');
      }
  
      const newBrand = new brand({
        name: brandname,
        description: branddescription,
        image: imageFile.filename
      });
  
      await newBrand.save();
      req.flash('success', 'New brand created successfully');
      return res.redirect('/brand');
    } catch (err) {
      console.error(err);
      req.flash('error', 'An error occurred while creating the brand');
      res.redirect('/newbrand');
    }
};


// remove brand in the  list (delete)

const delete_brand = async (req,res)=>{
  try {
    const id =  req.query.id;
    console.log(id)
    const item = await brand.findByIdAndUpdate(id,{is_delited: true});
    req.flash("success","Brand deleted sucessfully")
    return res.redirect("/brand")
    
  } catch (err) {
    consolelog(err)
    
  }
}

//load editbrand  page

const edit_brand = async(req,res)=>{
  try {
    const id = req.query.id;
    const branddata = await brand.findById({_id:id})
    // console.log(branddata)
      res.render("edite_brand",{data:branddata})
  } catch (err) {
    console.log(err)
    
  }
}


// update edite brand details to the database

const update_brand = async (req, res) => {
  try {
    const id = req.body.id;
    const updateData = {
      name: req.body.brandname,
      description: req.body.branddescription,
    };

    // If a new file is uploaded, add it to the update data
    if (req.file) {
      updateData.image = req.file.filename;
    }

    const updatedBrand = await brand.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true } // This option returns the updated document
    );

    if (!updatedBrand) {
      req.flash("error", "Brand not found");
      return res.redirect("/brand");
    }

    req.flash("success", "Brand updated successfully");
    return res.redirect("/brand");

  } catch (err) {
    console.error(err);
    req.flash("error", "An error occurred while updating the brand");
    return res.redirect("/brand");
  }
};






module.exports ={
    //  brand
    load_brand,
    load_newbrand,
    add_newbrand,
    delete_brand,
    edit_brand,
    update_brand

}