const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");


const app = express(); //object of module express

mongoose.connect("mongodb+srv://anmol:114131512@cluster0.ixxmu.mongodb.net/todolistDB?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true});

const itemSchema = {
    name: String
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
    name: "Welcome to your todolist!"
});

const item2 = new Item({
    name: "Hit the + button to add a new item"
});

const item3 = new Item({
    name: "<-- Hit this button to delete an item"
})

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String, //name of list
    items: [itemSchema]
};

const List = mongoose.model("List", listSchema);


app.set('view engine', 'ejs'); //make app require ejs

app.use(bodyParser.urlencoded({extended: true})); 

app.use(express.static("public")); 

app.get('/', function(req, res){

    Item.find({}, function(err, foundItems) {
        if(foundItems.length === 0) {
            Item.insertMany(defaultItems, function(err) {
                if(err) {
                    console.log(err);
                } else {
                    console.log("Default items added to todolistDB.");
                }
            });
        } //if todolist is empty, add default items

        res.render("list", {
            listTitle: "Today",
            newlistItem: foundItems
        });
    });

});

app.get('/:customListName', function(req, res){
    const customListName = req.params.customListName;

    List.findOne({name: customListName}, function(err, foundList) {
        if(!err) {
            if(!foundList) {
                const foundList = new List ({
                    name: customListName,
                    items: defaultItems
                });

                foundList.save();
                res.redirect("/" + customListName);
            } else {
            res.render("list", {listTitle: foundList.name, newlistItem: foundList.items })
            }
                
        }
    })

});

app.post('/', function(req, res){

    let itemName = req.body.newItem;
    let listName = req.body.list;
   
    const item = new Item({
        name: itemName
    });

    if(listName === "Today") {
        item.save();

        res.redirect("/");

    } else {
        List.findOne({name: listName}, function(err, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }


});

app.post("/delete", function(req, res) {
    const checkItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today") {
        Item.findByIdAndRemove(checkItemId, function(err) {});
        res.redirect('/');
    } else {
        List.findOneAndUpdate(
        {name: listName},
        {$pull: {items: {_id: checkItemId}}},
        function(err, foundList) {
            if(!err) {
                res.redirect("/" + listName);
            }

        });
    }

});


app.get('/about', function(req, res){
    res.render("about");
});

app.listen(3000, function(){

    console.log("Server running on port 3000");

});