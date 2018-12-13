var createTableAdj = require("../utils/create-table-adj.js");
var getAllPoint = require("../utils/getAllPoints.js");

async function algoDijkstra(list) {
  let points = list;
  let listAllPoints = await getAllPoint();
    let stringGraph = "{";

    let counter2 = 0;
    points.forEach(point => {
      stringGraph += `\"${point.sommet}\": {`;
      let counter = 0;
      point.arc.forEach(arc => {
        let sommet1, sommet2;
        listAllPoints.forEach(val => {
          if (val.GEO_POI_ID == point.sommet) {
            sommet1 = val;
          } else if (val.GEO_POI_ID == arc) {
            sommet2 = val;
          }
        });

        let distance = calculDistance(sommet1, sommet2);
        if (distance == 0) {
        } else {
          if (counter == point.arc.length - 1) {
            stringGraph += `\"${arc}\":${distance}`;
          } else {
            stringGraph += `\"${arc}\":${distance},`;
          }
        }
        counter++;
      });
      if (stringGraph[stringGraph.length - 1] == ",") {
        stringGraph = stringGraph.substring(0, stringGraph.length - 1);
      }
      if (counter2 == points.length - 1) {
        stringGraph += "}";
      } else {
        stringGraph += "},";
      }
      counter2++;
    });

    stringGraph += "}";

    return stringGraph
}


function calculDistance(sommet1, sommet2) {
    const n = 0.7289686274,
      C = 11745793.39,
      e = 0.08248325676,
      Xs = 600000,
      Ys = 8199695.768;
  
    let gamma0 = 3600 * 2 + 60 * 20 + 14.025;
    gamma0 = (gamma0 / (180 * 3600)) * Math.PI;
  
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
  
    let distance = Math.sqrt(Math.pow(Lx2 - Lx1, 2) + Math.pow(Ly2 - Ly1, 2));
  
    return distance;
  }
  

module.exports = algoDijkstra;
