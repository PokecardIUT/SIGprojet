class Point {
    constructor(sommet){
        this.sommet = sommet;
        this.arc = new Array();
        this.color = "blanc";
    }

    addArc(arc) {
        this.arc.push(arc);
    }
}

module.exports = Point;