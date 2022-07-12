/*********************************************************************************
 *  WEB322 – Assignment 03
 *  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source
 *  (including 3rd party web sites) or distributed to other students.
 *
 *  Name: Samir Chaulagain Student ID: 109946160 Date: 11 July 2022
 *
 *  Online (Heroku) URL: ________________________________________________________
 *
 *  GitHub Repository URL: https://github.com/samirchau/assignment4
 */

var express = require("express");
var path = require("path");
var blogservice = require("./blog-service");
var app = express();
const multer = require("multer");
const upload = multer();
const exphbs = require("express-handlebars");

const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const posts = require("./data/posts.json");
const categories = require("./data/categories.json");
const { rmSync } = require("fs");
const stripJs = require("strip-js");

var HTTP_PORT = process.env.PORT || 8080;

// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on : " + HTTP_PORT);
}

app.use(express.static("public"));

app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
    helpers: {
      navLink: function (url, options) {
        return (
          "<li" +
          (url == app.locals.activeRoute ? ' class="active" ' : "") +
          '><a href="' +
          url +
          '">' +
          options.fn(this) +
          "</a></li>"
        );
      },
      equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
          return options.inverse(this);
        } else {
          return options.fn(this);
        }
      },
      safeHTML: function (context) {
        return stripJs(context);
      },
    },
  })
);

app.set("view engine", ".hbs");

app.use(function (req, res, next) {
  let route = req.path.substring(1);
  app.locals.activeRoute =
    "/" +
    (isNaN(route.split("/")[1])
      ? route.replace(/\/(?!.*)/, "")
      : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});

//static
app.use(express.static("public"));

// setup a 'route' to listen on the default url path (http://localhost)
app.get("/", function (req, res) {
  res.redirect("/about");
  //res.send("Hello World")
});

// setup another route to listen on /about
app.get("/about", function (req, res) {
  // res.sendFile(path.join(__dirname, "/views/about.html"));
  res.render(path.join(__dirname, "/views/about.hbs"));
});

app.get("/posts/add", (req, res) => {
  //res.sendFile(path.join(__dirname, "/views/addPost.html"));
  res.render(path.join(__dirname, "/views/addPost.hbs"));
  //res.redirect('/posts');
});

cloudinary.config({
  cloud_name: "dzspzxuuh",
  api_key: "334788877713864",
  api_secret: "E2W2p72B_sWrQsyYxJ2V7Jvz-dM",
  secure: true,
});

// TODO: get all posts who have published==true
app.get("/blog", async (req, res) => {
  // Declare an object to store properties for the view
  let viewData = {};

  try {
    // declare empty array to hold "post" objects
    let posts = [];

    // if there's a "category" query, filter the returned posts by category
    if (req.query.category) {
      // Obtain the published "posts" by category
      posts = await blogservice.getPublishedPostsByCategory(req.query.category);
    } else {
      // Obtain the published "posts"
      posts = await blogservice.getPublishedPosts();
    }

    // sort the published posts by postDate
    posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    // get the latest post from the front of the list (element 0)
    let post = posts[0];

    // store the "posts" and "post" data in the viewData object (to be passed to the view)
    viewData.posts = posts;
    viewData.post = post;
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the full list of "categories"
    let categories = await blogservice.getCategories();

    // store the "categories" data in the viewData object (to be passed to the view)
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results";
  }

  // render the "blog" view with all of the data (viewData)
  res.render("blog", { data: viewData });
});

app.get("/blog/:id", async (req, res) => {
  // Declare an object to store properties for the view
  let viewData = {};

  try {
    // declare empty array to hold "post" objects
    let posts = [];

    // if there's a "category" query, filter the returned posts by category
    if (req.query.category) {
      // Obtain the published "posts" by category
      posts = await blogservice.getPublishedPostsByCategory(req.query.category);
    } else {
      // Obtain the published "posts"
      posts = await blogservice.getPublishedPosts();
    }

    // sort the published posts by postDate
    posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    // store the "posts" and "post" data in the viewData object (to be passed to the view)
    viewData.posts = posts;
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the post by "id"
    viewData.post = await blogservice.getPostById(req.params.id);
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the full list of "categories"
    let categories = await blogservice.getCategories();

    // store the "categories" data in the viewData object (to be passed to the view)
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results";
  }

  // render the "blog" view with all of the data (viewData)
  res.render("blog", { data: viewData });
});

app.get("/posts", function (req, res) {
  // TODO: return a JSON formatted string containing all the posts within the posts.json files
  let category = req.query.category;
  let minDate = req.query.minDate;

  if (category) {
    blogservice
      .getPostsByCategory(category)
      .then((data) => {
        // res.send(data);
        res.render("posts", { posts: data });
      })
      .catch((err) => {
        // res.send({ message: err });
        res.render("posts", { message: "no results" });
      });
  } else if (minDate != "" && minDate != null) {
    blogservice
      .getPostsByMinDate(minDate)
      .then((data) => {
        // res.send(data);
        res.render("posts", { posts: data });
      })
      .catch((err) => {
        // res.send({ message: err });
        res.render("posts", { message: "no results" });
      });
  } else {
    blogservice
      .getAllPosts()
      .then((data) => {
        // res.send(data);
        res.render("posts", { posts: data });
      })
      .catch((err) => {
        //res.send({ message: err });
        res.render("posts", { message: "no results" });
      });
  }
});

app.get("/categories", function (req, res) {
  // TODO: return a JSON formatted string containing all of the categories within the categories.json file
  blogservice
    .getCategories()
    .then((data) => {
      //res.send(categories);
      res.render("categories", { categories: data });
    })
    .catch((err) => {
      //res.status(500).send(err);
      res.render("categories", { message: "no results" });
    });
});

app.get("/post/:value", (req, res) => {
  blogservice
    .getPostById(req.params.value)
    .then((data) => {
      res.json({ data });
    })
    .catch((err) => {
      res.json({ message: err });
    });
});

app.post("/posts/add", upload.single("featureImage"), (req, res) => {
  if (req.file) {
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        });

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    async function upload(req) {
      let result = await streamUpload(req);
      console.log(result);
      return result;
    }

    upload(req).then((uploaded) => {
      processPost(uploaded.url);
    });
  } else {
    processPost("");
  }

  function processPost(imageUrl) {
    req.body.featureImage = imageUrl;

    // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts

    blogservice
      .addPost(req.body)
      .then(() => {
        res.redirect("/posts");
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
});

blogservice
  .initialize()
  .then(() => {
    app.listen(HTTP_PORT, onHttpStart);
  })
  .catch((err) => {
    console.log(err);
  });
