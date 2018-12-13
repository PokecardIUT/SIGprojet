class Point {
    constructor(sommet, name, ligne){
        this.name = name;
        this.sommet = sommet;
        this.arc = new Array();
        this.color = "blanc";
        this.ligne = ligne;
    }

    addArc(arc) {
        this.arc.push(arc);
    }
}

module.exports = Point;