  let todosProductos = [];

  // Cargar productos
  async function cargarProductos() {
    try {
      const res = await fetch("http://localhost:3000/api/productos");
      const productos = await res.json();

      todosProductos = productos;
      mostrarProductos(todosProductos);

    } catch (error) {
      console.error("Error:", error);
    }
  }

  // Mostrar productos
  function mostrarProductos(list) {
    const contenedor = document.getElementById("products");
    contenedor.innerHTML = "";

    list.forEach(prod => {

      //para ver si esta agotado o no
        const disponible = Number(prod.disponibilidad)  > 0;
        const enOferta = Number(prod.oferta) > 1; 

        contenedor.innerHTML += `
        <div class="card">         
            <img src="media/${prod.imagen}" class="card-img">
            
            <div class="card-content">
                <h3 class="card-title">${prod.nombre}</h3>
                <p class="card-desc">${prod.descripcion}</p>
                <p class="price-area">$${prod.precio}</p>

                ${
                  disponible 
                    ? `<button class="btn-cart" onclick='agregarCarrito(${JSON.stringify(prod)})'>
                          Agregar al carrito
                       </button>`
                    : `<button class="btn-cart" disabled class="btn-disabled">
                          AGOTADO
                       </button>`
                }
            </div>
        </div>`;
    });
}

  // Aplicar filtros
  function aplicarFiltros() {
    let filtro = [...todosProductos];

    const search = document.getElementById("search-text")?.value?.toLowerCase() || "";
    const category = document.getElementById("filtro-categoria").value;
    const min = Number(document.getElementById("precio-min").value);
    const max = Number(document.getElementById("precio-max").value);
    const solOfertas = document.getElementById("filtro-ofertas").checked;

    // Filtro de búsqueda
    if (search) {
      filtro = filtro.filter(p =>
        p.nombre.toLowerCase().includes(search) ||
        p.descripcion.toLowerCase().includes(search)
      );
    }

    // Categoría
    if (category) {
      filtro = filtro.filter(p => p.categoria === category);
    }

    // Precio
    if (min) filtro = filtro.filter(p => p.precio >= min);
    if (max) filtro = filtro.filter(p => p.precio <= max);

    // Solo ofertas
    if (solOfertas) {
      filtro = filtro.filter(p => Number(p.ofertas) === 1);
    }

    mostrarProductos(filtro);
  }

  // Activar filtros al cambiar cualquier campo
  ["filtro-categoria", "precio-min", "precio-max", "filtro-ofertas"].forEach(id => {
    document.getElementById(id).addEventListener("input", aplicarFiltros);
  });

  cargarProductos();

  function agregarCarrito(producto) {
    console.log("Producto agregado:", producto);
  }