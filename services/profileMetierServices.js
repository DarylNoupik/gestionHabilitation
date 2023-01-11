const config = require("../conf/config");
const logger = require("../conf/logger");
const sql = require('mssql/msnodesqlv8');
const database_config = require("../middlewares/databaseConfiguration.js");
var moment = require('moment');  

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
            SELECT PM.Id, PM.Name, PM.Abreviation, TP.Id AS IdType, TP.Name AS TypeProfileMetier, PM.CreatedAt
            FROM dbo.ProfileMetiers AS PM
            LEFT JOIN (
                SELECT Id, Name
                FROM dbo.TypeProfileMetiers
                GROUP BY Id, Name
            ) AS TP ON PM.TypeProfileMetierId = TP.Id
            WHERE PM.IsDeleted = 0
            GROUP BY PM.Id, PM.Name, PM.Abreviation, PM.CreatedAt, TP.Id, TP.Name
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

            result.data["profileMetier"] = data.recordset.slice(result.page.startIndex, result.page.endIndex);
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

    return await pool.request()
        .input("name", sql.VarChar, entries.name.toLowerCase())
        .input("abreviation", sql.VarChar, entries.abreviation.toLowerCase())
        .input("createdAt", sql.DateTime2, thisDate)
        .input("lastUpdatedAt", sql.DateTime2, thisDate)
        .query(
            `
            INSERT INTO dbo.ProfileMetiers(Name, Abreviation, CreatedAt, LastUpdatedAt, isDeleted)
            VALUES(
                @name,
                @abreviation,
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
        .input("name", sql.VarChar, entries.name.toLowerCase())
        .input("abreviation", sql.VarChar, entries.abreviation.toLowerCase())
        .query(
            `
            UPDATE dbo.ProfileMetiers
            SET Name = @name, Abreviation = @abreviation
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
            SELECT PM.Id, PM.Name, PM.Abreviation, TP.Id AS IdType, TP.Name AS TypeProfileMetier, PM.CreatedAt
            FROM dbo.ProfileMetiers AS PM
            LEFT JOIN (
                SELECT Id, Name
                FROM dbo.TypeProfileMetiers
                GROUP BY Id, Name
            ) AS TP ON PM.TypeProfileMetierId = TP.Id
            WHERE PM.IsDeleted = 0 AND (PM.Name LIKE '%${entries.searchItem}%' OR PM.Abreviation LIKE '%${entries.searchItem}%')
            GROUP BY PM.Id, PM.Name, PM.Abreviation, PM.CreatedAt, TP.Id, TP.Name
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

            result.data["profileMetier"] = data.recordset.slice(result.page.startIndex, result.page.endIndex);
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
            SELECT PM.Id, PM.Name, PM.Abreviation, TP.Id AS IdType, TP.Name AS TypeProfileMetier, PM.CreatedAt
            FROM dbo.ProfileMetiers AS PM
            LEFT JOIN (
                SELECT Id, Name
                FROM dbo.TypeProfileMetiers
                GROUP BY Id, Name
            ) AS TP ON PM.TypeProfileMetierId = TP.Id
            WHERE PM.IsDeleted = 1 AND (PM.Name LIKE '%${entries.searchItem}%' OR PM.Abreviation LIKE '%${entries.searchItem}%')
            GROUP BY PM.Id, PM.Name, PM.Abreviation, PM.CreatedAt, TP.Id, TP.Name
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

            result.data["profileMetier"] = data.recordset.slice(result.page.startIndex, result.page.endIndex);
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

const getProfileMetierWithPagination = async (entries) => {
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
            SELECT PM.Id, PM.Name, PM.Abreviation, TP.Id AS IdType, TP.Name AS TypeProfileMetier, PM.CreatedAt
            FROM dbo.ProfileMetiers AS PM
            LEFT JOIN (
                SELECT Id, Name
                FROM dbo.TypeProfileMetiers
                GROUP BY Id, Name
            ) AS TP ON PM.TypeProfileMetierId = TP.Id
            WHERE PM.IsDeleted = 0
            GROUP BY PM.Id, PM.Name, PM.Abreviation, PM.CreatedAt, TP.Id, TP.Name
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

            result.data["profileMetier"] = data.recordset.slice(result.page.startIndex, result.page.endIndex);
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

const getProfileMetierSuspendedWithPagination = async (entries) => {
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
            SELECT PM.Id, PM.Name, PM.Abreviation, TP.Id AS IdType, TP.Name AS TypeProfileMetier, PM.CreatedAt
            FROM dbo.ProfileMetiers AS PM
            LEFT JOIN (
                SELECT Id, Name
                FROM dbo.TypeProfileMetiers
                GROUP BY Id, Name
            ) AS TP ON PM.TypeProfileMetierId = TP.Id
            WHERE PM.IsDeleted = 1
            GROUP BY PM.Id, PM.Name, PM.Abreviation, PM.CreatedAt, TP.Id, TP.Name
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

            result.data["profileMetier"] = data.recordset.slice(result.page.startIndex, result.page.endIndex);
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
            UPDATE dbo.ProfileMetiers
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
            UPDATE dbo.ProfileMetiers
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
        .input("id", sql.Int, entries.id)
        .query(
            `
            SELECT A.Id, A.Name
            FROM dbo.Applications AS A
            JOIN
            dbo.ProfileMetier_Application AS PA
            ON A.Id = PA.ApplicationId
            WHERE PA.ProfileMetierId = @id
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
            const profileMetiers = await pool.request().input("id", sql.Int, entries.id).query("SELECT * FROM dbo.ProfileMetiers WHERE Id = @id");
            result.data["profileMetiers"] = profileMetiers.recordset;
            const allApplications = await pool.request().input("id", sql.Int, entries.id).query("SELECT * FROM dbo.Applications");
            result.data["allApplications"] = allApplications.recordset;
            result.data["applications"] = data.recordset.slice(result.page.startIndex, result.page.endIndex);
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

const addApplication = async (entries) => {
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
        .input("profileMetier", sql.Int, entries.profileMetier)
        .input("application", sql.Int, entries.application)
        .query(
            `
            INSERT INTO dbo.ProfileMetier_Application(ProfileMetierId, ApplicationId)
            VALUES(
                @profileMetier,
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

const removeApplication = async (entries) => {
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
        .input("profileMetier", sql.Int, entries.profileMetier)
        .input("application", sql.Int, entries.application)
        .query(
            `
            DELETE FROM dbo.ProfileMetier_Application
            WHERE ProfileMetierId = @profileMetier AND ApplicationId = @application
            `
        ).then(async (data) => {
            await pool.request()
                .input("profileMetier", sql.Int, entries.profileMetier)
                .input("application", sql.Int, entries.application)
                .query(
                    `
                    DELETE FROM dbo.ProfileMetier_ProfileRessource_Application
                    WHERE ProfileMetierId = @profileMetier AND ApplicationId = @application
                    `
                )
            result["message"] = "Success remove"
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

const getprofileRessourceByApplication = async (entries) => {
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
    console.log(entries)
    let pool = await sql.connect(database_config);
    return pool.request()
        .input("application", sql.Int, entries.application)
        .input("profileMetier", sql.Int, entries.profileMetier)
        .query(
            `
            SELECT PR.Id, PR.Name
            FROM dbo.ProfileMetier_ProfileRessource_Application AS PPA
            JOIN dbo.ProfileRessources AS PR
            ON PR.Id = PPA.ProfileRessourceId
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
            const allProfileRessources = await pool.request().query("SELECT * FROM dbo.ProfileRessources");
            result.data["allProfileRessources"] = allProfileRessources.recordset;
            const profileMetiers = await pool.request().input("profileMetier", sql.Int, entries.profileMetier).query("SELECT * FROM dbo.ProfileMetiers WHERE Id = @profileMetier");
            result.data["profileMetiers"] = profileMetiers.recordset;
            const applications = await pool.request().input("application", sql.Int, entries.application).query("SELECT * FROM dbo.Applications WHERE Id = @application");
            result.data["applications"] = applications.recordset;
            console.log(result["allProfileRessources"])
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

const addProfileRessource = async (entries) => {
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
        .input("profileMetier", sql.Int, entries.profileMetier)
        .input("application", sql.Int, entries.application)
        .input("profileRessource", sql.Int, entries.profileRessource)
        .query(
            `
            INSERT INTO dbo.ProfileMetier_ProfileRessource_Application(ProfileMetierId, ApplicationId, ProfileRessourceId)
            VALUES(
                @profileMetier,
                @application,
                @profileRessource
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

const removeProfileRessource = async (entries) => {
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
        .input("profileMetier", sql.Int, entries.profileMetier)
        .input("application", sql.Int, entries.application)
        .input("profileRessource", sql.Int, entries.profileRessource)
        .query(
            `
            DELETE FROM dbo.ProfileMetier_Application
            WHERE ProfileMetierId = @profileMetier AND ApplicationId = @application AND ProfileRessourceId = @profileRessource
            `
        ).then((data) => {
            result["message"] = "Success remove"
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
    save,
    edit,
    search,
    searchRemove,
    getProfileMetierWithPagination,
    getProfileMetierSuspendedWithPagination,
    remove,
    restort,
    getApplication,
    addApplication,
    removeApplication,
    getprofileRessourceByApplication,
    addProfileRessource,
    removeProfileRessource,
}