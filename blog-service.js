const fs = require("fs");
const { resolve } = require("path");

let posts = []
let categories = []

// const users = [
//     {id: '1', fullName: 'User The First'},
//     {id: '2', fullName: 'User The Second'}
//   ];


module.exports.initialize = function(){
    return new Promise((resolve, reject) => {
        fs.readFile("./data/posts.json", "utf-8", (err, data) => {
            if (err) {
                reject(err);
            } else {
                posts = JSON.parse(data);
                resolve();
            }
        });
        fs.readFile("./data/categories.json", "utf-8", (err, data) => {
            if (err) {
                reject(err);
            } else {
                categories = JSON.parse(data);
                resolve();
            }
        });
    });
}

module.exports.getAllPosts = function () {
    return new Promise((resolve, reject) => {
        if (posts.length == 0) {
            reject("no results returned");
        } else {
            resolve(posts);
        }
    });
}

module.exports.getPublishedPosts = function() {
    return new Promise((resolve, reject) => {
        if (posts.length == 0) {
            reject("no results returned");
        } else {
            resolve(posts);
        }

    });
}

module.exports.getCategories = function() {
    return new Promise((resolve, reject) => {
        if (categories.length == 0) {
            reject("No any results returned");
        } else {
            resolve(categories);
        }
    });
}

module.exports.addPost = function(postData) {
    return new Promise((resolve, reject) => {
        if(!postData.published)
        {
            postData.published = false;
        }
        const date = new Date();
        const postedDate = `${date.getFullYear()}-${
            (date.getMonth() < 10 ? "0" : "") + ((date.getMonth()+1))
        }-${(date.getDate() < 10 ? "0" : "") + date.getDate()}`;
        postData.postDate = postedDate;
        postData.id = 1 + posts.length;
        posts.push(postData);        
        resolve(posts[posts.length - 1]);
    });
  }

  
module.exports.getPostsByCategory = (category) => { 
    return new Promise((resolve, reject) => {
        let postsByCategory = posts.filter(a => a.category == category);

        if (postsByCategory.length == 0) {
            reject("No any results returned"); return;
        } 
       resolve(postsByCategory);     
    })
};


module.exports.getPostsByMinDate = (minimumDate) => {
    return new Promise((resolve, reject) => {
        let filterPosts = posts.filter(a => new Date(a.postDate) > new Date(minimumDate));
       
        if (filterPosts.length == 0) {
            reject("No any results returned"); return;
        } 
        resolve(filterPosts);
    });
}

module.exports.getPostById = (id) => {
    return new Promise((resolve, reject) => {
        let aPost = posts.filter(a => a.id == id);
        
        if (aPost.length == 0) {
            reject("No any results returned"); return;
        } 
       resolve(aPost);     
    })
}

module.exports.getPublishedPostsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        let publishedPosts = posts.filter(post => post.published == true && post.category == category);

        if (publishedPosts.length == 0) {
            reject("no results returned"); return;
        } 
       resolve(publishedPosts);     
    })
}
