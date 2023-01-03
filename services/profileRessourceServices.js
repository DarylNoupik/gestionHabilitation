const config = require("../conf/config");
const logger = require("../conf/logger");
const sql = require('mssql/msnodesqlv8');
const database_config = require("../middlewares/databaseConfiguration.js");
var moment = require('moment');  

const getWithPagination = async (entries) => {
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
        .input("id", sql.Int, entries.application)
        .query(
            `
            SELECT PR.Id, PR.Name, isnull(AR.Cnt, 0) AS Cnt_AccessRight
            FROM dbo.ProfileRessources AS PR
            LEFT JOIN (
                SELECT Id, ProfileRessourceId, count(*) AS Cnt
                FROM dbo.AccessRight
                GROUP BY Id, ProfileRessourceId
            ) AS AR
            ON AR.ProfileRessourceId = PR.Id
            WHERE PR.IsDeleted = 0 AND PR.ApplicationId = @id
            `
        ).then(async (data) => {
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
            const applications = await pool.request().input("id", sql.Int, entries.application).query("SELECT * FROM dbo.Applications WHERE Id = @id");
            result.data["applications"] = applications.recordset;
            result.data["profileRessources"] = data.recordset.slice(result.page.startIndex, result.page.endIndex);
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

const getSuspendedWithPagination = async (entries) => {
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
        .input("id", sql.Int, entries.application)
        .query(
            `
            SELECT PR.Id, PR.Name, isnull(AR.Cnt, 0) AS Cnt_AccessRight
            FROM dbo.ProfileRessources AS PR
            LEFT JOIN (
                SELECT Id, ProfileRessourceId, count(*) AS Cnt
                FROM dbo.AccessRight
                GROUP BY Id, ProfileRessourceId
            ) AS AR
            ON AR.ProfileRessourceId = PR.Id
            WHERE PR.IsDeleted = 1 AND PR.ApplicationId = @id
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
            const applications = await pool.request().input("id", sql.Int, entries.application).query("SELECT * FROM dbo.Applications WHERE Id = @id");
            result.data["applications"] = applications.recordset;

            result.data["profileRessources"] = data.recordset.slice(result.page.startIndex, result.page.endIndex);
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
        .input("id", sql.Int, entries.application)
        .input("searchItem", sql.VarChar, entries.searchItem)
        .query(
            `
            SELECT PR.Id, PR.Name, isnull(AR.Cnt, 0) AS Cnt_AccessRight
            FROM dbo.ProfileRessources AS PR
            LEFT JOIN (
                SELECT Id, ProfileRessourceId, count(*) AS Cnt
                FROM dbo.AccessRight
                GROUP BY Id, ProfileRessourceId
            ) AS AR
            ON AR.ProfileRessourceId = PR.Id
            WHERE PR.IsDeleted = 0 AND PR.ApplicationId = @id AND PR.Name LIKE '%${entries.searchItem}%'
            `
        ).then(async(data) => {
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
            const applications = await pool.request().input("id", sql.Int, entries.application).query("SELECT * FROM dbo.Applications WHERE Id = @id");
            result.data["applications"] = applications.recordset;
            result.data["profileRessources"] = data.recordset;
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

const searchRemove = async (entries) => {
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
        .input("id", sql.Int, entries.application)
        .input("searchItem", sql.VarChar, entries.searchItem)
        .query(
            `
            SELECT PR.Id, PR.Name, isnull(AR.Cnt, 0) AS Cnt_AccessRight
            FROM dbo.ProfileRessources AS PR
            LEFT JOIN (
                SELECT Id, ProfileRessourceId, count(*) AS Cnt
                FROM dbo.AccessRight
                GROUP BY Id, ProfileRessourceId
            ) AS AR
            ON AR.ProfileRessourceId = PR.Id
            WHERE PR.IsDeleted = 1 AND PR.ApplicationId = @id AND PR.Name LIKE '%${entries.searchItem}%'
            `
        ).then(async(data) => {
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
            const applications = await pool.request().input("id", sql.Int, entries.application).query("SELECT * FROM dbo.Applications WHERE Id = @id");
            result.data["applications"] = applications.recordset;
            result.data["profileRessources"] = data.recordset;
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

const getFirst = async (entries) => {
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
        .input("id", sql.Int, entries.id)
        .query(
            `
            SELECT PR.Id, PR.Name, isnull(AR.Cnt, 0) AS Cnt_AccessRight
            FROM dbo.ProfileRessources AS PR
            LEFT JOIN (
                SELECT Id, ProfileRessourceId, count(*) AS Cnt
                FROM dbo.AccessRight
                GROUP BY Id, ProfileRessourceId
            ) AS AR
            ON AR.ProfileRessourceId = PR.Id
            WHERE PR.IsDeleted = 0 AND PR.ApplicationId = @id
            `
        ).then(async(data) => {
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
            const applications = await pool.request().input("id", sql.Int, entries.id).query("SELECT * FROM dbo.Applications WHERE Id = @id");
            result.data["applications"] = applications.recordset;
            result.data["profileRessources"] = data.recordset;
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

    let thisDate = moment().format('YYYY-MM-DD');
    return pool.request()
        .input("name", sql.VarChar, entries.name.toLowerCase())
        .query('SELECT * FROM dbo.ProfileRessources WHERE Name = @name')
        .then(async (res) => {
            if (res.recordset.length == 0) {
                return pool.request()
                .input("name", sql.VarChar, entries.name.toLowerCase())
                .input("application", sql.Int, entries.application)
                .input("createdAt", sql.DateTime2, thisDate)
                .input("lastUpdatedAt", sql.DateTime2, thisDate)
                .query(
                    `
                    INSERT INTO dbo.ProfileRessources(Name, ApplicationId, CreatedAt, LastUpdatedAt, isDeleted)
                    VALUES(
                        @name,
                        @application,
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
            result.statut = 500;
            result["message"] = "This application exist";
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
        .input("name", sql.VarChar, entries.name.toLowerCase())
        .query('SELECT * FROM dbo.ProfileRessources WHERE Name = @name')
        .then(async (res) => {
            if (res.recordset.length == 0) {
                return pool.request()
                    .input("id", sql.Int, entries.id)
                    .input("name", sql.VarChar, entries.name.toLowerCase())
                    .query(
                        `
                        UPDATE dbo.ProfileRessources
                        SET Name = @name
                        WHERE Id = @id
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
            result.statut = 500;
            result["message"] = "This application exist";
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

const remove = async (entries) => {
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
        .query(
            `
            UPDATE dbo.ProfileRessources
            SET IsDeleted = 1
            WHERE Id = @id
            `
        ).then((data) => {
            result["message"] = "Success"
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

const restort = async (entries) => {
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
        .query(
            `
            UPDATE dbo.ProfileRessources
            SET IsDeleted = 0
            WHERE Id = @id
            `
        ).then((data) => {
            result["message"] = "Success"
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
    getWithPagination,
    getSuspendedWithPagination,
    search,
    searchRemove,
    save,
    edit,
    remove,
    restort,
}