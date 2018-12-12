var nodeDijkstra = require("node-dijkstra");
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("lp_iem_sig.sqlite");
var kml = require("tokml");
var Point = require("../model/point.js");

var DijkstraController = {
  dijkstra: async (req, res) => {
    let points = await createTableAdj();

    let stringd =
      '{ "A": { "B": 1 }, "B" : { "A":1, "C":2, "D": 4 }, "C" : { "B":2, "D":1 }, "D" : { "C":1, "B":4 } }';

    let json = JSON.parse(stringd);

    let stringGraph = "{";
    let counter2 = 0;
    await new Promise(async resolve => {
      points.forEach(async point => {
        stringGraph += `\"${point.sommet}\": {`;
        console.log()
        let counter = 0;
        await new Promise(async resolve2 => {
          point.arc.forEach(async arc => {
            let sommet1 = await getPoint(point.sommet);
            let sommet2 = await getPoint(arc);

            let distance = calculDistance(sommet1, sommet2);

            console.log(distance);

            stringGraph += `\"${arc}\":${distance}`;
            console.log("2", counter, "  ", point.arc.length);

            if (counter == point.arc.length) {
              resolve2();
            }
            counter++;
          });
        });
        stringGraph += `},`;
      });
      console.log("1", counter2, "  ", points.length);
      if (counter2 == points.length) {
        resolve();
      }
      counter2++;
    });

    console.log(stringGraph);

    let jsonGraph = JSON.parse(stringGraph);

    const Graph = require("node-dijkstra");

    const route = new Graph(json);

    let path = route.path("A", "C"); // => [ 'A', 'B', 'C', 'D' ]
    res.json(jsonGraph);
  }
};

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

async function getPoint(sommet) {
  let point;
  await new Promise(resolve => {
    db.all("SELECT * FROM GEO_POINT WHERE GEO_POI_ID =" + sommet, function(
      err,
      rows
    ) {
      rows.forEach(row => {
        point = row;
      });
      resolve();
    });
  });
  return point;
}

function calculDistance(sommet1, sommet2) {
  //console.log(sommet1);
  //console.log(sommet2);

  const n = 0.7289686274,
    C = 11745793.39,
    e = 0.08248325676,
    Xs = 600000,
    Ys = 8199695.768;

  let gamma0 = 3600 * 2 + 60 * 20 + 14.025;
  gamma0 = (gamma0 / (180 * 3600)) * Math.PI;

  // console.log(gamma0);

  let lat1 = sommet1.GEO_POI_LATITUDE * 3600;
  let lon1 = sommet1.GEO_POI_LONGITUDE * 3600;
  lat1 = (lat1 / (180 * 3600)) * Math.PI;
  lon1 = (lon1 / (180 * 3600)) * Math.PI;

  let lat2 = sommet2.GEO_POI_LATITUDE * 3600;
  let lon2 = sommet2.GEO_POI_LONGITUDE * 3600;
  lat2 = (lat2 / (180 * 3600)) * Math.PI;
  lon2 = (lon2 / (180 * 3600)) * Math.PI;

  let L1 =
    0.5 * Math.log((1 + Math.sin(lat1)) / (1 - Math.sin(lat1))) -
    (e / 2) * Math.log((1 + e * Math.sin(lat1)) / (1 - e * Math.sin(lat1)));
  let R1 = C * Math.exp(-n * L1);
  let gamma1 = n * (lon1 - gamma0);

  let L2 =
    0.5 * Math.log((1 + Math.sin(lat2)) / (1 - Math.sin(lat2))) -
    (e / 2) * Math.log((1 + e * Math.sin(lat2)) / (1 - e * Math.sin(lat2)));
  let R2 = C * Math.exp(-n * L2);
  let gamma2 = n * (lon2 - gamma0);

  let Lx1 = Xs + R1 * Math.sin(gamma1);
  let Ly1 = Ys - R1 * Math.cos(gamma1);

  let Lx2 = Xs + R2 * Math.sin(gamma2);
  let Ly2 = Ys - R2 * Math.cos(gamma2);

  //console.log("X1", Lx1);
  //console.log("Y1", Ly1);
  //console.log("X2", Lx2);
  //console.log("Y2", Ly2);

  let distance = Math.sqrt(Math.pow(Lx2 - Lx1, 2) + Math.pow(Ly2 - Ly1, 2));

  //console.log(distance)
  return distance;
}

module.exports = DijkstraController;
