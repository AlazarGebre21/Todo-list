const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash")

let item1 = "";
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://AlazarGebre:test123@cluster0.vudjh.mongodb.net/todolistDB");


const listSchema = new mongoose.Schema({

  items:String,
  
});

const CustomListNameSchema = new mongoose.Schema({
  name:String,
  items:[listSchema]
})

const Item = new mongoose.model("Item",listSchema);

const CustomModel = new mongoose.model("CustomModel", CustomListNameSchema);

const first = new Item({
  items: "Write your todo's here"
});

const second = new Item({
  items: "Hit the plus button to add todo"
});

const third = new Item({
  items: "Click the box inorder to delete the todo"
})

const defaultList = [first,second,third];


app.get("/", async function(req, res) {

const day = date.getDate();

{
  try{
    const readItems = await Item.find();
    if(readItems.length==0)
    {
      Item.insertMany(defaultList)
      .then((docs)=>{
        console.log("successfully added the elements",docs);
      })
      .catch((err)=>{
        console.log("Error in inserting the documents",err);
      })
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: day, newListItems: readItems});

    }
  }catch(err)
  {
    console.log("Error");
  }
}


});

app.post("/", async function(req, res){

  const newItem = req.body.newItem;
  const listName = req.body.list;

    item1 = new Item({
    items:newItem,
  });

  if(listName==date.getDate()){
    item1.save();
    res.redirect("/");
  }
  else{
    const existingList = await CustomModel.findOne({name: listName});
      existingList.items.push(item1);
      existingList.save();
      res.redirect("/" + listName);
  

  }
});

app.post("/delete", async (req,res)=>{
  const itemId = req.body.checkbox;
  const listName = req.body.list;

if(listName == date.getDate()){
   await Item.findByIdAndDelete(itemId);
   console.log('successfully deleted item from the root route.');
   res.redirect('/');
  }
  else{
    await CustomModel.findOneAndUpdate(
      { name: listName }, // Find the list by name
      { $pull: { items: { _id: itemId } } } // Pull the item out of the items array by its _id
    );
    res.redirect('/' + listName);
  }


  });

app.get("/:CustomListName", async(req,res)=>{

  const CustomListName = _.capitalize(req.params.CustomListName);

  const existingList = await CustomModel.findOne({name: CustomListName});


  if(!existingList) {
    
    const customItem1 = new CustomModel({
      name:CustomListName,
      items: defaultList
    })

    customItem1.save();
    res.redirect("/" + CustomListName);
  }
  else{
    res.render("list", {listTitle: existingList.name, newListItems: existingList.items });

  }


})

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});