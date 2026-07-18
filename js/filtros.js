// ===========================
// FILTROS
// ===========================

const parametros = new URLSearchParams(window.location.search);

const categoria = parametros.get("categoria");
const talle = parametros.get("talle");

if(typeof productos !== "undefined"){

    let listaFiltrada = [...productos];

    if(categoria){

        listaFiltrada = listaFiltrada.filter(producto =>

            producto.categoria === categoria

        );

    }

    if(talle){

        listaFiltrada = listaFiltrada.filter(producto =>

            producto.talle === talle

        );

    }

    if(document.getElementById("titulo")){

        if(categoria && talle){

            document.getElementById("titulo").textContent =
            categoria.charAt(0).toUpperCase() +
            categoria.slice(1) +
            " - Talle " + talle;

        }

        else if(categoria){

            document.getElementById("titulo").textContent =
            categoria.charAt(0).toUpperCase() +
            categoria.slice(1);

        }

        else{

            document.getElementById("titulo").textContent =
            "Todos los productos";

        }

    }

    if(typeof mostrarProductos === "function"){

        mostrarProductos(listaFiltrada);

    }

}