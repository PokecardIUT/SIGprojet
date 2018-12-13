var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("lp_iem_sig.sqlite");

async function getAllPoint() {
  let points;
  await new Promise(resolve => {
    db.all("SELECT * FROM GEO_POINT", function(err, rows) {
      points = rows;
      resolve();
    });
  });
  return points;
}


module.exports = getAllPoint;