const config = require("../conf/config");  

// var database_config = {  
//     server: config.sql.url, 
//     authentication: {
//         type: 'default',
//         options: {
//             userName: config.sql.user,
//             password: config.sql.password 
//         }
//     },
//     options: {
//         encrypt: true,
//         database: config.sql.database
//     }
// };

const database_config = { 
    user: config.sql.user, 
    password: config.sql.password, 
    server: config.sql.url, 
    database: config.sql.database,
};

module.exports = database_config;