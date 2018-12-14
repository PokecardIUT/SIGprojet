let html = `<!DOCTYPE html>
<html>

<head>
  <title>SIG</title>
  <meta charset="UTF-8" />
  <link rel="stylesheet" href="https://bootswatch.com/4/sketchy/bootstrap.min.css" crossorigin="anonymous" />
  <style>/* PrismJS 1.15.0
  https://prismjs.com/download.html#themes=prism-okaidia&languages=markup */
  /**
   * okaidia theme for JavaScript, CSS and HTML
   * Loosely based on Monokai textmate theme by http://www.monokai.nl/
   * @author ocodia
   */
  
  code[class*="language-"],
  pre[class*="language-"] {
    color: #f8f8f2;
    background: none;
    text-shadow: 0 1px rgba(0, 0, 0, 0.3);
    font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
    text-align: left;
    white-space: pre;
    word-spacing: normal;
    word-break: normal;
    word-wrap: normal;
    line-height: 1.5;
  
    -moz-tab-size: 4;
    -o-tab-size: 4;
    tab-size: 4;
  
    -webkit-hyphens: none;
    -moz-hyphens: none;
    -ms-hyphens: none;
    hyphens: none;
  }
  
  /* Code blocks */
  pre[class*="language-"] {
    padding: 1em;
    margin: .5em 0;
    overflow: auto;
    border-radius: 0.3em;
  }
  
  :not(pre) > code[class*="language-"],
  pre[class*="language-"] {
    background: #272822;
  }
  
  /* Inline code */
  :not(pre) > code[class*="language-"] {
    padding: .1em;
    border-radius: .3em;
    white-space: normal;
  }
  
  .token.comment,
  .token.prolog,
  .token.doctype,
  .token.cdata {
    color: slategray;
  }
  
  .token.punctuation {
    color: #f8f8f2;
  }
  
  .namespace {
    opacity: .7;
  }
  
  .token.property,
  .token.tag,
  .token.constant,
  .token.symbol,
  .token.deleted {
    color: #f92672;
  }
  
  .token.boolean,
  .token.number {
    color: #ae81ff;
  }
  
  .token.selector,
  .token.attr-name,
  .token.string,
  .token.char,
  .token.builtin,
  .token.inserted {
    color: #a6e22e;
  }
  
  .token.operator,
  .token.entity,
  .token.url,
  .language-css .token.string,
  .style .token.string,
  .token.variable {
    color: #f8f8f2;
  }
  
  .token.atrule,
  .token.attr-value,
  .token.function,
  .token.class-name {
    color: #e6db74;
  }
  
  .token.keyword {
    color: #66d9ef;
  }
  
  .token.regex,
  .token.important {
    color: #fd971f;
  }
  
  .token.important,
  .token.bold {
    font-weight: bold;
  }
  .token.italic {
    font-style: italic;
  }
  
  .token.entity {
    cursor: help;
  }
  
  </style>
</head>

<body>
  <div class="jumbotron" style="margin-top: 5vh;">
    <fieldset>
      <legend>Parcours en largeur</legend>
      <label for="startL">Début: </label>
      <select name="startL" id="startL"></select>
      <label for="endL">Fin: </label>
      <select name="endL" id="endL"></select>
      <input id="btnParcours" class="btn btn-outline-secondary" type="button" value="Télécharger" />
    </fieldset>
    <br>
    <fieldset>
      <legend>Dijkstra</legend>
      <label for="startD">Début: </label>
      <select name="startD" id="startD"></select>
      <label for="endD">Fin: </label>
      <select name="endD" id="endD"></select>
      <input id="btnDijkstra" class="btn btn-outline-secondary" type="button" value="Télécharger" />
    </fieldset>
    <br>
    <fieldset>
      <legend>Lignes de bus optimisées</legend>
      <p> Ce fichier représente les plus cours chemins possible du début à la fin de chaque ligne (y compris tout les arcs) </p>
      <input id="btnAllBus" class="btn btn-outline-secondary" type="button" value="Télécharger" />
    </fieldset>
    <br>
    <fieldset>
      <legend>Lignes de bus</legend>
      <p> Ce fichier représente les plus cours chemins possible du début à la fin de chaque ligne (les arcs qui correspondent aux lignes de bus) </p>
      <input id="btnAllBusWithArcLigne" class="btn btn-outline-secondary" type="button" value="Télécharger" />
    </fieldset>
    <pre class="language-markup"><code id="kml" class="language-markup"></code></pre>
  </div>
  <script src="https://code.jquery.com/jquery-3.3.1.min.js" integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8="
    crossorigin="anonymous"></script>
  <script>$(document).ready(function () {
    $.ajax({
      method: "GET",
      url: "https://sigproject.herokuapp.com/table",
      dataType: "json",
      success: function (data) {
        var html = "";
        data.forEach(item => {
          html += "<option value=" + item.sommet + ">" + item.name + "</option>";
        });
        $(".jumbotron select").each(function () {
          $(this).html(html);
        });
      },
      error: function () {
        console.log("An error occured during accessing URL");
      }
    });
    $("#btnDijkstra").click(function (e) {
      let first = $("#startD").val();
      let end = $("#endD").val();
      if (first === end) {
        alert("Veuillez choisir 2 arrêts différents");
      }
      $.ajax({
        method: "GET",
        url: "https://sigproject.herokuapp.com/dijkstra?first="+first+"&end="+end,
        dataType: "xml",
        success: function (data) {
          var a = document.createElement("a");
          a.setAttribute("id", "downloadDijkstra");
          document.body.appendChild(a);
          a.style = "display: none";
          var kml = new XMLSerializer().serializeToString(data);
          $("#kml").text(kml);
          var blob = new Blob([kml], {
            type: "text/plain"
          });
          url = window.URL.createObjectURL(blob);
          a.href = url;
          a.download = "dijkstra.kml";
          a.click();
          window.URL.revokeObjectURL(url);
          mystring = "";
        },
        error: function () {
          console.log("An error occured during accessing URL");
        }
      });
    });
    $("#btnAllBus").click(function (e) {
      $.ajax({
        method: "GET",
        url: \`https://sigproject.herokuapp.com/allBus\`,
        dataType: "xml",
        success: function (data) {
          var a = document.createElement("a");
          a.setAttribute("id", "downloadAllBus");
          document.body.appendChild(a);
          a.style = "display: none";
          var kml = new XMLSerializer().serializeToString(data);
          $("#kml").text(kml);
          var blob = new Blob([kml], {
            type: "text/plain"
          });
          url = window.URL.createObjectURL(blob);
          a.href = url;
          a.download = "busWithAllArc.kml";
          a.click();
          window.URL.revokeObjectURL(url);
          mystring = "";
        },
        error: function () {
          console.log("An error occured during accessing URL");
        }
      });
    });
    $("#btnAllBusWithArcLigne").click(function (e) {
      $.ajax({
        method: "GET",
        url: \`https://sigproject.herokuapp.com/arcBusLigne\`,
        dataType: "xml",
        success: function (data) {
          var a = document.createElement("a");
          a.setAttribute("id", "downloadAllBus");
          document.body.appendChild(a);
          a.style = "display: none";
          var kml = new XMLSerializer().serializeToString(data);
          $("#kml").text(kml);
          var blob = new Blob([kml], {
            type: "text/plain"
          });
          url = window.URL.createObjectURL(blob);
          a.href = url;
          a.download = "busWithArcLigne.kml";
          a.click();
          window.URL.revokeObjectURL(url);
          mystring = "";
        },
        error: function () {
          console.log("An error occured during accessing URL");
        }
      });
    });
  });
  </script>
  <script>$(document).ready(function () {
    $("#btnParcours").click(function (e) {
      let first = $("#startL").val();
      let end = $("#endL").val();
      if (first === end) {
        alert("Veuillez choisir 2 arrêts différents");
      } else {
      $.ajax({
        method: "GET",
        url: "https://sigproject.herokuapp.com/parcourLargeur?first="+first+"&end="+end,
        dataType: "xml",
        success: function (data) {
          var a = document.createElement("a");
          a.setAttribute("id", "downloadParcours");
          document.body.appendChild(a);
          a.style = "display: none";
          var kml = new XMLSerializer().serializeToString(data);
          $("#kml").text(kml);
          var blob = new Blob([kml], {
            type: "text/plain"
          });
          url = window.URL.createObjectURL(blob);
          a.href = url;
          a.download = "parcours.kml";
          a.click();
          window.URL.revokeObjectURL(url);
          mystring = "";
        },
        error: function () {
          console.log("An error occured during accessing URL");
        }
      });
    }
    });
  });
  </script>
</body>

</html>`;

module.exports = html;
