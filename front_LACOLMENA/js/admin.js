// ======================================================
// CONFIGURACIÓN GENERAL
// ======================================================
//guarda URL base del backend para no repetir en cada peticion
const API_BASE_URL = 'http://localhost:3000/api/productos';

// Limpia todos los mensajes visibles
function limpiarMensajes() {
    document.querySelectorAll('.mensaje').forEach(msg => {
        msg.classList.remove('exito', 'error');
        msg.textContent = '';
        msg.style.display = 'none';
    });
}

// Muestra un mensaje de éxito o error en pantalla
//busca mensaje por ID, pone el texto y lo muestra
function mostrarMensaje(elementId, mensaje, tipo) {
    const elemento = document.getElementById(elementId);
    elemento.textContent = mensaje;
    elemento.className = `mensaje ${tipo}`;
    elemento.style.display = 'block';

    setTimeout(() => {
        elemento.style.display = 'none';
    }, 5000);
}

// ======================================================
// ALTA (CREATE)
// ======================================================

document.getElementById('formAlta').addEventListener('submit', async (e) => {
    e.preventDefault();
    //obtiene los valores de los inuts
    const categoria = altaCategoria.value.trim();
    const nombre = altaNombre.value.trim();
    const imagen = altaImagen.value.trim();
    const descripcion = altaDescripcion.value.trim();
    const precio = altaPrecio.value.trim();
    const disponibilidad = altaDisponibilidad.value.trim();
    const ventas = altaVentas.value.trim();
    const ofertas = altaOfertas.value.trim();

    //valida que no esten vacios los campos
    if (!categoria || !nombre || !imagen || !descripcion || !precio || !disponibilidad || !ventas || !ofertas) {
        mostrarMensaje("mensajeAlta", "Por favor, complete todos los campos", "error");
        return;
    }

    //hace peticon al back, envia los datos al backend y los guarda en la BD
    try {
        const response = await fetch(`${API_BASE_URL}/postProducto`, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ categoria, nombre, imagen, descripcion, precio, disponibilidad, ventas, ofertas })
        });
        
        //convierte la respuesta en JSON
        const data = await response.json();

        //si fue con exito, abre modal
        if (response.ok) {
            abrirModalGeneral("alta", {
                id: data.id_insertado,
                categoria, nombre, imagen, descripcion, precio, disponibilidad, ventas, ofertas
            });

            //limpia formulario
            formAlta.reset();
        }

    //mensaje de error
    } catch (error) {
        mostrarMensaje("mensajeAlta", "Error de conexión con el servidor", "error");
    }
});


// ======================================================
// ACTUALIZAR (UPDATE)
// ======================================================

// Cargar datos al escribir ID
async function cargarDatosProducto() {
    //obtiene el Id, si esta vacio no hace nada
    const id = cambioId.value.trim();
    if (!id) return;

    //hace peticion al back y busca el producto con el ID 
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        //convierte respuesta a JSON
        const data = await response.json();

        //si existe producto con el ID, carga datos en los inputs
        if (response.ok) {
            cambioCategoria.value = data.categoria;
            cambioNombre.value = data.nombre;
            cambioImagen.value = data.imagen;
            cambioDescripcion.value = data.descripcion;
            cambioPrecio.value = data.precio;
            cambioDisponibilidad.value = data.disponibilidad;
            cambioVentas.value = data.ventas;
            cambioOfertas.value = data.ofertas;

            mostrarMensaje("mensajeCambio", "Datos cargados correctamente.", "exito");
        } else {
            mostrarMensaje("mensajeCambio", "Producto no encontrado", "error");
        }

    } catch (error) {
        mostrarMensaje("mensajeCambio", "Error de conexión con el servidor", "error");
    }
}
//blur =  evento para cargar datos al dar click en otro lado o TAB
cambioId.addEventListener("blur", cargarDatosProducto);

