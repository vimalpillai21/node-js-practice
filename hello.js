const Sequelize = require('sequelize');
let userList;
// Option 1: Passing parameters separately
const sequelize = new Sequelize('expressdemo', 'postgres', 'vimal@123', {
    host: 'localhost',
    dialect: 'postgres',/* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

sequelize
    .authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

const User = sequelize.define('user', {
    // attributes
    firstName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    lastName: {
        type: Sequelize.STRING
        // allowNull defaults to true
    }
}, {
    // options
});

// User.sync().then(() => {
//     // Now the `users` table in the database corresponds to the model definition
//     console.log('User instance created successfully');
//     return User.create({
//         firstName: 'John',
//         lastName: 'Hancock'
//     });
// });

// Find all users
User.findAll().then(users => {
    console.log(typeof users);
    userList = users;
    console.log("All users:", JSON.stringify(users, null, 4));
});

console.log('userList - ' + userList);
if(userList !== undefined) {
    userList.forEach(function (data) {
        console.log('Full Name - ' + data.firstName + ' ' + data.lastName);
    });
}
