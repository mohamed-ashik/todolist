//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set("view engine", "ejs");

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(
  "mongodb+srv://admin-ashik:test123@cluster0-8f0i5.mongodb.net/mytodoDB",
  {
    useNewUrlParser: true
  }
);

const itemSchema = {
  name: String
};

const listSchema = {
  name: String,
  items: [itemSchema]
};

const Items = mongoose.model("Items", itemSchema);

const Lists = mongoose.model("Lists", listSchema);

const item1 = new Items({
  name: "carrot"
});

const item2 = new Items({
  name: "bringal"
});

const item3 = new Items({
  name: "radish"
});

const defaultItems = [item1, item2, item3];

app.get("/", function(req, res) {
  Items.find({}, function(err, items) {
    if (items.length === 0) {
      Items.insertMany(defaultItems, function(err) {
        if (!err) {
          console.log("items added successfully");
        }
        res.redirect("/");
      });
    } else {
      res.render("list", {
        listTitle: "today",
        newListItems: items
      });
    }
  });
});

app.get("/:customListName", function(req, res) {
  let customListName = _.capitalize(req.params.customListName);

  Lists.findOne({ name: customListName }, function(err, foundlist) {
    if (!foundlist) {
      const list = new Lists({
        name: customListName,
        items: defaultItems
      });
      list.save();
      res.redirect("/" + customListName);
    } else {
      res.render("list", {
        listTitle: foundlist.name,
        newListItems: foundlist.items
      });
    }
  });
});

app.post("/", function(req, res) {
  let newItem = req.body.newItem;
  let listName = req.body.list;
  item = new Items({
    name: newItem
  });

  if (listName === "today") {
    item.save();
    res.redirect("/");
  } else {
    Lists.findOne({ name: listName }, function(err, foundlist) {
      foundlist.items.push(item);
      foundlist.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req, res) {
  let id = req.body.checkbox;
  let listName = req.body.listName;

  if (listName === "today") {
    Items.findByIdAndRemove(id, function(err) {
      if (!err) {
        console.log("deleted successfully");
        res.redirect("/");
      }
    });
  } else {
    Lists.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: id } } },
      function(err, foundlist) {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

app.listen(process.env.PORT || "3000", function() {
  console.log("server started successfully");
});
