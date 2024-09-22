const product = require("../models/product");
const brand = require("../models/brand");
const category = require("../models/category");

// for loading product view page
const load_productview = async (req,res)=>{
    try {
        const id = req.query.id;
       const productdata= await product.findOne({_id:id})
       return res.render("productview",{productdata})
        
    } catch (err) {
        console.log(err)
        
    }
}


// for loading shop page

const load_shop = async (req,res)=>{
    try {
       
        const branddata = await brand.find({is_delited:false})
        const catdata  = await category.find({is_delited:false})
        const catid = req.query.id;
        const selectedBrands = req.query.brands ? req.query.brands.split(',') : [];

        // console.log("this is catid ",catid)

        const sortOption = req.query.sort
        // console.log(sortOption)

        let sortCriteria = {};
        switch (sortOption) {
            case 'price_asc':
                sortCriteria = { Salesprice: 1 };
                break;
            case 'price_desc':
                sortCriteria = { Salesprice: -1 };
                break;
            case 'name_asc':
                sortCriteria = { productname: 1 };
                break;
            case 'name_desc':
                sortCriteria = { productname: -1 };
                break;
            default:
                sortCriteria = {};
        }

        const filterCriteria = {is_delited:false}

        if(catid){
            filterCriteria.category=catid
        }

        if (selectedBrands.length > 0) {
            filterCriteria.brand = { $in: selectedBrands }; 
        }

        // console.log("this is the filter creaiteria",filterCriteria);
        
        const productdata = await product.find(filterCriteria).sort(sortCriteria)
        return res.render("usershop",{productdata,branddata,catdata})
        
    } catch (err) {
        console.log(err)
        res.status(500).send("Internal Server Error");
    }
}



module.exports = {
    load_productview,
    load_shop
}