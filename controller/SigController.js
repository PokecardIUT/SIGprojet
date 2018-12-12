var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("lp_iem_sig.sqlite");
var kml = require("tokml");
var Point = require("../model/point.js");
var write = require("write-file");

var SigController = {
  createTable: async (req, res) => {
    let points = await createTableAdj();
    res.json(points);
  },
  parcourLargeur: async (req, res) => {
    result = [];
    fifo = [];
    marquer = [];
    arbrePoint = [];
    let points = null;
    let pointDepart = req.query.first ? req.query.first : 1;
    let pointFin = req.query.end ? req.query.end : 180;
    points = await createTableAdj();
    points.forEach(point => {
      if (point.sommet == pointDepart) {
        fifo.push(point.sommet);
        point.color = "black";
      }
    });
    if (fifo.length === 0) {
      res.json({ error: "Un point n'existe pas" });
      return;
    }
    while (fifo.length !== 0) {
      s = fifo[0];
      marquer.push(s);
      fifo.splice(0, 1);
      arbre = new Point(s);
      points.forEach(res => {
        if (res.sommet === s) {
          res.arc.forEach(value => {
            points.forEach(res2 => {
              if (res2.sommet === value && res2.color === "blanc") {
                res2.color = "black";
                arbre.addArc(value);
                fifo.push(value);
              }
            });
          });
        }
      });
      arbrePoint.push(arbre);
    }
    imprimer(arbrePoint, pointDepart, pointFin);
    result = result.reverse();

    let geojson = {
      type: "FeatureCollection",
      name: "Mon parcours",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: []
          }
        }
      ]
    };

    geojson.name = "Parcour-Largeur";

    await new Promise(resolve => {
      let counter = 0;
      result.forEach(async res => {
        let LatLong = new Array();
        await new Promise(resolve2 => {
          db.all(
            "SELECT * FROM GEO_POINT WHERE GEO_POI_ID =" + res,
            (err, rows) => {
              if (err) {
                throw err;
              }
              rows.forEach(row => {
                LatLong.push(row.GEO_POI_LONGITUDE);
                LatLong.push(row.GEO_POI_LATITUDE);
              });
              resolve2();
            }
          );
        });
        geojson.features[0].geometry.coordinates.push(LatLong);
        counter++;
        if (counter === result.length) {
          resolve();
        }
      });
    });

    let resultKml = kml(geojson);

    write("output/" + geojson.name + ".kml", resultKml, err => {
      if (err) {
        throw err;
      }
    });

    if (result.length === 0) {
      res.json({ error: "Il n'existe pas de parcours vers ce point" });
    } else {
      res.type("application/xml");
      res.send(resultKml);
    }
  }
};
result = [];

function imprimer(arbre, debut, fin) {
  let deb;
  let bla;
  arbre.forEach(res => {
    if (res.sommet == debut) {
      deb = res;
    }
  });
  if (deb.sommet == fin) {
    result.push(deb.sommet);
    return deb.sommet;
  } else if (deb.arc.length > 0) {
    deb.arc.forEach(val => {
      if (bla === undefined) {
        bla = imprimer(arbre, val, fin);
      }
    });
    if (bla !== undefined) {
      result.push(deb.sommet);
      return deb.sommet;
    }
  }
}

async function createTableAdj() {
  points = new Array();
  await new Promise((resolve, reject) => {
    db.all("SELECT * FROM GEO_POINT WHERE GEO_POI_ID", function(err, rows) {
      if (err) {
        throw err;
      }

      rows.forEach(row => {
        point = new Point(row.GEO_POI_ID);

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
          function(err, values) {
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

module.exports = SigController;