//evita recargar
document.getElementById("formCambio").addEventListener("submit", async (e) => {
    e.preventDefault();
    //obtiene los valores de los inuts
    const id = cambioId.value.trim();
    const categoria = cambioCategoria.value.trim();
    const nombre = cambioNombre.value.trim();
    const imagen = cambioImagen.value.trim();
    const descripcion = cambioDescripcion.value.trim();
    const precio = cambioPrecio.value.trim();
    const disponibilidad = cambioDisponibilidad.value.trim();
    const ventas = cambioVentas.value.trim();
    const ofertas = cambioOfertas.value.trim();

    //valida los campos vacios
    if (!categoria || !nombre || !imagen || !descripcion || !precio || !disponibilidad || !ventas || !ofertas) {
        mostrarMensaje("mensajeCambio", "Complete todos los campos", "error");
        return;
    }

    //realiza peticon de PUT al back para actualizar producto
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ categoria, nombre, imagen, descripcion, precio, disponibilidad, ventas, ofertas })
        });

        //si es exitoso, abre modal
        if (response.ok) {
            abrirModalGeneral("update", {
                id, categoria, nombre, imagen, descripcion, precio, disponibilidad, ventas, ofertas
            });
            formCambio.reset();
        }

    } catch (error) {
        mostrarMensaje("mensajeCambio", "❌ Error de conexión con el servidor", "error");
    }
});


// ======================================================
// BAJA (DELETE)
// ======================================================
//almacena el ID a eliminar
let eliminarProducto = null;

// Cargar datos y abrir modal general
async function cargarDatosEliminar() {
    //obtiene el valore del inuts 
    const id = bajaId.value.trim();
    //no hace nada si no hay id
    if (!id) return;

    //hace peticion al back, busca el producto
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        const data = await response.json();

        //si es exitoso, abre modal
        if (response.ok) {
            abrirModalGeneral("delete", data);
        } else {
            mostrarMensaje("mensajeBaja", "Producto no encontrado", "error");
        }

    } catch (error) {
        mostrarMensaje("mensajeBaja", "Error de conexión con el servidor", "error");
    }
}

// Enviar formulario de baja → carga datos y muestra modal
formBaja.addEventListener("submit", (e) => {
    e.preventDefault();
    cargarDatosEliminar();
});


// ======================================================
//  M  O  D  A  L   G  E  N  E  R  A  L
// ======================================================

let accionActual = null;        //accion que esta haciendo
let datosAccion = null;         //datos del producto

function abrirModalGeneral(accion, datos) {
    //guarda datos actuales
    accionActual = accion;
    datosAccion = datos;

    //busca datos para manipularlos facilmente
    const modal = document.getElementById("modalGeneral");
    const header = document.getElementById("modalHeader");
    const titulo = document.getElementById("modalTitulo");
    const mensaje = document.getElementById("modalMensajeAccion");
    const advertencia = document.getElementById("modalAdvertencia");
    const btnAceptar = document.getElementById("btnAceptarGeneral");
    const info = document.getElementById("modalInfo");

    //coloca datos del prducto en el modal  
    if (datos) {
        mId.textContent = datos.id;
        mCategoria.textContent = datos.categoria;
        mNombre.textContent = datos.nombre;
        mImagen.textContent = datos.imagen;
        mDescripcion.textContent = datos.descripcion;
        mPrecio.textContent = datos.precio;
        mDisponibilidad.textContent = datos.disponibilidad;
        mVentas.textContent = datos.ventas;
        mOfertas.textContent = datos.ofertas;
    }

    //cambiar contenido segun accion
    switch (accion) {
        case "alta":
            header.style.background = "#2196f3";
            titulo.textContent = "✔ Producto Agregado";
            mensaje.textContent = "El producto fue agregado exitosamente.";
            advertencia.style.display = "none";
            btnAceptar.style.display = "none";
            break;

        case "update":
            header.style.background = "#ff9f00";
            titulo.textContent = "✔ Producto Actualizado";
            mensaje.textContent = "El producto se actualizó correctamente.";
            advertencia.style.display = "none";
            btnAceptar.style.display = "none";
            break;

        case "delete":
            header.style.background = "#ff3b3b";
            titulo.textContent = "⚠ Confirmar Eliminación";
            mensaje.textContent = "¿Está seguro de eliminar este producto?";
            advertencia.style.display = "block";
            btnAceptar.style.display = "inline-block";
            break;
    }
    //muestra modal
    modal.classList.add("mostrar");
}

