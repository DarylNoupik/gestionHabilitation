const config = require("../conf/config");
const logger = require("../conf/logger");
const sql = require('mssql/msnodesqlv8');
const database_config = require("../middlewares/databaseConfiguration.js");
var moment = require('moment');  

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
            SELECT A.Id, A.Name, A.Description, A.CreatedAt, TC.Id AS TypeProfile_Id, TC.Name AS TypeProfile, isnull(PM.Cnt, 0) AS Cnt_ProfileMetiers, isnull(U.Cnt, 0) AS Cnt_Users, isnull(PR.Cnt, 0) AS Cnt_ProfileRessources
            FROM dbo.Applications AS A 
            LEFT JOIN 
            (
                SELECT Id, Name
                FROM dbo.TypeConnections
                GROUP BY Id, Name
            ) AS TC ON TC.Id = A.TypeConnectionId
            LEFT JOIN
            (
                SELECT ApplicationId, ProfileMetierId
                FROM dbo.ProfileMetier_Application
                GROUP BY ApplicationId, ProfileMetierId
            ) AS PA ON PA.ApplicationId = A.Id
            LEFT JOIN 
            (
                SELECT Id, count(*) AS Cnt
                FROM dbo.ProfileMetiers
                GROUP BY Id
            ) AS PM ON PM.Id = PA.ProfileMetierId
            LEFT JOIN 
            (
                SELECT Id, ApplicationId, count(*) AS Cnt
                FROM dbo.ProfileRessources
                GROUP BY Id, ApplicationId
            ) AS PR ON PR.ApplicationId = A.Id
            LEFT JOIN 
            (
                SELECT Id, ProfileMetierId, count(*) AS Cnt
                FROM dbo.Users
                GROUP BY Id, ProfileMetierId
            ) AS U ON PM.Id = U.ProfileMetierId
            WHERE A.IsDeleted = 0
            GROUP BY A.Id, A.Name, A.Description, A.CreatedAt, TC.Id, TC.Name, PM.Cnt, U.Cnt, PR.Cnt
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
            const users = await pool.request().query("SELECT * FROM dbo.Users");
            result.data["users"] = users.recordset;
            const typConnections = await pool.request().query("SELECT * FROM dbo.TypeConnections");
            result.data["typeConnections"] = typConnections.recordset;
            result.data["application"] = data.recordset.slice(result.page.startIndex, result.page.endIndex);
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

