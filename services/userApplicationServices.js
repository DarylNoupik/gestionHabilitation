const config = require("../conf/config");
const logger = require("../conf/logger");
const sql = require('mssql/msnodesqlv8');
const database_config = require("../middlewares/databaseConfiguration.js");
const bcrypt = require("bcrypt")
var moment = require('moment');

const getApplication = async (entries) => {
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
        .input("user", sql.Int, entries.user)
        .query(
            `
            SELECT A.Id, A.Name, A.Description, TC.Name AS typeConnection, LI.Name AS logId
            FROM dbo.Applications AS A
            JOIN dbo.ProfileMetier_Application AS PA
            ON A.Id = PA.ApplicationId
            JOIN dbo.ProfileMetiers AS PM
            ON PA.ProfileMetierId = PM.Id
            JOIN Users AS U
            ON U.ProfileMetierId = PM.Id
            LEFT JOIN dbo.TypeConnections AS TC
            ON A.TypeConnectionId = TC.Id
            LEFT JOIN dbo.LoginIds AS LI
            ON TC.Id = LI.TypeConnectionId AND U.Id = LI.UserId
            WHERE U.Id = @user
            `
        ).then(async(data) => {
            const page = 1;
            const limit = 10;
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
            result.data["applications"] = data.recordset.slice(result.page.startIndex, result.page.endIndex);
            const profileMetier = await pool.request().query("SELECT * FROM dbo.ProfileMetiers");
            result.data["profileMetier"] = profileMetier.recordset;
            const users = await pool.request().input("user", sql.Int, entries.user).query("SELECT * FROM dbo.Users WHERE Id = @user");
            result.data["user"] = users.recordset
            const resultConnections = await pool.request().query(`SELECT LI.Name, TC.Name AS typeConnection FROM dbo.LoginIds AS LI JOIN dbo.TypeConnections AS TC ON TC.Id = LI.TypeConnectionId WHERE UserId = ${result.data["user"][0]["Id"]}`);
            result.data["user"][0]["Connections"] = resultConnections.recordset;
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

const getAppRessourceByApplication = async (entries) => {
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
        .input("application", sql.Int, entries.application)
        .input("profileMetier", sql.Int, entries.profileMetier)
        .query(
            `
            SELECT PR.Id, PR.Name
            FROM dbo.ProfileMetier_ProfileRessource_Application AS PPA
            JOIN dbo.ProfileRessources AS PR
            ON PR.Id = PPA.ApplicationId
            WHERE PPA.ApplicationId = @application AND PPA.ProfileMetierId = @profileMetier
            `
        ).then(async(data) => {
            const page = 1;
            const limit = 10;
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
            result.data["profileRessources"] = data.recordset.slice(result.page.startIndex, result.page.endIndex);
            const profileMetiers = await pool.request().query("SELECT * FROM dbo.ProfileMetiers");
            result.data["profileMetiers"] = profileMetiers.recordset;
            const applications = await pool.request().input("application", sql.Int, entries.application).query("SELECT * FROM dbo.Applications WHERE Id = @application");
            result.data["applications"] = applications.recordset;
            const users = await pool.request().input("user", sql.Int, entries.user).query("SELECT * FROM dbo.Users WHERE Id = @user");
            result.data["user"] = users.recordset
            const resultConnections = await pool.request().query(`SELECT LI.Name, TC.Name AS typeConnection FROM dbo.LoginIds AS LI JOIN dbo.TypeConnections AS TC ON TC.Id = LI.TypeConnectionId WHERE UserId = ${result.data["user"][0]["Id"]}`);
            result.data["user"][0]["Connections"] = resultConnections.recordset;
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

module.exports = {
    getApplication,
    getAppRessourceByApplication,
}