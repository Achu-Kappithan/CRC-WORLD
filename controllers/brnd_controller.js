const brand = require("../models/brand");

//for loading berand page

const load_brand = async (req, res) => {
  try {
    const branddata = await brand.find({ is_deleted: false });
    return res.status(200).render("brand", { brand: branddata });
  } catch (err) {
    console.log("error for loding the brand page", err);
    return res
      .status(500)
      .render("404", { message: "unable to load brand page" });
  }
};

// load create new brand  page

const load_newbrand = async (req, res) => {
  try {
    return res.status(200).render("add_brand");
  } catch (err) {
    console.log("error for loading brand add page", err);
    return res
      .status(500)
      .render("404", { message: "unable to load add brand page" });
  }
};

// add new brand to database

const add_newbrand = async (req, res) => {
  try {
    const { brandname, branddescription } = req.body;
    const imageFile = req.file;

    if (!brandname || !branddescription || !imageFile) {
      req.flash('error', 'all fields including image are required');
      return res.redirect('/newbrand');
    }

    const newBrand = new brand({
      name: brandname,
      description: branddescription,
      image: imageFile.filename,
    });

    await newBrand.save();
    req.flash("success", "New brand created successfully");
    return res.status(200).redirect("/brand");
  } catch (err) {
    console.error("error for adding new brand", err);
    req.flash("error", "An error occurred while creating the brand");
    return res.status(500).redirect("/newbrand");
  }
};

// remove brand in the  list (delete)

const delete_brand = async (req, res) => {
  try {
    const id = req.query.id;
    console.log(id);
    const item = await brand.findByIdAndUpdate(id, { is_deleted: true });
    req.flash("success", "Brand deleted sucessfully");
    return res.status(200).redirect("/brand");
  } catch (err) {
    console.log("error for deleting the brand", err);
    return res.status(500).render("404", { message: "unable to delete brand" });
  }
};

//load editbrand  page

const edit_brand = async (req, res) => {
  try {
    const id = req.query.id;
    const branddata = await brand.findById({ _id: id });
    // console.log(branddata)
    return res.status(200).render("edite_brand", { data: branddata });
  } catch (err) {
    console.log("error for loading editit  brand page", err);
    return res
      .status(500)
      .render("404", { message: "unable to  edit brand data try again..!" });
  }
};

const update_brand = async (req, res) => {
  try {
    const id = req.body.id;
    const updateData = {
      name: req.body.brandname,
      description: req.body.branddescription,
    };

    if (req.file) {
      updateData.image = req.file.filename;
    }

    const updatedBrand = await brand.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!updatedBrand) {
      req.flash("error", "Brand not found");
      return res.status(404).redirect("/brand");
    }
    req.flash("success", "Brand updated successfully");
    return res.status(200).redirect("/brand");

  } catch (err) {

    console.error('error for upadatitng the brand',err);
    req.flash("error", "An error occurred while updating the brand");
    return res.stat.redirect("/brand");
  }
};

module.exports = {

  //  brand
  load_brand,
  load_newbrand,
  add_newbrand,
  delete_brand,
  edit_brand,
  update_brand,
  
};
