const jwt = require('jsonwebtoken');
const sql = require('mssql/msnodesqlv8');
const database_config = require("./databaseConfiguration.js");

const tokenVerifie = (req, res, next) => {
    const result = {
        statut: 500,
        data: [],
        rowCount: 0,
        session: {},
        error: true,
        errorInfo: "Your token has expired",
    };

    const token = req.cookies['SGB Habilitation'];
    
    // Check if the token exist
    if (token) {
        jwt.verify(token, 'SGC Habilitation', (err, decodedToken) => {
            // Verified token
            if (err) {
                console.log(err);
                res.render('auth', { data: result });
            } else {
                return next()
            }
        })
    } else {
        result.errorInfo = "Please login";
        res.render('auth', { data: result });
    }
}

module.exports = {
    tokenVerifie,
};