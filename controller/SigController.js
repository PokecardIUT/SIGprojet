var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("lp_iem_sig.sqlite");
var kml = require("tokml");
var Point = require("../model/point.js");
var write = require("write-file");
var createTableAdj = require('../utils/create-table-adj.js')
var getAllPoint = require('../utils/getAllPoints')

var SigController = {
  createTable: async (req, res) => {
    let points = await createTableAdj();
    res.json(points);
  },
  parcourLargeur: async (req, res) => {
    result = [];
    fifo = [];
    arbrePoint = [];
    let pointDepart = req.query.first ? req.query.first : 1;
    let pointFin = req.query.end ? req.query.end : 180;
    let points = await createTableAdj();
    let listAllPoints = await getAllPoint();
    
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


    result.forEach(res => {
      let LatLong = new Array();
      let pointPlace =   {

        type: "Feature",
        properties: {
          name: ""
        },
        geometry: {
  
          type: "Point",
          coordinates: []
        }
      }
      listAllPoints.forEach(point => {
        if(point.GEO_POI_ID == res){
          LatLong.push(point.GEO_POI_LONGITUDE);
          LatLong.push(point.GEO_POI_LATITUDE);
          pointPlace.properties.name = point.GEO_POI_NOM

        }
      })
      pointPlace.geometry.coordinates.push(LatLong);
      geojson.features[0].geometry.coordinates.push(LatLong);
      geojson.features.push(pointPlace)
    })

    let resultKml = kml(geojson);

    write("output/" + geojson.name + ".kml", resultKml, err => {
      if (err) {
        throw err;
      }
    });

    if (result.length === 0) {  
      res.header('Access-Control-Allow-Origin', '*');
    res.type("application/xml");
    res.send("<error>Un point n'existe pas</error>");
    } else {
      res.header('Access-Control-Allow-Origin', '*');
      res.type("application/xml");
      res.send(resultKml);
    }
  }
};
result = [];

function imprimer(arbre, debut, fin) {
  let deb;
  let foundSommet;
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
      if (foundSommet === undefined) {
        foundSommet = imprimer(arbre, val, fin);
      }
    });
    if (foundSommet !== undefined) {
      result.push(deb.sommet);
      return deb.sommet;
    }
  }
}


module.exports = SigController;
