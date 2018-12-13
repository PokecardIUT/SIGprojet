var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("lp_iem_sig.sqlite");
var kml = require("tokml");
var Point = require("../model/point.js");
var write = require("write-file");
var createTableAdj = require('../utils/create-table-adj.js')
var getAllPoint = require('../utils/getAllPoints')
var template = require("../src/template")
var formatXML = require("../utils/indentXml")

var SigController = {
  template: (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.send(template);
  },
  createTable: async (req, res) => {
    let points = await createTableAdj();
    res.header('Access-Control-Allow-Origin', '*');
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
    var x=Math.round(0xffffff * Math.random()).toString(16);
    var y=(6-x.length);
    var z="000000";
    var z1 = z.substring(0,y);
    var color= z1 + x;

    let kmlString = `<?xml version="1.0" encoding="UTF-8"?>
      <kml xmlns="http://www.opengis.net/kml/2.2">
        <Document>
          <name>Parcours en largeur</name>
          <Style id="colorPL">
          <LineStyle>
            <color>${color}</color>
            <width>12</width>
          </LineStyle>
        </Style>`;

      let featuresLineStiring = `
      <Placemark>
        <styleUrl>#colorPL</styleUrl>
        <LineString>
        <extrude>1</extrude>
        <tessellate>1</tessellate>
        <altitudeMode>absolute</altitudeMode>
        <coordinates>`;

      result.forEach(res => {
        let featuresPoint = `<Placemark>`;
        listAllPoints.forEach(point => {
          if (point.GEO_POI_ID == res) {
            featuresLineStiring += `${point.GEO_POI_LONGITUDE},${
              point.GEO_POI_LATITUDE
            } `;
            featuresPoint += `<name>${
              point.GEO_POI_NOM
            }</name><Point><coordinates>${point.GEO_POI_LONGITUDE},${
              point.GEO_POI_LATITUDE
            }</coordinates></Point></Placemark>`;
          }
        });
        kmlString += featuresPoint;
      });

      featuresLineStiring += `</coordinates>
      </LineString>
      </Placemark>`;

      kmlString += featuresLineStiring;
      kmlString += `  </Document>
      </kml>`;

      kmlString = formatXML(kmlString)

    write("output/Parcours-largeur.kml", kmlString, err => {
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
      res.send(kmlString);
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
