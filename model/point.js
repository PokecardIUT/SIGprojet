class Point {
    constructor(sommet){
        this.sommet = sommet;
        this.arc = new Array();
    }

    addArc(arc) {
        this.arc.push(arc);
    }
}

module.exports = Point;