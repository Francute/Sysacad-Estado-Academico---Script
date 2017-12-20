// ==UserScript==
// @namespace     http://openuserjs.org/users/Francute
// @name          Sysacad Forro - Estado Académico
// @description   Mejora la página del estado académico en el sysacad (FRT-UTN).
// @copyright     Francute
// @license       MIT
// @version       0.9.0
// @include       http://sysacad.frt.utn.edu.ar/estadoAcademico.*
// @grant         none
// @author        Francute
// @homepageURL   https://github.com/Francute/Sysacad-Estado-Academico---Script
// @require       https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.18.2/babel.js
// @require       https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/6.16.0/polyfill.js
// @run-at        document-end
// ==/UserScript==

// ==OpenUserJS==
// @author        Francute
// ==/OpenUserJS==

/* jshint ignore:start */
var inline_src = (<><![CDATA[
/* jshint ignore:end */
    /* jshint esnext: false */
    /* jshint esversion: 6 */

    class Materia {

        constructor(filaMateria) {
            const campos = filaMateria.children;
            this.anoCursada = parseInt(campos[0].innerText);
            this.nombre = campos[1].innerText;
            this.estado = campos[2].innerText;
            this.plan = parseInt(campos[3].innerText);
        }

        esParteDeLaCarrera() {
            return this.anoCursada !== 0;
        }

        cursada() {
            return this.estado.length > 1;
        }

        regularizada() {
            return this.estado.search("Regularizada") !== -1;
        }

        aprobada() {
            return this.estado.search("Aprobada") !== -1;
        }

        notaConseguida() {
            return (this.aprobada()) ? parseInt(this.estado.split(" ")[2]) : "No aprobada";
        }

    }

    function eliminarCabecera(textos) {
        textos.shift();
        return textos;
    }

    const filasTabla = Array.from(document.querySelectorAll("tr.textoTabla"));
    const filasTodasLasMaterias = eliminarCabecera(filasTabla);

    const materias = filasTodasLasMaterias.map(fila => new Materia(fila));
    const materiasCarrera = materias.filter(materia => materia.esParteDeLaCarrera());
    const materiasCursadas = materiasCarrera.filter(materia => materia.cursada());

    const materiasRegulares = materiasCursadas.filter(materia => materia.regularizada());
    const materiasAprobadas = materiasCursadas.filter(materia => materia.aprobada());

    const promedio = materiasAprobadas.reduce(
        ((sumaNotas, materia) => sumaNotas + materia.notaConseguida()),
    0) / materiasAprobadas.length;

/////////////////////////TODO LO DE ABAJO ES SOLO PARA LA VISTA/////////////////////////

    function agregarEstilos(textoCSS) {
        const elementoEstilosCSS = document.createElement("style");
        const elementoTextoCSS = document.createTextNode(textoCSS);
        elementoEstilosCSS.appendChild(elementoTextoCSS);
        document.head.appendChild(elementoEstilosCSS);
    }

    function crearTabla(arrayFilas) {
	    const elementoTabla = document.createElement("table");
	    elementoTabla.classList.add("reporte");
	    elementoTabla.setAttribute("align", "center");
	    const elementoCuerpo = document.createElement("tbody");

	    arrayFilas.forEach(fila => elementoCuerpo.appendChild(fila));
	    elementoTabla.appendChild(elementoCuerpo);

	    return elementoTabla;
    }

    function crearCelda(tipoElemento, contenido) {
	    const elementoCelda = document.createElement(tipoElemento);
	    const textoCelda = document.createTextNode(contenido);
	    elementoCelda.appendChild(textoCelda);
	    return elementoCelda;
    }

    function crearFila(arrayContenidoCeldas) {
	    const elementoFila = document.createElement("tr");
        arrayContenidoCeldas.forEach(contenido => {
		    elementoFila.appendChild(crearCelda("td", contenido));
	    });
        return elementoFila;
    }

    function crearCabecera(arrayContenidoCeldas, anchoCeldas) {
  	    const elementoCabeza = document.createElement("thead");
  	    const elementoFila = document.createElement("tr");
  	    arrayContenidoCeldas.forEach(contenido => {
  		    const elementoCelda = crearCelda("th", contenido);
  		    elementoCelda.setAttribute("colspan", anchoCeldas);
		    elementoFila.appendChild(elementoCelda);
  	    });
  	    elementoCabeza.appendChild(elementoFila);
  	    return elementoCabeza;
    }

    function agregarElementoAntesDelVolver(elemento) {
	    const elementoVolver = document.querySelector('p.textoTabla');
	    elementoVolver.parentElement.insertBefore(elemento, elementoVolver);
    }

    function agregarInformacionComunALaPagina() {
        const elementoTabla = crearTabla([
		    crearFila(['Materias cursadas', materiasCursadas.length]),
		    crearFila(['Materias regularizadas', materiasRegulares.length]),
		    crearFila(['Materias aprobadas', materiasAprobadas.length]),
		    crearFila(['Promedio (Sin Aplazos)', '% ' + promedio])
        ]);
	    elementoTabla.classList.add("informacion");
	    agregarElementoAntesDelVolver(elementoTabla);
    }

    function agregarMateriasRegularesALaPagina() {
        const elementoTabla = crearTabla(
            materiasRegulares.map(
                (materia, indice) => crearFila(
                    [indice, materia.anoCursada, materia.nombre]
                )
            )
        );
        elementoTabla.classList.add("regulares");
        elementoTabla.appendChild(crearCabecera(['Materias Regularizadas'], 3));
        agregarElementoAntesDelVolver(elementoTabla);
    }

    function agregarMateriasAprobadasALaPagina() {
        const elementoTabla = crearTabla(
            materiasAprobadas.map(
                (materia, indice) => crearFila(
                    [indice + 1, materia.nombre, materia.notaConseguida()]
                )
            )
        );
        elementoTabla.classList.add("aprobadas");
        elementoTabla.appendChild(crearCabecera(['id', 'Materias Aprobadas', 'Nota'], 1));
        agregarElementoAntesDelVolver(elementoTabla);
    }

    function reportar() {
        agregarInformacionComunALaPagina();
        agregarMateriasRegularesALaPagina();
        agregarMateriasAprobadasALaPagina();
    }

    agregarEstilos('table.reporte {background-color: white; border-spacing: 0; border: .3rem solid #1565C0; margin-top: 1em; width: 700px; } table.reporte td {border: 1px solid black; } table.reporte th {background-color: #1565C0; font-size: 1.1em; color: white; text-transform: uppercase; } table.reporte td:first-child {background-color: #E3F2FD; font-weight: bold; text-align: center; } table.reporte.informacion td:first-child {text-align: right; } table.reporte.informacion td:last-child {font-weight: bold; } table.aprobadas td:last-child {font-weight: bold; text-align: center; } ');

    reportar();

/* jshint ignore:start */
]]></>).toString();
var c = Babel.transform(inline_src, { presets: [ "es2015", "es2016" ] });
eval(c.code);
/* jshint ignore:end */