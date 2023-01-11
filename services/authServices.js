const config = require("../conf/config");
const logger = require("../conf/logger");
const sql = require('mssql/msnodesqlv8');
const database_config = require("../middlewares/databaseConfiguration.js");
const bcrypt = require("bcrypt");
var moment = require('moment');

const login = async(entries) => {
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
    let pool = await sql.connect(database_config);
    return pool.request()
        .input("name", sql.VarChar, entries.username)
        .query(
            `SELECT U.Id, U.FirstName, U.LastName, U.Password, U.IsAdmin, U.IsSuperAdmin FROM dbo.Users AS U JOIN dbo.LoginIds AS L ON U.Id = L.UserId WHERE L.Name = @name`
        ).then(async (data) => {
            console.log(data.recordset)
            if (data.recordset.length > 0) {
                if (data.recordset[0].IsAdmin == 1 || data.recordset[0].IsSuperAdmin == 1) {
                    if (await bcrypt.compare(entries.password, data.recordset[0].Password)) {
                        result.session["Id"] = data.recordset[0].Id;
                        result.session["FirstName"] = data.recordset[0].FirstName;
                    } else {
                        result.statut = 500;
                        result.error = true;
                        result.errorInfo = "Incorrect name or password";
                    }
                } else {
                    result.statut = 500;
                    result.error = true;
                    result.errorInfo = "You don't have a privilege";
                }
            } else {
                result.statut = 500;
                result.error = true;
                result.errorInfo = "You are not register please contact your admin";
            }
            return result;
        }).catch((error) => {
            result.statut = 500;
            result.error = true;
            result.errorInfo = "Please contact your admin";
            (config.env == "development") && console.log(`Error => ${error}`);
            (config.env == "production") && logger.error(`Error => ${error}`);
            return result;
        })
};

const getSetting = async(entries) => {
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
    let pool = await sql.connect(database_config);
    return pool.request()
        .input("id", sql.VarChar, entries.id)
        .query(
            `SELECT * FROM dbo.Users WHERE Id = @id`
        ).then((data) => {
            result.data["me"] = data.recordset;
            return result;
        }).catch((error) => {
            result.statut = 500;
            result.error = true;
            result.errorInfo = "Please contact your admin";
            (config.env == "development") && console.log(`Error => ${error}`);
            (config.env == "production") && logger.error(`Error => ${error}`);
            return result;
        })
}

const firstUser = async() => {
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
    let pool = await sql.connect(database_config);

    const password = await bcrypt.hash('I@m@Super(|)Admin@2023', 8);
    let thisDate = moment().format('YYYY-MM-DD');

    return pool.request()
        .input("name", sql.VarChar, "Admin")
        .query(
            `SELECT * FROM dbo.Users AS U JOIN dbo.LoginIds AS L ON U.Id = L.UserId WHERE L.Name = @name OR U.IsSuperAdmin = 1`
        ).then(async (data) => {
            if (data.recordset.length == 0) {
                return pool.request()
                .input("firstName", sql.VarChar, 'Admin')
                .input("lastName", sql.VarChar, 'Admin')
                .input("password", sql.VarChar, password)
                .input("createdAt", sql.DateTime2, thisDate)
                .input("lastUpdatedAt", sql.DateTime2, thisDate)
                .query(
                    `
                    INSERT INTO dbo.Users(FirstName, LastName, Password, CreatedAt, LastUpdatedAt, isDeleted, IsSuperAdmin)
                    VALUES(
                        @firstName,
                        @lastName,
                        @password,  
                        @createdAt,
                        @lastUpdatedAt,
                        0,
                        1
                    )
                    `
                ).then(async (data) => {
                    const superAdmin = await pool.request().query('SELECT * FROM dbo.Users WHERE IsSuperAdmin = 1')
                    console.log(superAdmin.recordset[0])
                    await pool.request()
                        .input("name", sql.VarChar, 'Admin')
                        .input("user", sql.Int, superAdmin.recordset[0].Id)
                        .input("createdAt", sql.DateTime2, thisDate)
                        .input("lastUpdatedAt", sql.DateTime2, thisDate)
                        .query(
                            `
                            INSERT INTO dbo.LoginIds(Name, Userid, CreatedAt, LastUpdatedAt, isDeleted)
                            VALUES(
                                @name,
                                @user,
                                @createdAt,
                                @lastUpdatedAt,
                                0
                            )
                            `
                        )
                    
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
        }).catch((error) => {
            result.statut = 500;
            result.error = true;
            result.errorInfo = "Please contact your admin";
            (config.env == "development") && console.log(`Error => ${error}`);
            (config.env == "production") && logger.error(`Error => ${error}`);
            return result;
        })
}

module.exports = {
    login,
    getSetting,
    firstUser,
}