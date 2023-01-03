const express = require("express");
const router = express.Router();

const authRoute = require("./auth");
const applicationRoute = require("./applicationRouter");
const typeConnectionRoute = require("./typeConnection");
const logIdRoute = require("./logIdRouter");
const profileMetierRoute = require("./profileMetierRouter");
const userRoute = require("./userRouter");
const profileRessourceRoute = require("./profileRessourcesRouter");
const userApplicationRoute = require("./userApplicationRouter");

// Part use for define my routes
const allRouter = [
    {
        path: "/",
        route: authRoute,
    },
    {
        path: "/application",
        route: applicationRoute,
    },
    {
        path: "/typeConnection",
        route: typeConnectionRoute,
    },
    {
        path: "/logId",
        route: logIdRoute,
    },
    {
        path: "/profileMetier",
        route: profileMetierRoute,
    },
    {
        path: "/user",
        route: userRoute,
    },
    {
        path: "/profileRessource",
        route: profileRessourceRoute,
    },
    {
        path: "/userApplication",
        route: userApplicationRoute,
    }
]

allRouter.forEach((routes) => {
    router.use(routes.path, routes.route);
})

module.exports = router;