const Sequelize = require('sequelize');
var sequelize = new Sequelize('dbauq2r3tetvgb', 'liijzsebztatfe', '19e1468660de61ffe2b3dc6030c0c6c95c4349719ebb2d68f9d2754473b322c7', {
    host: 'ec2-54-208-104-27.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});


// const users = [
//     {id: '1', fullName: 'User The First'},
//     {id: '2', fullName: 'User The Second'}
//   ];

const Post = sequelize.define('Post', {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN
});


const Category = sequelize.define('Category', {
    category: Sequelize.STRING
});

Post.belongsTo(Category, {
    foreignKey: 'category'
});

module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        sequelize.sync()
            .then(() => {
                resolve("database synced");
            })
            .catch(() => {
                reject("unable to sync database");
            })
    });
}

module.exports.getAllPosts = function () {
    return new Promise(function (resolve, reject) {
        Post.findAll()
            .then((data) => {
                resolve(data);
            })
            .catch(() => {
                reject("no results returned");
            })
    });
}

module.exports.getPublishedPosts = function () {
    return new Promise(function (resolve, reject) {
        Post.findAll()
            .then((data) => {
                resolve(data);
            })
            .catch(() => {
                reject("no results returned");
            })
    });
}

module.exports.getCategories = function () {
    return new Promise((resolve, reject) => {
        Category.findAll()
            .then((data) => {
                resolve(data);
            })
            .catch(() => {
                reject("no results returned");
            })
    });
}

module.exports.addPost = function (postData) {
    return new Promise((resolve, reject) => {
        postData.published = (postData.published) ? true : false;
        for (const prop in postData) {
            if (postData[prop] === "") {
                postData[prop] = null;
            }
        }

        postData.postDate = new Date();

        Post.create(postData)
            .then(resolve())
            .catch(reject('unable to create post'))
    });
}


module.exports.getPostsByCategory = (category) => {
    return new Promise(function (resolve, reject) {
        Post.findAll({
            where: {
                category: category
            }
        })
            .then((data) => {
                resolve(data);
            })
            .catch(() => {
                reject("no any results returned")
            })
    });
};

module.exports.getPostsByMinDate = (minimumDate) => {
    return new Promise((resolve, reject) => {
        const { gte } = Sequelize.Op;

        Post.findAll({
            where: {
                postDate: {
                    [gte]: new Date(minDateStr)
                }
            }
        }).then(data => {
            resolve(data);
        }).catch(err => {
            reject("no any results returned");
        });

    });
}

module.exports.getPostById = (id) => {
    return new Promise(function (resolve, reject) {
        Post.findAll({
            where: {
                id: id
            }
        })
            .then((data) => {
                resolve(data[0]); // there is only one result
            })
            .catch(() => {
                reject("no results returned")
            })
    });
}

module.exports.getPublishedPostsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                published: true,
                category: category
            }
        })
            .then((data) => {
                resolve(data);
            })
            .catch(() => {
                reject("no results returned")
            })
    });
}

module.exports.addCategory = (categoryData) => {
    return new Promise(function (resolve, reject) {
        // ensure all empty attributes are set to null
        for (var a in categoryData) {
            if (categoryData[a] == "") {
                categoryData[a] = null;
            }
        }
        Category.create(categoryData)
            .then(resolve())
            .catch(reject('unable to create category'))
    });
};

module.exports.deleteCategoryById = (id) => {
    return new Promise((resolve, reject) => {
        Category.destroy({
            where: {
                id: id
            }
        })
            .then(resolve())
            .catch(reject('unable to delete category'))
    })
};

module.exports.deletePostById = (id) => {
    return new Promise((resolve, reject) => {
        Post.destroy({
            where: {
                id: id
            }
        })
            .then(() => {
                resolve()
            })
            .catch(() => {
                reject('unable to delete post')
            })
    })
};
