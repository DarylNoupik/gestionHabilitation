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

const getSpecialApplicationForUser = async (entries) => {
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
            JOIN dbo.User_Application AS UA
            ON A.Id = UA.ApplicationId
            JOIN Users AS U
            ON U.Id = UA.UserId
            LEFT JOIN dbo.TypeConnections AS TC
            ON A.TypeConnectionId = TC.Id
            LEFT JOIN dbo.LoginIds AS LI
            ON TC.Id = LI.TypeConnectionId AND U.Id = LI.UserId
            WHERE U.Id = @user
            `
        ).then(async(data) => {
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
            result.data["applications"] = data.recordset.slice(result.page.startIndex, result.page.endIndex);
            const users = await pool.request().input("user", sql.Int, entries.user).query("SELECT * FROM dbo.Users WHERE Id = @user");
            result.data["user"] = users.recordset
            console.log(result.data["user"]);
            const myApplication = await pool.request()
                                            .input("user", sql.Int, entries.user)
                                            .query(
                                                `
                                                    SELECT A.Id, A.Name, A.Description
                                                    FROM  Users AS U
                                                    JOIN dbo.ProfileMetiers AS PM
                                                    ON U.ProfileMetierId = PM.Id
                                                    JOIN dbo.ProfileMetier_Application AS PA
                                                    ON PM.Id = PA.ProfileMetierId
                                                    JOIN dbo.Applications AS A
                                                    ON PA.ApplicationId = A.Id
                                                    WHERE U.Id = @user
                                                `
                                            );
            const allApplications = await pool.request().query("SELECT * FROM dbo.Applications");
            myApplication.recordset.forEach(app => {
                for (let i = 0; i < allApplications.recordset.length; i++) {
                    if (allApplications.recordset[i].Id == app.Id) {
                        allApplications.recordset.splice(i, 1);
                        break;
                    }
                }
            });

            data.recordset.forEach(app => {
                for (let i = 0; i < allApplications.recordset.length; i++) {
                    if (allApplications.recordset[i].Id == app.Id) {
                        allApplications.recordset.splice(i, 1);
                        break;
                    }
                }
            });
            result.data["allApplications"] = allApplications.recordset
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

const addSpecialApplicationForUser = async (entries) => {
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
    console.log(entries);
    return pool.request()
        .input("user", sql.Int, entries.user)
        .input("application", sql.Int, entries.application)
        .query(
            `
            INSERT INTO dbo.User_Application(UserId, ApplicationId)
            VALUES(
                @user,
                @application
            )
            `
        ).then((data) => {
            result["message"] = "Success adding"
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

const deleteSpecialApplicationForUser = async (entries) => {
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
        .input("application", sql.Int, entries.application)
        .query(
            `
            DELETE dbo.user_Application
            WHERE UserId = @user AND ApplicationId = @application
            `
        ).then((data) => {
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
    getApplication,
    getAppRessourceByApplication,
    getSpecialApplicationForUser,
    addSpecialApplicationForUser,
    deleteSpecialApplicationForUser,
}