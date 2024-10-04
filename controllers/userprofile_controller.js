const User = require("../models/user_models");
const Address = require("../models/address");


// for loading  userprofile page

const load_userprofile = async (req,res)=>{
    try {
        const userId = req.session.user_id;
        const userdata =  await User.findById({_id:userId}).populate('addressId').exec()
        const message = req.flash("message");
        const type =  req.flash("type");
        // console.log("this is the data send to user profile",userdata)
        res.status(200).render("userprofile",{userdata , message, type})
        
    } catch (err) {
        console.log("error for loading user profile",err)
        res.status(500).render("user404",{message:"Unable to load user profile"})
        
    }
}

// add new addrss to the database

const add_newaddress = async (req,res)=>{
    try {
        const { name, email, housename, locality, district, state, pincode, phonenumber, altnumber, landmark} =req.body
        const userid = req.session.user_id;
        
        if(!userid){
            req.flash("message","User is Not valid");
            req.flash("type","error")
            res.statun(4001).redirect("/user_Profile")
            console.log("userId is not valid",userid)
        }


        const address = new Address({
            name : name,
            userId : userid, 
            phone : phonenumber,
            pincode : pincode,
            locality : locality,
            housename : housename,
            district : district,
            state : state,
            landMark : landmark,
            altPhone : altnumber,
            email : email
        })
         const addressData =await address.save()

         const pushAddressIntoUser = await User.findByIdAndUpdate(
            { _id: userid },
            { $push: { addressId: addressData._id } },
            { new: true }
        );
        req.flash("message","Adress Added Sucessfully");
        req.flash("type","success")
        res.status(200).redirect("/user_Profile")
    } catch (err) {
        console.log("error for adding address",err)
        res.status(500).render("user404",{message:"unable to add address try again...!"})
    }
}

//  for updating existing address

const update_address = async (req,res)=>{
    try {
        const id = req.query.id;
        const {name, housename, locality, district, state, pincode, phone, landmark, altphone}= req.body
        console.log("this is the data for the new updateion",req.body)
        console.log('this is the id for update address',id)


        await Address.findByIdAndUpdate(id,{
            $set:{  name : name,
                phone : phone,
                pincode : pincode,
                locality : locality,
                housename : housename,
                district : district,
                state : state,
                landMark : landmark,
                altPhone : altphone 
            }
        });
        req.flash("message","Address Upated successfully")
        req.flash("type","success")
        res.status(200).redirect("/user_Profile")
    } catch (err) {
        console.log("error for updating the user address",err)
        req.flash("message","Fail to updae the addrss try again..!")
        req.flash("type","error")
        res.status(500).redirect("/user_Profile")
        
    }
}

const delete_address = async (req,res)=>{
    try {
        const addressid = req.query.id
        const userId = req.session.user_id;

        await Address.findByIdAndDelete(addressid)
        await User.findByIdAndUpdate(userId,{
            $pull :{addressId :addressid}
        });
        req.flash("message","Address successfully removed")
        req.flash("type","success")
        res.status(200).redirect("/user_Profile")
    } catch (err) {
        console.log("error for deleting user addresss",err)
        req.flash("message","Something went Wrong please Try again...!")
        req.flash("type","error")
        res.status(500).redirect("/user_Profile")
        
    }
}







module.exports = {
    load_userprofile,
    add_newaddress,
    update_address,
    delete_address
}