const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const User = require("./models/user");
const Item = require("./models/items");
const Order = require("./models/orders")
const Category = require("./models/categories");
const Cart = require("./models/cart");
const { status } = require("express/lib/response");
const jwt = require('jsonwebtoken');
const authenticate = require("./middlewares/authMiddleware")
require('dotenv').config();
//Variables
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://cookingwebsite:cookingwebsite@wcookingwebsite.qj9rg.mongodb.net/cooking";
const saltRounds = 10;
// const JWT_SECRET = process.env.JWT_SECRET || 123;
const JWT_SECRET = "feroz123";

//create an express as app
const app = express();
//use body parser to get data from frontend as JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//Use cors for allowing cross-origin requests
app.use(cors());

// connect to mongo Db cloud
mongoose.connect(MONGO_URI,{
}).then(()=>{
    console.log("Connected to DB");
}).catch((err)=>{
    console.log(err);   
})

//run the server in the port -> 3000
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})

//Logics for the Platform

//get method for /
app.get("/", (req, res) => {
    res.send("Hello World!");
})

//post method for user registration
app.post("/register", (req, res) => {
    const { name, email, password,address } = req.body;
        //hasing Password and storing in db
        (async () => {
            const existingUser = await User.findOne({ email: email });
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            console.log(existingUser);
            if (existingUser) {
                //send response to server
                res.json({
                    message: "User already exists, please Login",
                    status: 400
                })
            }else{
            //create new User
            const  newUser =  new  User ({
                name:name,
                email:email,
                address:address,
                password: hashedPassword
            })
            newUser.save().then(() => {
                //send response to frontend
                res.json({
                    message: "user Created",
                    status: 200
            })
        }).catch((err) => {
            console.log(err);
        })}
        })();
})  
//end of user registration post method


// Generate JWT
function generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET); // Token valid for 1 hour
  }

//post method for login
app.post("/login", async(req, res) => {
    const { email, password } = req.body;
    const existingUser = await User.findOne({
        email: email
    })
    if (!existingUser) {

        //send response to frontend
        res.json({
            message: "User not found, please sign-up",
            status: 400
        })
    }else{
        const isValid = await bcrypt.compare(password, existingUser.password);
        const userId = existingUser._id;
        const userName = existingUser.name;
        //create a JWT Token for user
        const user = {id:userId, name:userName};
        const token = generateToken(user);
        console.log(token);

        console.log("userId, " + userId , userName);

        if (isValid) {
            //send response to frontend
            res.json({
                message: "User found",
                status: 200,
                token:token
            })
        }else{
            //send response to frontend
        res.json({
            message: "Wrong password",
            status: 400
        })
    }
}
})

//add Cart Items
app.post("/addcartitems",authenticate, async(req,res)=>{
    const {id, name, type , price , quantity, image, weight, category} = req.body;
    //decoded from JWT token User detials
    const userId = req.user.id;
    console.log(userId)
    console.log(id,name,type,category,price, quantity);
    const existingItem = await Cart.findOne({item_id:id,userId:userId})
    if(existingItem){
        console.log("Item already exists");
        res.json({
            message: "Item already exists",
            status: 400
            })
            }else{
                const newItem = new Cart({
                    userId:userId,
                    item_id:id,
                    item_name:name,
                    item_type:type,
                    item_price:price,
                    image:image,
                    weight:weight,
                    item_quantity:quantity,
                    category:category
                    })
                    await newItem.save()
                    console.log("Item added to cart");
                    res.json({
                        message: "Item added to cart",
                        status: 200
            })}                        
})

//DeleteCartItems
app.post("/removeCartItem",authenticate,(req,res)=>{
    const userId = req.user.id;
    const itemId = req.body.itemId;
    console.log(itemId);
    Cart.findOneAndDelete({userId:userId,item_id:itemId})
    .then((result)=>{
        console.log("Item deleted");
        res.json({
            message: "Item deleted",
            status: 200
            })
            })

            
})

//delete All Cart Items
app.post("/deleteCart",authenticate,async(req,res)=>{
    const userId = req.user.id;
    console.log(userId);
    await Cart.deleteMany({userId:userId})
    console.log("deleted")
});

//Add orders
app.post("/placeOrder",authenticate, (req, res)=>{
    const { items, total, address, date } = req.body;
    console.log(items, total, address, date)
    const userId = req.user.id;
    const newOrder = new Order({
        userId:userId,
        items:items,
        totalAmount:total,
        address:address,
        deliveredAt:date
    })
    newOrder.save().then(()=>{
        res.json({
            message: "Order placed successfully",
            status: 200
    })
}).catch((err)=>{
    res.json({
        message: "Error in placing order",
        status: 400
        })
})
})

//Add items to db
app.post("/additems", async (req, res) => {
    const { item_id, item_name, item_type, item_price, category } = req.body; // Include category_id in the request
    let ItemSaved = false;
    console.log(item_id, item_name, item_type, item_price, category)
    try {
        // Check if the item already exists
        const existingItem = await Item.findOne({ item_id: item_id });
        if (existingItem) {
            return res.json({
                message: "Item Already Exists with this ID",
                status: 400,
            });
        }

        // Check if the category exists
        const existingCategory = await Category.findOne({ category_name: category });
        if (!existingCategory) {
            return res.json({
                message: "Category Not Found",
                status: 404,
            });
        }

        // Create and save the new item
        const addItem = new Item({
            item_id,
            item_name,
            item_type,
            item_price,
            category: existingCategory._id, // Link to the category
        });

        await addItem.save();
        ItemSaved = true;

        res.json({
            message: "Item Saved Successfully and Linked to Category",
            status: 200,
        });
    } catch (err) {
        console.error("Error Saving Item:", err);
        res.json({
            message: "Item Not Saved",
            status: 400,
        });
    }
});
//Add Categories
app.post("/addCategories", async (req,res)=>{
    const {category_name, category_id} = req.body;
    let CategoryFlag = false
    console.log(category_name, category_id);
    const existingCategory = await Category.findOne({category_id : category_id});
    if (existingCategory){
        res.json({
            message:"Category Already Exist",
            status: 400
        })
    }else{
        try{
            const newCategory = new Category({
                category_id,
                category_name
            })
            newCategory.save().then(CategoryFlag = true)
            .catch((err)=>{console.log(err)})
        }
        catch(err){
            console.log(err);
            CategoryFlag = false;
        }
        
        if (CategoryFlag){
            res.json({
                message:"Category Added Successfully",
                status: 200
            })
        }else{
            res.json({
                message:"Category Not Added",
                status:400
                })
        }
    }
    
})

//Get All the categories from Db
app.post("/getCategories", (req,res)=>{
    Category.find({}).then((categories)=>{
        res.json({
            categories:categories,
            status:200
        })
    })
})

app.post("/getCart", authenticate ,(req,res)=>{
    const userId = req.user.id;
    Cart.find({userId:userId}).then((cart)=>{
        res.json({
            cart:cart,
            status:200
            })
            })  
})


//Get All The Items from Db
app.post("/getitems", (req,res)=>{
    Item.find().then((items)=>{
        res.json(items);
        }).catch((err)=>{
            res.json({message:err, status:400});
            })
})

app.post("/order", async (req, res)=>{
    const {email , items } = req.body;
    items.forEach(element => {
        
    });
    try{
        const existingOrder = await Order.findOne({email: email});
        console.log(existingOrder)
    }
    catch(err){
        console.log(err)
    }
})


