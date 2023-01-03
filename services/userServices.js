const config = require("../conf/config");
const logger = require("../conf/logger");
const sql = require('mssql/msnodesqlv8');
const database_config = require("../middlewares/databaseConfiguration.js");
const bcrypt = require("bcrypt")
var moment = require('moment');

const getUsersWithPagination = async (entries) => {
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
            SELECT U.Id, U.FirstName, U.LastName, U.CreatedAt, U.IsAdmin, PM.Id AS Profile_Id, PM.Name AS Profile_Name, isnull(count(A.Id), 0) AS Cnt_Applications
            FROM dbo.Users AS U
            LEFT JOIN
            dbo.ProfileMetiers AS PM ON U.ProfileMetierId = PM.Id
            LEFT JOIN
            dbo.ProfileMetier_Application AS PA ON PA.ProfileMetierId = PM.Id
            LEFT JOIN
            dbo.Applications AS A ON A.Id = PA.ApplicationId
            WHERE U.IsDeleted = 0
            GROUP BY  U.Id, U.FirstName, U.LastName, U.CreatedAt, PM.Id, PM.Name, U.IsAdmin
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
            const typConnections = await pool.request().query("SELECT * FROM dbo.TypeConnections");
            const profileMetier = await pool.request().query("SELECT * FROM dbo.ProfileMetiers");
            result.data["typeConnections"] = typConnections.recordset;
            result.data["profileMetier"] = profileMetier.recordset;
            result.data["users"] = data.recordset.slice(result.page.startIndex, result.page.endIndex);
            for (let i = 0; i < result.data["users"].length; i++) {
                const resultConnection = await pool.request().query(`SELECT LI.Name, TC.Name AS LogInfo FROM dbo.LoginIds AS LI JOIN dbo.TypeConnections AS TC ON TC.Id = LI.TypeConnectionId WHERE UserId = ${result.data["users"][i]["Id"]}`);
                result.data["users"][i]["Connection"] = resultConnection.recordset;
            }
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

const getUsersSuspendedWithPagination = async (entries) => {
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
            SELECT U.Id, U.FirstName, U.LastName, U.CreatedAt, U.IsAdmin, PM.Id AS Profile_Id, PM.Name AS Profile_Name, isnull(count(A.Id), 0) AS Cnt_Applications
            FROM dbo.Users AS U
            LEFT JOIN
            dbo.ProfileMetiers AS PM ON U.ProfileMetierId = PM.Id
            LEFT JOIN
            dbo.ProfileMetier_Application AS PA ON PA.ProfileMetierId = PM.Id
            LEFT JOIN
            dbo.Applications AS A ON A.Id = PA.ApplicationId
            WHERE U.IsDeleted = 1
            GROUP BY  U.Id, U.FirstName, U.LastName, U.CreatedAt, PM.Id, PM.Name, U.IsAdmin
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
            const typConnections = await pool.request().query("SELECT * FROM dbo.TypeConnections");
            const profileMetier = await pool.request().query("SELECT * FROM dbo.ProfileMetiers");
            result.data["typeConnections"] = typConnections.recordset;
            result.data["profileMetier"] = profileMetier.recordset;
            result.data["users"] = data.recordset.slice(result.page.startIndex, result.page.endIndex);
            for (let i = 0; i < result.data["users"].length; i++) {
                const resultConnection = await pool.request().query(`SELECT LI.Name, TC.Name AS LogInfo FROM dbo.LoginIds AS LI JOIN dbo.TypeConnections AS TC ON TC.Id = LI.TypeConnectionId WHERE UserId = ${result.data["users"][i]["Id"]}`);
                result.data["users"][i]["Connection"] = resultConnection.recordset;
            }
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
            SELECT U.Id, U.FirstName, U.LastName, U.CreatedAt, U.IsAdmin, PM.Id AS Profile_Id, PM.Name AS Profile_Name, isnull(count(A.Id), 0) AS Cnt_Applications
            FROM dbo.Users AS U
            LEFT JOIN
            dbo.ProfileMetiers AS PM ON U.ProfileMetierId = PM.Id
            LEFT JOIN
            dbo.ProfileMetier_Application AS PA ON PA.ProfileMetierId = PM.Id
            LEFT JOIN
            dbo.Applications AS A ON A.Id = PA.ApplicationId
            WHERE U.IsDeleted = 0 AND (U.FirstName LIKE '%${entries.searchItem}%' OR U.LastName LIKE '%${entries.searchItem}%')
            GROUP BY  U.Id, U.FirstName, U.LastName, U.CreatedAt, PM.Id, PM.Name, U.IsAdmin
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
            const typConnections = await pool.request().query("SELECT * FROM dbo.TypeConnections");
            const profileMetier = await pool.request().query("SELECT * FROM dbo.ProfileMetiers");
            result.data["typeConnections"] = typConnections.recordset;
            result.data["profileMetier"] = profileMetier.recordset;
            result.data["users"] = data.recordset.slice(result.page.startIndex, result.page.endIndex);
            for (let i = 0; i < result.data["users"].length; i++) {
                const resultConnection = await pool.request().query(`SELECT LI.Name, TC.Name AS LogInfo FROM dbo.LoginIds AS LI JOIN dbo.TypeConnections AS TC ON TC.Id = LI.TypeConnectionId WHERE UserId = ${result.data["users"][i]["Id"]}`);
                result.data["users"][i]["Connection"] = resultConnection.recordset;
            }
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
            SELECT U.Id, U.FirstName, U.LastName, U.CreatedAt, U.IsAdmin, PM.Id AS Profile_Id, PM.Name AS Profile_Name, isnull(count(A.Id), 0) AS Cnt_Applications
            FROM dbo.Users AS U
            LEFT JOIN
            dbo.ProfileMetiers AS PM ON U.ProfileMetierId = PM.Id
            LEFT JOIN
            dbo.ProfileMetier_Application AS PA ON PA.ProfileMetierId = PM.Id
            LEFT JOIN
            dbo.Applications AS A ON A.Id = PA.ApplicationId
            WHERE U.IsDeleted = 1 AND (U.FirstName LIKE '%${entries.searchItem}%' OR U.LastName LIKE '%${entries.searchItem}%')
            GROUP BY  U.Id, U.FirstName, U.LastName, U.CreatedAt, PM.Id, PM.Name, U.IsAdmin
            `
        ).then(async (data) => {
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
            const typConnections = await pool.request().query("SELECT * FROM dbo.TypeConnections");
            const profileMetier = await pool.request().query("SELECT * FROM dbo.ProfileMetiers");
            result.data["typeConnections"] = typConnections.recordset;
            result.data["profileMetier"] = profileMetier.recordset;
            result.data["users"] = data.recordset.slice(result.page.startIndex, result.page.endIndex);
            for (let i = 0; i < result.data["users"].length; i++) {
                const resultConnection = await pool.request().query(`SELECT LI.Name, TC.Name AS LogInfo FROM dbo.LoginIds AS LI JOIN dbo.TypeConnections AS TC ON TC.Id = LI.TypeConnectionId WHERE UserId = ${result.data["users"][i]["Id"]}`);
                result.data["users"][i]["Connection"] = resultConnection.recordset;
            }
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
            SELECT U.Id, U.FirstName, U.LastName, U.CreatedAt, U.IsAdmin, PM.Id AS Profile_Id, PM.Name AS Profile_Name, isnull(count(A.Id), 0) AS Cnt_Applications
            FROM dbo.Users AS U
            LEFT JOIN
            dbo.ProfileMetiers AS PM ON U.ProfileMetierId = PM.Id
            LEFT JOIN
            dbo.ProfileMetier_Application AS PA ON PA.ProfileMetierId = PM.Id
            LEFT JOIN
            (
                SELECT *
                FROM dbo.Applications
                WHERE IsDeleted = 0
            ) AS A ON A.Id = PA.ApplicationId
            WHERE U.IsDeleted = 0
            GROUP BY  U.Id, U.FirstName, U.LastName, U.CreatedAt, PM.Id, PM.Name, U.IsAdmin
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
            const typConnections = await pool.request().query("SELECT * FROM dbo.TypeConnections");
            const profileMetier = await pool.request().query("SELECT * FROM dbo.ProfileMetiers");
            result.data["typeConnections"] = typConnections.recordset;
            result.data["profileMetier"] = profileMetier.recordset;
            result.data["users"] = data.recordset.slice(result.page.startIndex, result.page.endIndex);
            for (let i = 0; i < result.data["users"].length; i++) {
                const resultConnection = await pool.request().query(`SELECT LI.Name, TC.Name AS LogInfo FROM dbo.LoginIds AS LI JOIN dbo.TypeConnections AS TC ON TC.Id = LI.TypeConnectionId WHERE UserId = ${result.data["users"][i]["Id"]}`);
                result.data["users"][i]["Connection"] = resultConnection.recordset;
            }
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

    const password = await bcrypt.hash(config.default_user_password, 8)

    return pool.request()
        .input("firstName", sql.VarChar, entries.firstName.toLowerCase())
        .input("lastName", sql.VarChar, entries.lastName.toLowerCase())
        .query('SELECT * FROM dbo.Users WHERE FirstName = @firstName AND LastName = @lastName')
        .then(async (res) => {
            if (res.recordset.length == 0) {
                return pool.request()
                .input("firstName", sql.VarChar, entries.firstName.toLowerCase())
                .input("lastName", sql.VarChar, entries.lastName.toLowerCase())
                .input("password", sql.VarChar, password)
                .input("profileMetier", sql.Int, entries.profileMetier)
                .input("createdAt", sql.DateTime2, thisDate)
                .input("lastUpdatedAt", sql.DateTime2, thisDate)
                .query(
                    `
                    INSERT INTO dbo.Users(FirstName, LastName, Password, ProfileMetierId, CreatedAt, LastUpdatedAt, isDeleted)
                    VALUES(
                        @firstName,
                        @lastName,
                        @password,
                        @profileMetier,
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
        .input("firstname", sql.VarChar, entries.firstname.toLowerCase())
        .input("lastname", sql.VarChar, entries.lastname.toLowerCase())
        .input("profileMetier", sql.Int, entries.profileMetier)
        .query('SELECT * FROM dbo.Users WHERE FirstName = @firstName AND LastName = @lastName AND ProfileMetierId = @profileMetier')
        .then(async (res) => {
            if (res.recordset.length == 0) {
                return pool.request()
                    .input("id", sql.Int, entries.id)
                    .input("firstname", sql.VarChar, entries.firstname.toLowerCase())
                    .input("lastname", sql.VarChar, entries.lastname.toLowerCase())
                    .input("profileMetier", sql.Int, entries.profileMetier)
                    .query(
                        `
                        UPDATE dbo.Users
                        SET FirstName = @firstname, Lastname = @lastname, ProfileMetierId = @profileMetier
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
            UPDATE dbo.Users
            SET IsDeleted = 1
            WHERE Id = @id
            `
        ).then(async (data) => {
            await sql.connect(database_config).pool.request().input("id", sql.Int, entries.id).query("UPDATE dbo.LoginIds SET IsDeleted = 1 WHERE UserId = @id");
            result["message"] = "Success";
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
            UPDATE dbo.Users
            SET IsDeleted = 0
            WHERE Id = @id
            `
        ).then(async (data) => {
            await sql.connect(database_config).pool.request().input("id", sql.Int, entries.id).query("UPDATE dbo.LoginIds SET IsDeleted = 0 WHERE UserId = @id");
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

const resetPassword = async (entries) => {
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

    const password = await bcrypt.hash(config.default_user_password, 8);

    let pool = await sql.connect(database_config);
    return await pool.request()
        .input("id", sql.Int, entries.id)
        .input("password", sql.VarChar, password)
        .query(
            `
            UPDATE dbo.Users
            SET Password = @password
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

const userInfo = async (entries) => {
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
            SELECT TC.Id, TC.Name, LI.Name AS LogId_Name
            FROM dbo.TypeConnections AS TC
            LEFT JOIN (
                SELECT Id, Name, TypeConnectionId
                FROM dbo.LoginIds
                WHERE UserId = @id
                GROUP BY Id, Name, TypeConnectionId
            ) AS LI
            ON TC.Id = LI.TypeConnectionId
            `
        ).then(async(data) => {
            result.data["typeConnection"] = data.recordset;
            const user = await pool.request().input("id", sql.Int, entries.id).query("SELECT * FROM dbo.Users WHERE Id = @id");
            result.data["user"] = user.recordset[0];
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

const saveUserInfo = async (entries) => {
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
        .query('SELECT * FROM dbo.LoginIds WHERE Name = @name')
        .then(async (res) => {
            if (res.recordset.length == 0) {
                return pool.request()
                .input("name", sql.VarChar, entries.name.toLowerCase())
                .input("user", sql.Int, entries.user)
                .input("typeConnection", sql.Int, entries.typeConnection)
                .input("createdAt", sql.DateTime2, thisDate)
                .input("lastUpdatedAt", sql.DateTime2, thisDate)
                .query(
                    `
                    INSERT INTO dbo.LoginIds(Name, Userid, TypeConnectionId, CreatedAt, LastUpdatedAt, isDeleted)
                    VALUES(
                        @name,
                        @user,
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

const putAdmin = async (entries) => {
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
            UPDATE dbo.Users
            SET IsAdmin = 1
            WHERE Id = @id
            `
        ).then(async (data) => {
            result["message"] = "Success";
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

const removeAdmin = async (entries) => {
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
            UPDATE dbo.Users
            SET IsAdmin = 0
            WHERE Id = @id
            `
        ).then(async (data) => {
            result["message"] = "Success";
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
    getUsersWithPagination,
    getUsersSuspendedWithPagination,
    search,
    searchRemove,
    save,
    edit,
    remove,
    restort,
    resetPassword,
    userInfo,
    saveUserInfo,
    putAdmin,
    removeAdmin,
}