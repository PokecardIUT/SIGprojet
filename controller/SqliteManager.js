var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("lp_iem_sig.sqlite");

var SqliteManager = {
  getPoint: function(req, res) {
    db.all("SELECT * FROM GEO_POINT", function(err, rows) {
      if (err) {
        throw err;
      }
      res.json(rows);
    });
  },
  getArc: function(req, res) {
    db.all("SELECT * FROM GEO_ARC", function(err, rows) {
      if (err) {
        throw err;
      }

      res.json(rows);
    });
  },
  getVersion: function(req, res) {
    db.all("SELECT * FROM GEO_VERSION", function(err, rows) {
      if (err) {
        throw err;
      }
      res.json(rows);
    });
  }
};

module.exports = SqliteManager;
