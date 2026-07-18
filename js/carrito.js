let carrito =
    JSON.parse(localStorage.getItem("carrito")) || [];


window.agregarCarritoPorId = function (id) {

    const lista =
        window.todosLosProductos ||
        window.productosLocales ||
        [];

    const producto =
        lista.find(item =>
            String(item.id) === String(id)
        );

    if (!producto) {

        alert("No se encontró el producto.");

        return;
    }

    if (
        producto.stock !== null &&
        producto.stock !== undefined &&
        Number(producto.stock) <= 0
    ) {

        alert("Este producto no tiene stock.");

        return;
    }

    const existente =
        carrito.find(item =>
            String(item.id) === String(id)
        );

    if (existente) {

        if (
            producto.stock !== null &&
            producto.stock !== undefined &&
            existente.cantidad >= Number(producto.stock)
        ) {

            alert(
                "No hay más unidades disponibles."
            );

            return;
        }

        existente.cantidad++;

    } else {

        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: Number(producto.precio),
            imagen:
                producto.imagenes?.[0] || "",
            talle: producto.talle,
            cantidad: 1
        });

    }

    guardarCarrito();
    actualizarContador();

    alert("Producto agregado al carrito.");
};


function guardarCarrito() {

    localStorage.setItem(
        "carrito",
        JSON.stringify(carrito)
    );

}


function actualizarContador() {

    const contador =
        document.getElementById(
            "contador-carrito"
        );

    if (!contador) return;

    const cantidad =
        carrito.reduce(
            (total, item) =>
                total + item.cantidad,
            0
        );

    contador.textContent = cantidad;

}


window.actualizarContador =
    actualizarContador;

actualizarContador();