const getApplicationSuspendedWithPagination = async (entries) => {
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
        .query(
            `
            SELECT A.Id, A.Name, A.Description, A.CreatedAt, TC.Id AS TypeProfile_Id, TC.Name AS TypeProfile, isnull(PM.Cnt, 0) AS Cnt_ProfileMetiers, isnull(U.Cnt, 0) AS Cnt_Users, isnull(PR.Cnt, 0) AS Cnt_ProfileRessources
            FROM dbo.Applications AS A 
            LEFT JOIN 
            (
                SELECT Id, Name
                FROM dbo.TypeConnections
                GROUP BY Id, Name
            ) AS TC ON TC.Id = A.TypeConnectionId
            LEFT JOIN
            (
                SELECT ApplicationId, ProfileMetierId
                FROM dbo.ProfileMetier_Application
                GROUP BY ApplicationId, ProfileMetierId
            ) AS PA ON PA.ApplicationId = A.Id
            LEFT JOIN 
            (
                SELECT Id, count(*) AS Cnt
                FROM dbo.ProfileMetiers
                GROUP BY Id
            ) AS PM ON PM.Id = PA.ProfileMetierId
            LEFT JOIN 
            (
                SELECT Id, ApplicationId, count(*) AS Cnt
                FROM dbo.ProfileRessources
                GROUP BY Id, ApplicationId
            ) AS PR ON PR.ApplicationId = A.Id
            LEFT JOIN 
            (
                SELECT Id, ProfileMetierId, count(*) AS Cnt
                FROM dbo.Users
                GROUP BY Id, ProfileMetierId
            ) AS U ON PM.Id = U.ProfileMetierId
            WHERE A.IsDeleted = 1
            GROUP BY A.Id, A.Name, A.Description, A.CreatedAt, TC.Id, TC.Name, PM.Cnt, U.Cnt, PR.Cnt
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
            

            result.data["application"] = data.recordset.slice(result.page.startIndex, result.page.endIndex);
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
        .input("searchItem", sql.VarChar, entries.searchItem)
        .query(
            `
            SELECT A.Id, A.Name, A.Description, A.CreatedAt, TC.Id AS TypeProfile_Id, TC.Name AS TypeProfile, isnull(PM.Cnt, 0) AS Cnt_ProfileMetiers, isnull(U.Cnt, 0) AS Cnt_Users, isnull(PR.Cnt, 0) AS Cnt_ProfileRessources
            FROM dbo.Applications AS A 
            LEFT JOIN 
            (
                SELECT Id, Name
                FROM dbo.TypeConnections
                GROUP BY Id, Name
            ) AS TC ON TC.Id = A.TypeConnectionId
            LEFT JOIN
            (
                SELECT ApplicationId, ProfileMetierId
                FROM dbo.ProfileMetier_Application
                GROUP BY ApplicationId, ProfileMetierId
            ) AS PA ON PA.ApplicationId = A.Id
            LEFT JOIN 
            (
                SELECT Id, count(*) AS Cnt
                FROM dbo.ProfileMetiers
                GROUP BY Id
            ) AS PM ON PM.Id = PA.ProfileMetierId
            LEFT JOIN 
            (
                SELECT Id, ApplicationId, count(*) AS Cnt
                FROM dbo.ProfileRessources
                GROUP BY Id, ApplicationId
            ) AS PR ON PR.ApplicationId = A.Id
            LEFT JOIN 
            (
                SELECT Id, ProfileMetierId, count(*) AS Cnt
                FROM dbo.Users
                GROUP BY Id, ProfileMetierId
            ) AS U ON PM.Id = U.ProfileMetierId
            WHERE A.IsDeleted = 0 AND (A.Name LIKE '%${entries.searchItem}%' OR A.Description LIKE '%${entries.searchItem}%')
            GROUP BY A.Id, A.Name, A.Description, A.CreatedAt, TC.Id, TC.Name, PM.Cnt, U.Cnt, PR.Cnt
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
            const users = await pool.request().query("SELECT * FROM dbo.Users");
            result.data["users"] = users.recordset;
            const typConnections = await pool.request().query("SELECT * FROM dbo.TypeConnections");
            result.data["typeConnections"] = typConnections.recordset;
            result.data["application"] = data.recordset.slice(result.page.startIndex, result.page.endIndex);
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
        .input("searchItem", sql.VarChar, entries.searchItem)
        .query(
            `
            SELECT A.Id, A.Name, A.Description, A.CreatedAt, TC.Id AS TypeProfile_Id, TC.Name AS TypeProfile, isnull(PM.Cnt, 0) AS Cnt_ProfileMetiers, isnull(U.Cnt, 0) AS Cnt_Users, isnull(PR.Cnt, 0) AS Cnt_ProfileRessources
            FROM dbo.Applications AS A 
            LEFT JOIN 
            (
                SELECT Id, Name
                FROM dbo.TypeConnections
                GROUP BY Id, Name
            ) AS TC ON TC.Id = A.TypeConnectionId
            LEFT JOIN
            (
                SELECT ApplicationId, ProfileMetierId
                FROM dbo.ProfileMetier_Application
                GROUP BY ApplicationId, ProfileMetierId
            ) AS PA ON PA.ApplicationId = A.Id
            LEFT JOIN 
            (
                SELECT Id, count(*) AS Cnt
                FROM dbo.ProfileMetiers
                GROUP BY Id
            ) AS PM ON PM.Id = PA.ProfileMetierId
            LEFT JOIN 
            (
                SELECT Id, ApplicationId, count(*) AS Cnt
                FROM dbo.ProfileRessources
                GROUP BY Id, ApplicationId
            ) AS PR ON PR.ApplicationId = A.Id
            LEFT JOIN 
            (
                SELECT Id, ProfileMetierId, count(*) AS Cnt
                FROM dbo.Users
                GROUP BY Id, ProfileMetierId
            ) AS U ON PM.Id = U.ProfileMetierId
            WHERE A.IsDeleted = 1 AND (A.Name LIKE '%${entries.searchItem}%' OR A.Description LIKE '%${entries.searchItem}%')
            GROUP BY A.Id, A.Name, A.Description, A.CreatedAt, TC.Id, TC.Name, PM.Cnt, U.Cnt, PR.Cnt
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

            result.data["application"] = data.recordset.slice(result.page.startIndex, result.page.endIndex);
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

const getFirst = async () => {
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
        .query(
            `
            SELECT A.Id, A.Name, A.Description, A.CreatedAt, TC.Id AS TypeProfile_Id, TC.Name AS TypeProfile, isnull(PM.Cnt, 0) AS Cnt_ProfileMetiers, isnull(U.Cnt, 0) AS Cnt_Users, isnull(PR.Cnt, 0) AS Cnt_ProfileRessources
            FROM dbo.Applications AS A 
            LEFT JOIN 
            (
                SELECT ApplicationId, count(*) AS Cnt
                FROM dbo.ProfileRessources
                GROUP BY ApplicationId
            ) AS PR ON PR.ApplicationId = A.Id
            LEFT JOIN 
            (
                SELECT Id, Name
                FROM dbo.TypeConnections
                GROUP BY Id, Name
            ) AS TC ON TC.Id = A.TypeConnectionId
            LEFT JOIN
            (
                SELECT ApplicationId, ProfileMetierId
                FROM dbo.ProfileMetier_Application
                GROUP BY ApplicationId, ProfileMetierId
            ) AS PA ON PA.ApplicationId = A.Id
            LEFT JOIN 
            (
                SELECT Id, count(*) AS Cnt
                FROM dbo.ProfileMetiers
                GROUP BY Id
            ) AS PM ON PM.Id = PA.ProfileMetierId
            LEFT JOIN 
            (
                SELECT Id, ProfileMetierId, count(*) AS Cnt
                FROM dbo.Users
                GROUP BY Id, ProfileMetierId
            ) AS U ON PM.Id = U.ProfileMetierId
            WHERE A.IsDeleted = 0
            GROUP BY A.Id, A.Name, A.Description, A.CreatedAt, TC.Id, TC.Name, PM.Cnt, U.Cnt, PR.Cnt
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
            const users = await pool.request().query("SELECT * FROM dbo.Users");
            result.data["users"] = users.recordset;
            const typConnections = await pool.request().query("SELECT * FROM dbo.TypeConnections");
            result.data["typeConnections"] = typConnections.recordset;
            result.data["application"] = data.recordset.slice(result.page.startIndex, result.page.endIndex);
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
        .query('SELECT * FROM dbo.Applications WHERE Name = @name')
        .then(async (res) => {
            if (res.recordset.length == 0) {
                return pool.request()
                .input("name", sql.VarChar, entries.name.toLowerCase())
                .input("description", sql.VarChar, entries.description.toLowerCase())
                .input("typeConnection", sql.Int, entries.typeConnection)
                .input("createdAt", sql.DateTime2, thisDate)
                .input("lastUpdatedAt", sql.DateTime2, thisDate)
                .query(
                    `
                    INSERT INTO dbo.Applications(Name, Description, TypeConnectionId, CreatedAt, LastUpdatedAt, isDeleted)
                    VALUES(
                        @name,
                        @description,
                        @typeConnection,
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

    console.log(entries);
    return pool.request()
        .input("name", sql.VarChar, entries.name.toLowerCase())
        .input("typeConnection", sql.Int, entries.typeConnection)
        .input("description", sql.VarChar, entries.description.toLowerCase())
        .query('SELECT * FROM dbo.Applications WHERE Name = @name AND TypeConnectionId = @typeConnection AND Description = @description')
        .then(async (res) => {
            if (res.recordset.length == 0) {
                return pool.request()
                    .input("id", sql.Int, entries.id)
                    .input("typeConnection", sql.Int, entries.typeConnection)
                    .input("name", sql.VarChar, entries.name.toLowerCase())
                    .input("description", sql.VarChar, entries.description.toLowerCase())
                    .query(
                        `
                        UPDATE dbo.Applications
                        SET TypeConnectionId = @typeConnection, Name = @name, Description = @description
                        WHERE Id = @id
                        `
                    ).then((data) => {
                        console.log(data);
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
            UPDATE dbo.Applications
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
            UPDATE dbo.Applications
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
    getApplicationWithPagination,
    getApplicationSuspendedWithPagination,
    search,
    searchRemove,
    save,
    edit,
    remove,
    restort,
}