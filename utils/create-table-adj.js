var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("lp_iem_sig.sqlite");
var Point = require("../model/point.js");


async function createTableAdj() {
    points = new Array();
    await new Promise((resolve, reject) => {
      db.all("SELECT * FROM GEO_POINT WHERE GEO_POI_ID", function (err, rows) {
        if (err) {
          throw err;
        }
  
        rows.forEach(row => {
          point = new Point(row.GEO_POI_ID, row.GEO_POI_NOM,"");
  
          points.push(point);
        });
        resolve();
      });
    });
    
    await new Promise((resolve, reject) => {
      let i = 1;
      points.forEach(async point => {
        await new Promise((resolve, reject) => {
          db.all(
            `SELECT * FROM GEO_ARC WHERE GEO_ARC_DEB = ${
            point.sommet
            } OR GEO_ARC_FIN = ${point.sommet}`,
            function (err, values) {
              if (err) {
                throw err;
              }
              values.forEach(value => {
                if (value.GEO_ARC_DEB == point.sommet) {
                  point.addArc(value.GEO_ARC_FIN);
                }
                if (value.GEO_ARC_FIN == point.sommet) {
                  point.addArc(value.GEO_ARC_DEB);
                }
              });
  
              resolve();
            }
          );
        });
        if (i == points.length) {
          resolve();
        }
        i++;
      });
    });
    return points;
  }
  

  
 

  module.exports = createTableAdj;