//pa cerrar el modal
btnCancelarGeneral.addEventListener("click", () => {
    modalGeneral.classList.remove("mostrar");
});

//confirma que si se desea eliminar el producto
btnAceptarGeneral.addEventListener("click", async () => {
    //solo funciona si es un delete 
    if (accionActual !== "delete") return;

    const id = datosAccion.id;

    //hace peticion al back DELETE 
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, { method: "DELETE" });
        const data = await response.json();

        //
        if (response.ok) {
            mostrarMensaje("mensajeBaja", "Producto eliminado correctamente", "exito");
            formBaja.reset();
        }

    } catch {
        mostrarMensaje("mensajeBaja", "Error eliminando el producto", "error");
    }

    modalGeneral.classList.remove("mostrar");
});

// ======================================================
// Graficas (ventas por categorias)
// ======================================================
async function cargarGrafica() {
    //hace peticion GET al back
    try {
        const respuesta = await fetch(`${API_BASE_URL}/ventasCategoria`);
        const datos = await respuesta.json();

        //extrae categorias y ventas
        //crea arreglo con las categorias
        const categorias = datos.map(item => item.categoria);
        //crea arreglo con los valores
        const ventas = datos.map(item => item.total_vendido);

        //crea grafica
        //busca canvas en html, obtiene el contexto en que se va a dibujar
        const ctx = document.getElementById('ventasCategorias').getContext('2d');
        //utiliza chart,js para crear graficas
        new Chart(ctx, {
            type: 'bar',        //crea grafica en forma de pastel
            //define que texto va en el eje x
            data: {
                labels: categorias,
                //Nombres del conjjunto de datos (arriba de la tabla)
                datasets: [{
                    label: 'Ventas Totales',
                    data: ventas,       //valores numericos de la tabla
                    borderWidth: 2      //borde grafica
                }]
                },
                //se adapta a la tabla al tamaño de la pantalla
                options: {
                    responsive: true,
                    //evita que la grafica empiece con numeros raros
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
    } catch (error) {
        console.error('Error cargando gráfica:', error);
    }
}
//llama funcion para que aparezca automaticamente
cargarGrafica();

// ======================================================
// Ventas totales 
// ======================================================
async function cargarTotalVentas() {

    try{
        //hace peticion GET para obtener total de ventas
        const resp = await fetch(`${API_BASE_URL}/totalVentas`);
        const data = await resp.json();

        const total = data.totalVentas || 0;

        document.getElementById("totalVentas").textContent =
                `$${Number(total).toLocaleString("es-MX")} MXN`;

    } catch (error) {
        console.error("Error cargando total de ventas:", error);
    }
}

cargarTotalVentas();

// ======================================================
// Reporte inventario
// ======================================================
async function cargarInventarioPorCategoria() {
    try {
        const resp = await fetch(`${API_BASE_URL}/inventario`);
        const data = await resp.json();

        const contenedor = document.getElementById("contenedorInventario");
        contenedor.innerHTML = ""; 

        // Agrupar por categoría
        const categorias = {};

        data.forEach(producto => {
            if (!categorias[producto.categoria]) {
                categorias[producto.categoria] = [];
            }
            categorias[producto.categoria].push(producto);
        });

        // Generar una tarjeta para cada categoría
        Object.keys(categorias).forEach(categoria => {
            const tarjeta = `
                <div class="card-categoria">
                    <h3>Categoría: ${categoria}</h3>
                    <table class="tabla-inventario">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Producto</th>
                                <th>Existencias</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${categorias[categoria].map(prod => `
                                <tr>
                                    <td>${prod.id}</td>
                                    <td>${prod.nombre}</td>
                                    <td>${prod.disponibilidad}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;

            contenedor.innerHTML += tarjeta;
        });

    } catch (error) {
        console.error("Error cargando inventario por categoría:", error);
    }
}

cargarInventarioPorCategoria();