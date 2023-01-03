const config = require("../conf/config");
const logger = require("../conf/logger");
const sql = require('mssql/msnodesqlv8');
const database_config = require("../middlewares/databaseConfiguration.js");
var moment = require('moment');  

const getFirst = async () => {
    const result = {
        statut: 200,
        data: [],
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
        .query(
            `
            SELECT LI.Id, LI.Name, LI.CreatedAt, TC.Name AS Type, U.FirstName, U.LastName
            FROM dbo.LoginIds AS LI
            LEFT JOIN (
                SELECT Id, Name
                FROM dbo.TypeConnections
                GROUP BY Id, Name
            ) AS TC ON LI.TypeConnectionId = TC.Id
            LEFT JOIN (
                SELECT Id, FirstName, LastName
                FROM dbo.Users
                GROUP BY Id, FirstName, LastName
            ) AS U ON LI.UserId = U.Id
            GROUP BY LI.Id, LI.Name, LI.CreatedAt, TC.Name, U.FirstName, U.LastName
            `
        ).then((data) => {
            const page = 1;
            const limit = 8;
            result.page.startIndex = (page - 1) * limit;
            result.page.endIndex = (page * limit > data.recordset.length)? data.recordset.length : page * limit;
            result.page.actualPage = page;
            result.page.totalIndex = data.recordset.length;

            if (result.page.endIndex < data.recordset.length) {
                result.page["next"] = {
                    page: page + 1,
                    limit: limit,
                }
            }

            if (result.page.startIndex > 0) {
                result.page["previous"] = {
                    page: page - 1,
                    limit: limit,
                }
            }

            result.data = data.recordset.slice(result.page.startIndex, result.page.endIndex);
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

const getApplicationWithPagination = async (entries) => {
    const result = {
        statut: 200,
        data: [],
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
        .query(
            `
            SELECT LI.Id, LI.Name, LI.CreatedAt, TC.Name AS Type, U.FirstName, U.LastName
            FROM dbo.LoginIds AS LI
            LEFT JOIN (
                SELECT Id, Name
                FROM dbo.TypeConnections
                GROUP BY Id, Name
            ) AS TC ON LI.TypeConnectionId = TC.Id
            LEFT JOIN (
                SELECT Id, FirstName, LastName
                FROM dbo.Users
                GROUP BY Id, FirstName, LastName
            ) AS U ON LI.UserId = U.Id
            GROUP BY LI.Id, LI.Name, LI.CreatedAt, TC.Name, U.FirstName, U.LastName
            `
        ).then((data) => {
            const page = parseInt(entries.page);
            const limit = parseInt(entries.limit);
            result.page.startIndex = (page - 1) * limit;
            result.page.endIndex = (page * limit > data.recordset.length)? data.recordset.length : page * limit;
            result.page.actualPage = page;
            result.page.totalIndex = data.recordset.length;

            if (result.page.endIndex < data.recordset.length) {
                result.page["next"] = {
                    page: page + 1,
                    limit: limit,
                }
            }

            if (result.page.startIndex > 0) {
                result.page["previous"] = {
                    page: page - 1,
                    limit: limit,
                }
            }

            result.data = data.recordset.slice(result.page.startIndex, result.page.endIndex);
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

const search = async (entries) => {
    const result = {
        statut: 200,
        data: [],
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
        .input("searchItem", sql.VarChar, entries.searchItem)
        .query(
            `
            SELECT LI.Id, LI.Name, LI.CreatedAt, TC.Name AS Type, U.FirstName, U.LastName
            FROM dbo.LoginIds AS LI
            LEFT JOIN (
                SELECT Id, Name
                FROM dbo.TypeConnections
                GROUP BY Id, Name
            ) AS TC ON LI.TypeConnectionId = TC.Id
            LEFT JOIN (
                SELECT Id, FirstName, LastName
                FROM dbo.Users
                GROUP BY Id, FirstName, LastName
            ) AS U ON LI.UserId = U.Id
            WHERE LI.Name LIKE '%${entries.searchItem}%'
            GROUP BY LI.Id, LI.Name, LI.CreatedAt, TC.Name, U.FirstName, U.LastName
            `
        ).then((data) => {
            const page = 1;
            const limit = data.recordset.length;
            result.page.startIndex = (page - 1) * limit;
            result.page.endIndex = (page * limit > data.recordset.length)? data.recordset.length : page * limit;
            result.page.actualPage = page;
            result.page.totalIndex = data.recordset.length;

            if (result.page.endIndex < data.recordset.length) {
                result.page["next"] = {
                    page: page + 1,
                    limit: limit,
                }
            }

            if (result.page.startIndex > 0) {
                result.page["previous"] = {
                    page: page - 1,
                    limit: limit,
                }
            }

            result.data = data.recordset.slice(result.page.startIndex, result.page.endIndex);
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

const save = async (entries) => {
    let result = {
        statut: 200,
        data: [],
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

    let thisDate = moment().format('YYYY-MM-DD');

    return await pool.request()
        .input("name", sql.VarChar, entries.name)
        .input("userId", sql.Int, entries.userId)
        .input("typeConnectionId", sql.Int, entries.typeConnectionId)
        .input("createdAt", sql.DateTime2, thisDate)
        .input("lastUpdatedAt", sql.DateTime2, thisDate)
        .query(
            `
            INSERT INTO dbo.LoginIds(Name, UserId, TypeConnectionId, CreatedAt, LastUpdatedAt, isDeleted)
            VALUES(
                @name,
                @userId,
                @typeConnectionId,
                @createdAt,
                @lastUpdatedAt,
                0
            )
            `
        ).then((data) => {
            result["message"] = "Success creation"
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

const edit = async (entries) => {
    let result = {
        statut: 200,
        data: [],
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

    return await pool.request()
        .input("id", sql.Int, entries.id)
        .input("name", sql.VarChar, entries.name)
        .query(
            `
            UPDATE dbo.TypeConnections
            SET Name = @name
            WHERE ID = @id
            `
        ).then((data) => {
            result["message"] = "Success creation"
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
    getFirst,
}