const config = require("../conf/config");
const logger = require("../conf/logger");
const sql = require('mssql/msnodesqlv8');
const database_config = require("../middlewares/databaseConfiguration.js");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt")
var moment = require('moment');

const getUserInformation = async (token) => {
    const result = {
        statut: 200,
        data: {},
        page:{
            startIndex: 0,
            endIndex: 0,
            totalIndex: 0,
            actualPage: 0,
        },
        session: {},
        error: false,
        errorInfo: "",
    };

    return jwt.verify(token, 'SGC Habilitation', async (err, decodedToken) => {
        // Verified token
        if (err) {
            console.log(err);
        } else {
            let pool = await sql.connect(database_config);
            return pool.request()
                .input("id", sql.VarChar, decodedToken.id.Id)
                .query(
                    `
                    SELECT * FROM dbo.Users
                    WHERE Id = @id
                    `
                ).then(async(data) => {
                    result.data = data.recordset[0];
                    console.log(result)
                    return result;
                }).catch((error) => {
                    result.statut = 500;
                    result.error = true;
                    result.errorInfo = "Please contact Admin";
                    (config.env == "development") && console.log(`Error => ${error}`);
                    (config.env == "production") && logger.error(`Error => ${error}`);
                    return result;
                })
        }
    })
}

const updateInformation = async (entries) => {
    let result = {
        statut: 200,
        data: {},
        page:{
            startIndex: 0,
            endIndex: 0,
            totalIndex: 0,
            actualPage: 0,
        },
        session: {},
        error: false,
        errorInfo: "",
    };

    let thisDate = moment().format('YYYY-MM-DD');
    console.log(entries)
    return jwt.verify(entries.token, 'SGC Habilitation', async (err, decodedToken) => {
        if (err) {
            result.statut = 500;
            result.error = true;
            result.errorInfo = "Error during the creation please retry";
            (config.env == "development") && console.log(`Error => ${err}`);
            (config.env == "production") && logger.error(`Error => ${err}`);
            return result;
        } else {
            let pool = await sql.connect(database_config);
            return pool.request()
                .input("id", sql.Int, decodedToken.id.Id)
                .input("firstName", sql.VarChar, entries.firstName.toLowerCase())
                .input("lastName", sql.VarChar, entries.lastName.toLowerCase())
                .input("phoneNumber", sql.VarChar, entries.phoneNumber)
                .input("lastUpdatedAt", sql.DateTime2, thisDate)
                .query(
                    `
                    UPDATE dbo.Users
                    SET FirstName = @firstName, LastName = @lastName, PhoneNumber = @phoneNumber, LastUpdatedAt = @lastUpdatedAt
                    WHERE Id = @id
                    `
                ).then((data) => {
                    console.log(data);
                    result["message"] = "Update creation"
                    return result;
                }).catch((error) => {
                    result.statut = 500;
                    result.error = true;
                    result.errorInfo = "Error during the creation please retry";
                    (config.env == "development") && console.log(`Error => ${error}`);
                    (config.env == "production") && logger.error(`Error => ${error}`);
                    return result;
                })
        }
    })
    
}

const changePassword = async (entries) => {
    let result = {
        statut: 200,
        data: {},
        page:{
            startIndex: 0,
            endIndex: 0,
            totalIndex: 0,
            actualPage: 0,
        },
        session: {},
        error: false,
        errorInfo: "",
    };

    let thisDate = moment().format('YYYY-MM-DD');

    const password = await bcrypt.hash(entries.firstName, 8)

    return pool.request()
        .input("lastUpdatedAt", sql.DateTime2, thisDate)
        .input("password", sql.VarChar, password)
        .query(
            `
            UPDATE dbo.Users
            SET Password = @password, LastUpdatedAt = @lastUpdatedAt
            WHERE Id = @id
            `
        ).then((data) => {
            console.log(data);
            result["message"] = "Operation successful"
            return result;
        }).catch((error) => {
            result.statut = 500;
            result.error = true;
            result.errorInfo = "Error during the creation please retry";
            (config.env == "development") && console.log(`Error => ${error}`);
            (config.env == "production") && logger.error(`Error => ${error}`);
            return result;
        })
}

module.exports = {
    getUserInformation,
    updateInformation,
    changePassword,
}