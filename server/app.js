global.webFacade = require("./logic/web_facade.js");
global.gameSettings = require('./game/gameSettings.js');
global.dbWrapper = require("./db/dbWrapper.js");
global.gameWrapper = require("./game/gameWrapper.js");

global.webFacade.initRoutes();
global.webFacade.initApi();
global.webFacade.startServer({
    port: 13500
});
