const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended : true}))
app.use(express.static("public"))

app.set("view engine", "ejs"); // setting ejs as view engine
//when using EJS always make a folder named "views"
const url = "mongodb+srv://9oPmZaMOa0pijMYR:9oPmZaMOa0pijMYR@cluster0.goiiwoi.mongodb.net/ToDoList"

mongoose.connect(url).then(()=>{
    console.log("connected")
}).catch(()=>{
    console.log("Not Connected")
})

const itemSchema = new mongoose.Schema({
    name:String
})
const Item = new mongoose.model("Item", itemSchema);

const listSchema = new mongoose.Schema({
    name : String,
    items : [itemSchema]
})
const List = new mongoose.model("List",  listSchema);


app.get("/", async (req, res)=>{
    let today = new Date();
    let currentDay = today.getDay();
    let day;
    var options = {
        weekday : "long",
        day : "numeric",
        month : "long",
        year : "numeric"
    }
    day = today.toLocaleDateString("en-us", options);

    try {
        // Retrieve all items from the database
        const items = await Item.find();
        if(items.length === 0){
            const item1 = new Item({
                name : "Welcome to your To-Do List"
            })
            item1.save().then(()=>{

                res.redirect("/");
            })
        }
        else{
            // Render an HTML page with the list of items
            res.render("list", {listTitle : day, listItems: items});
        }

    } catch (error) {
        // Handle errors
        console.error('Error retrieving items:', error);
        res.status(500).send('Internal Server Error');
    }

})
app.post("/", async (req, res)=>{
    var item = req.body.newItem;
    try {
        // Create a new item using the Mongoose model
        const newitem = new Item({
            name : item
        })

        // Save the item to the database
        await newitem.save();

        res.redirect("/");
    } catch (error) {
        // Handle errors
        console.error('Error adding item:', error);
        res.status(500).send('Internal Server Error');
    }   
    
})
app.post('/delete', async (req,res) => {
    const itemId = req.body.checkbox;
    try {
        // Find the item by ID and remove it from the database
      await Item.findOneAndDelete({ _id: itemId }).then(()=>{
        res.redirect("/");
      })

    } catch (error) {
        // Handle errors
        console.error('Error deleting item:', error);
        res.status(500).send('Internal Server Error');
    }
    
});


app.listen(3000, ()=>{
    console.log("Server is up and running");
})