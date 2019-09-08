// "use strict"
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const _ = require('lodash')


const port = 3000
const app = express()

app.set("view engine", "ejs")

app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended: true}))

mongoose.connect("mongodb+srv://minhtodolist:minhtodolist12@cluster0-lq48x.gcp.mongodb.net/todolistDB", {useNewUrlParser: true})

const itemsSchema = {
    name: String
}

const Item = mongoose.model("Item", itemsSchema)

const item1 = new Item({
    name: "Welcome todolist"
})

const item2 = new Item({
    name: "Click add button to create new item"
})

const item3 = new Item({
    name: "Click checkbox to delete item"
})

const defaultItems = [item1, item2, item3]

const listSchema = {
    name: String,
    items: [itemsSchema]
}

const List = mongoose.model("List", listSchema)

app.get('/', (req, res) => {
    
    Item.find({}, (err, foundItems) =>{
        if (foundItems.length === 0) {
                Item.insertMany(defaultItems, (err) =>{
                if (err) {
                    console.log(err);
                } else {
                    console.log("Successly saved data to DB!");
                }
            })
            res.redirect('/')
        } else {
            res.render("list", {listTitle: "Today", newItem: foundItems})
        }

    })
    
})

app.post("/", (req, res) =>{

    let itemNane = req.body.todo
    let listName = req.body.list

    const item = new Item({
        name: itemNane
    })

    if (listName === "Today") {
        item.save()
        res.redirect("/")
    } else {
        List.findOne({ name: listName}, function(err, foundList) {
            foundList.items.push(item)
            foundList.save()
            res.redirect("/" + listName)
        })
    }
    
});

app.post("/delete", (req, res) => {
    const checkItem = _.capitalize(req.body.checkbox)
    const listName = req.body.listName
    if (listName === "Today") {
        Item.findByIdAndRemove(checkItem, (err) => {
            if (!err) {
                console.log('Remove item successly!');
                res.redirect('/')
            } 
        })
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id:checkItem}}}, (err, foundList) =>{
            if (!err) {
                res.redirect("/" + listName)
            }
        })
    }

    
}) 

app.get("/:customList", (req, res) => {
    const customList = req.params.customList

    List.findOne({ name: customList}, (err, foundList)=>{
        if (!err) {
            if (!foundList) {
                // Create a new list
                const list = new List({
                    name: customList,
                    items: defaultItems
                })
                list.save()
                res.redirect('/' + customList)
            } else {
                // Show an exsit list
                res.render("list", {listTitle: foundList.name, newItem: foundList.items})
            }
        }
    })

    
})

app.listen(port, () => {
    console.log(`Server start on ${port}`);
})
