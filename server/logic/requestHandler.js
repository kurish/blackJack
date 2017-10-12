exports.init = function (app) {
  app.post('/api/register', function(req, res) {
        try {
          global.dbWrapper.checkRegister(req.body).then(function (data) {
            console.log(data);
            res.send(data);
          }).catch(function (data) {
            console.log(data);
            res.send(data);
          });
        } catch (e) {
            console.log(e);
        }
    });
    app.post('/api/login', function(req, res) {
          try {
              global.dbWrapper.checkLogin(req.body).then(function (data) {
                res.send(data);
              }).catch(function (data) {
                res.send(data);
              });
          } catch (e) {
              console.log('app.post(/api/login) ERROR');
              console.log(e);
          }
      });
      app.post('/api/getUserData', function(req, res) {
            try {
                global.dbWrapper.findByUsername(req.body).then(function (data) {
                  res.send(data);
                }).catch(function (data) {
                  res.send(data);
                });
            } catch (e) {
                console.log('app.post(/api/getUserData) ERROR');
                console.log(e);
            }
        });
        app.post('/api/getTopUsers', function(req, res) {
              try {
                  global.dbWrapper.getTopUsers(req.body).then(function (data) {
                    res.send(data);
                  }).catch(function (data) {
                    res.send(data);
                  });
              } catch (e) {
                  console.log('app.post(/api/getTopUsers) ERROR');
                  console.log(e);
              }
          });
          app.post('/api/getLastGame', function(req, res) {
                try {
                    global.dbWrapper.getLastGame(req.body).then(function (data) {
                      res.send(data);
                    }).catch(function (data) {
                      res.send(data);
                    });
                } catch (e) {
                    console.log('app.post(/api/getLastGames) ERROR');
                    console.log(e);
                }
            });
            app.post('/api/getCurrentGame', function(req, res) {
                  try {
                      global.dbWrapper.getCurrentGame(req.body).then(function (data) {
                        res.send(data);
                      }).catch(function (data) {
                        res.send(data);
                      });
                  } catch (e) {
                      console.log('app.post(/api/getCurrentGame) ERROR');
                      console.log(e);
                  }
              });
              app.post('/api/createNewGame', function(req, res) {
                    try {
                        global.dbWrapper.createNewGame(req.body).then(function (data) {
                          res.send(data);
                        }).catch(function (data) {
                          res.send(data);
                        });
                    } catch (e) {
                        console.log('app.post(/api/createNewGame) ERROR');
                        console.log(e);
                    }
                });
                app.post('/api/getCard', function(req, res) {
                      try {
                          global.dbWrapper.getCard(req.body).then(function (data) {
                            res.send(data);
                          }).catch(function (data) {
                            res.send(data);
                          });
                      } catch (e) {
                          console.log('app.post(/api/getCard) ERROR');
                          console.log(e);
                      }
                  });
                  app.post('/api/placeBet', function(req, res) {
                        try {
                            global.dbWrapper.placeBet(req.body).then(function (data) {
                              res.send(data);
                            }).catch(function (data) {
                              res.send(data);
                            });
                        } catch (e) {
                            console.log('app.post(/api/api/placeBet) ERROR');
                            console.log(e);
                        }
                    });
                    app.post('/api/closeGame', function(req, res) {
                          try {
                              console.log('/api/closeGame req:');
                              console.log(req.body._id);
                              global.dbWrapper.closeGame(req.body).then(function (data) {
                                res.send(data);
                              }).catch(function (data) {
                                res.send(data);
                              });
                          } catch (e) {
                              console.log('app.post(/api/closeGame) ERROR');
                              console.log(e);
                          }
                      });

}
