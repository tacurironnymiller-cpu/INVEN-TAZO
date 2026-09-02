/* =========================================================
   LATA-ZO
   SISTEMA DE CONTROL DE INVENTARIO

   ARCHIVO: app.js

   Aquí está toda la lógica de la aplicación.
   Está separado por comentarios para que sea fácil
   modificar cada parte después.
========================================================= */


/* =========================================================
   1. CONFIGURACIÓN GENERAL
========================================================= */

const STORAGE_KEY = "latazo_inventario_v2";

const DEFAULT_MIN_STOCK = 5;


/* =========================================================
   2. PRODUCTOS DE EJEMPLO
========================================================= */

const demoProducts = [

    {
        id: 1,
        name: "Granizado de mora",
        category: "Granizado",
        stock: 12,
        minStock: 5,
        price: 2.50
    },

    {
        id: 2,
        name: "Granizado de fresa",
        category: "Granizado",
        stock: 8,
        minStock: 5,
        price: 2.50
    },

    {
        id: 3,
        name: "Granizado de mango",
        category: "Granizado",
        stock: 4,
        minStock: 5,
        price: 2.50
    },

    {
        id: 4,
        name: "Helado de vainilla",
        category: "Helado",
        stock: 10,
        minStock: 5,
        price: 1.50
    },

    {
        id: 5,
        name: "Helado de chocolate",
        category: "Helado",
        stock: 3,
        minStock: 5,
        price: 1.50
    },

    {
        id: 6,
        name: "Jarabe de mora",
        category: "Insumo",
        stock: 2,
        minStock: 3,
        price: 4.00
    },

    {
        id: 7,
        name: "Vasos grandes",
        category: "Insumo",
        stock: 50,
        minStock: 15,
        price: 0.15
    }

];


/* =========================================================
   3. DATOS PRINCIPALES
========================================================= */

let data = {

    products: [],

    movements: []

};


/* =========================================================
   4. CARGAR DATOS
========================================================= */

function loadData() {

    const saved =
        localStorage.getItem(STORAGE_KEY);


    if (saved) {

        try {

            data = JSON.parse(saved);

        }

        catch (error) {

            console.log(
                "Error cargando los datos."
            );

            createDemoData();

        }

    }

    else {

        createDemoData();

    }

}


/* =========================================================
   5. CREAR DATOS DE EJEMPLO
========================================================= */

function createDemoData() {

    data = {

        products: demoProducts.map(product => ({
            ...product
        })),

        movements: [

            {
                id: 1,
                productId: 1,
                type: "entry",
                quantity: 12,
                reason: "Inventario inicial",
                date: new Date().toISOString()
            },

            {
                id: 2,
                productId: 2,
                type: "entry",
                quantity: 8,
                reason: "Inventario inicial",
                date: new Date().toISOString()
            }

        ]

    };


    saveData();

}


/* =========================================================
   6. GUARDAR DATOS
========================================================= */

function saveData() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );

}


/* =========================================================
   7. FUNCIONES GENERALES
========================================================= */


/* ---------- FORMATO DE DINERO ---------- */

function money(value) {

    return "$" + Number(value).toFixed(2);

}


/* ---------- BUSCAR PRODUCTO ---------- */

function findProduct(id) {

    return data.products.find(
        product =>
            product.id === Number(id)
    );

}


/* ---------- PROTEGER TEXTO HTML ---------- */

function escapeHTML(text) {

    return String(text)

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");

}


/* =========================================================
   8. RESUMEN DEL INVENTARIO
========================================================= */

function renderSummary() {


    /* ---------- TOTAL DE PRODUCTOS ---------- */

    const totalProducts =
        data.products.length;


    /* ---------- TOTAL DE UNIDADES ---------- */

    const totalStock =
        data.products.reduce(
            (total, product) =>
                total + Number(product.stock),
            0
        );


    /* ---------- PRODUCTOS CON STOCK BAJO ---------- */

    const lowStock =
        data.products.filter(
            product =>
                Number(product.stock)
                <=
                Number(product.minStock)
        ).length;


    /* ---------- VALOR TOTAL ---------- */

    const totalValue =
        data.products.reduce(
            (total, product) =>
                total +
                Number(product.stock) *
                Number(product.price),
            0
        );


    /* ---------- MOSTRAR RESULTADOS ---------- */

    document.getElementById(
        "totalProducts"
    ).textContent =
        totalProducts;


    document.getElementById(
        "totalStock"
    ).textContent =
        totalStock;


    document.getElementById(
        "lowStock"
    ).textContent =
        lowStock;


    document.getElementById(
        "totalValue"
    ).textContent =
        money(totalValue);

}


/* =========================================================
   9. MOSTRAR PRODUCTOS
========================================================= */

function renderProducts() {


    const list =
        document.getElementById(
            "productsList"
        );


    /* ---------- BUSCADOR ---------- */

    const search =
        document.getElementById(
            "searchInput"
        )
        .value
        .toLowerCase()
        .trim();


    /* ---------- FILTRO DE CATEGORÍA ---------- */

    const category =
        document.getElementById(
            "categoryFilter"
        )
        .value;


    /* ---------- FILTRAR PRODUCTOS ---------- */

    const products =
        data.products.filter(product => {


            const matchesSearch =
                product.name
                    .toLowerCase()
                    .includes(search);


            const matchesCategory =
                category === "all"
                ||
                product.category === category;


            return (
                matchesSearch
                &&
                matchesCategory
            );

        });


    /* ---------- SI NO HAY PRODUCTOS ---------- */

    if (!products.length) {

        list.innerHTML = `

            <div class="empty">

                No hay productos para mostrar.

            </div>

        `;

        return;

    }


    /* ---------- CREAR TARJETAS ---------- */

    list.innerHTML =

        products.map(product => {


            let stockClass =
                "stock-ok";


            /* STOCK AGOTADO */

            if (
                product.stock <= 0
            ) {

                stockClass =
                    "stock-empty";

            }


            /* STOCK BAJO */

            else if (
                product.stock <=
                product.minStock
            ) {

                stockClass =
                    "stock-low";

            }


            return `

                <div class="product-card">


                    <!-- INFORMACIÓN DEL PRODUCTO -->

                    <div class="product-info">

                        <h3>

                            ${escapeHTML(
                                product.name
                            )}

                        </h3>


                        <div class="product-category">

                            ${escapeHTML(
                                product.category
                            )}

                        </div>


                        <div
                            class="${stockClass}
                            product-stock">

                            Stock:
                            ${product.stock}

                        </div>


                        <div class="product-price">

                            ${money(
                                product.price
                            )}

                            / unidad

                        </div>

                    </div>


                    <!-- BOTONES -->

                    <div class="product-actions">


                        <button
                            class="small-button
                            edit-button"
                            onclick="editProduct(
                                ${product.id}
                            )">

                            ✏️ Editar

                        </button>


                        <button
                            class="small-button
                            delete-button"
                            onclick="deleteProduct(
                                ${product.id}
                            )">

                            🗑️ Eliminar

                        </button>


                    </div>


                </div>

            `;

        }).join("");

}


/* =========================================================
   10. STOCK BAJO
========================================================= */

function renderLowStock() {


    const list =
        document.getElementById(
            "lowStockList"
        );


    /* ---------- BUSCAR PRODUCTOS CON STOCK BAJO ---------- */

    const lowProducts =
        data.products.filter(
            product =>
                Number(product.stock)
                <=
                Number(product.minStock)
        );


    /* ---------- NO HAY STOCK BAJO ---------- */

    if (!lowProducts.length) {

        list.innerHTML = `

            <div class="empty">

                ✅ Todo está bien.

                <br>

                No tienes productos
                con stock bajo.

            </div>

        `;

        return;

    }


    /* ---------- MOSTRAR STOCK BAJO ---------- */

    list.innerHTML =

        lowProducts.map(product => `

            <div class="low-item">


                <div>

                    <strong>

                        ${escapeHTML(
                            product.name
                        )}

                    </strong>


                    <div>

                        Mínimo:
                        ${product.minStock}

                    </div>

                </div>


                <strong>

                    ${product.stock}

                    unidades

                </strong>


            </div>

        `).join("");

}


/* =========================================================
   11. HISTORIAL DE MOVIMIENTOS
========================================================= */

function renderHistory() {


    const list =
        document.getElementById(
            "historyList"
        );


    /* ---------- ORDENAR MOVIMIENTOS ---------- */

    const movements =

        [...data.movements]

            .sort(
                (a, b) =>
                    new Date(b.date)
                    -
                    new Date(a.date)
            )

            .slice(0, 20);


    /* ---------- SI NO HAY MOVIMIENTOS ---------- */

    if (!movements.length) {

        list.innerHTML = `

            <div class="empty">

                Todavía no hay movimientos.

            </div>

        `;

        return;

    }


    /* ---------- MOSTRAR HISTORIAL ---------- */

    list.innerHTML =

        movements.map(movement => {


            const product =
                findProduct(
                    movement.productId
                );


            const isEntry =
                movement.type === "entry";


            const date =
                new Date(
                    movement.date
                )
                .toLocaleString(
                    "es-EC"
                );


            return `

                <div class="history-item">


                    <div>


                        <strong>

                            ${
                                escapeHTML(
                                    product
                                        ? product.name
                                        : "Producto eliminado"
                                )
                            }

                        </strong>


                        <div>

                            ${
                                escapeHTML(
                                    movement.reason
                                    ||
                                    "Sin motivo"
                                )
                            }

                        </div>


                        <div class="history-date">

                            ${date}

                        </div>


                    </div>


                    <div
                        class="${
                            isEntry
                            ? "history-entry"
                            : "history-exit"
                        }">


                        ${
                            isEntry
                            ? "+"
                            : "-"
                        }

                        ${movement.quantity}


                    </div>


                </div>

            `;

        }).join("");

}


/* =========================================================
   12. ACTUALIZAR TODA LA APLICACIÓN
========================================================= */

function render() {

    renderSummary();

    renderProducts();

    renderLowStock();

    renderHistory();

}


/* =========================================================
   13. ABRIR MODALES
========================================================= */

function openModal(id) {

    document
        .getElementById(id)
        .classList
        .add("active");

}


/* =========================================================
   14. CERRAR MODALES
========================================================= */

function closeModal(id) {

    document
        .getElementById(id)
        .classList
        .remove("active");

}


/* =========================================================
   15. AGREGAR PRODUCTO
========================================================= */

function openProductModal() {


    /* ---------- LIMPIAR FORMULARIO ---------- */

    document
        .getElementById(
            "productForm"
        )
        .reset();


    /* ---------- BORRAR ID ---------- */

    document
        .getElementById(
            "productId"
        )
        .value = "";


    /* ---------- CAMBIAR TÍTULO ---------- */

    document
        .getElementById(
            "productModalTitle"
        )
        .textContent =
        "Agregar producto";


    /* ---------- ABRIR MODAL ---------- */

    openModal(
        "productModal"
    );

}


/* =========================================================
   16. GUARDAR PRODUCTO
========================================================= */

document
    .getElementById(
        "productForm"
    )
    .addEventListener(
        "submit",
        function(event) {


            /* EVITAR RECARGAR LA PÁGINA */

            event.preventDefault();


            /* ---------- OBTENER DATOS ---------- */

            const id =
                document
                    .getElementById(
                        "productId"
                    )
                    .value;


            const name =
                document
                    .getElementById(
                        "productName"
                    )
                    .value
                    .trim();


            const category =
                document
                    .getElementById(
                        "productCategory"
                    )
                    .value;


            const stock =
                Number(
                    document
                        .getElementById(
                            "productStock"
                        )
                        .value
                );


            const minStock =
                Number(
                    document
                        .getElementById(
                            "productMin"
                        )
                        .value
                );


            const price =
                Number(
                    document
                        .getElementById(
                            "productPrice"
                        )
                        .value
                );


            /* =================================================
               17. EDITAR PRODUCTO EXISTENTE
            ================================================= */

            if (id) {


                const product =
                    findProduct(id);


                if (product) {

                    product.name =
                        name;

                    product.category =
                        category;

                    product.stock =
                        stock;

                    product.minStock =
                        minStock;

                    product.price =
                        price;

                }

            }


            /* =================================================
               18. CREAR PRODUCTO NUEVO
            ================================================= */

            else {


                const newProduct = {

                    id:
                        Date.now(),

                    name:
                        name,

                    category:
                        category,

                    stock:
                        stock,

                    minStock:
                        minStock,

                    price:
                        price

                };


                data.products.push(
                    newProduct
                );

            }


            /* ---------- GUARDAR ---------- */

            saveData();


            /* ---------- ACTUALIZAR ---------- */

            render();


            /* ---------- CERRAR ---------- */

            closeModal(
                "productModal"
            );

        }
    );


/* =========================================================
   19. EDITAR PRODUCTO
========================================================= */

function editProduct(id) {


    const product =
        findProduct(id);


    if (!product) {

        return;

    }


    /* ---------- CARGAR DATOS EN FORMULARIO ---------- */

    document
        .getElementById(
            "productId"
        )
        .value =
        product.id;


    document
        .getElementById(
            "productName"
        )
        .value =
        product.name;


    document
        .getElementById(
            "productCategory"
        )
        .value =
        product.category;


    document
        .getElementById(
            "productStock"
        )
        .value =
        product.stock;


    document
        .getElementById(
            "productMin"
        )
        .value =
        product.minStock;


    document
        .getElementById(
            "productPrice"
        )
        .value =
        product.price;


    /* ---------- CAMBIAR TÍTULO ---------- */

    document
        .getElementById(
            "productModalTitle"
        )
        .textContent =
        "Editar producto";


    /* ---------- ABRIR MODAL ---------- */

    openModal(
        "productModal"
    );

}


/* =========================================================
   20. ELIMINAR PRODUCTO
========================================================= */

function deleteProduct(id) {


    const product =
        findProduct(id);


    if (!product) {

        return;

    }


    /* ---------- CONFIRMAR ---------- */

    const confirmDelete =
        confirm(
            `¿Quieres eliminar "${product.name}"?`
        );


    if (!confirmDelete) {

        return;

    }


    /* ---------- ELIMINAR ---------- */

    data.products =
        data.products.filter(
            product =>
                product.id !==
                Number(id)
        );


    /* ---------- GUARDAR ---------- */

    saveData();


    /* ---------- ACTUALIZAR ---------- */

    render();

}


/* =========================================================
   21. ABRIR ENTRADA / SALIDA
========================================================= */

function openMovementModal(type) {


    /* ---------- LIMPIAR FORMULARIO ---------- */

    document
        .getElementById(
            "movementForm"
        )
        .reset();


    /* ---------- GUARDAR TIPO ---------- */

    document
        .getElementById(
            "movementType"
        )
        .value =
        type;


    /* ---------- TÍTULO ---------- */

    if (type === "entry") {

        document
            .getElementById(
                "movementTitle"
            )
            .textContent =
            "➕ Entrada de inventario";

    }

    else {

        document
            .getElementById(
                "movementTitle"
            )
            .textContent =
            "➖ Salida de inventario";

    }


    /* ---------- CARGAR PRODUCTOS ---------- */

    populateMovementProducts();


    /* ---------- ABRIR ---------- */

    openModal(
        "movementModal"
    );

}


/* =========================================================
   22. CARGAR PRODUCTOS EN ENTRADA / SALIDA
========================================================= */

function populateMovementProducts() {


    const select =
        document
            .getElementById(
                "movementProduct"
            );


    /* ---------- OPCIÓN INICIAL ---------- */

    select.innerHTML = `

        <option value="">

            Selecciona un producto

        </option>

    `;


    /* ---------- AGREGAR PRODUCTOS ---------- */

    data.products.forEach(
        product => {

            select.innerHTML += `

                <option
                    value="${product.id}">

                    ${escapeHTML(
                        product.name
                    )}

                    — Stock:
                    ${product.stock}

                </option>

            `;

        }
    );

}


/* =========================================================
   23. GUARDAR ENTRADA / SALIDA
========================================================= */

document
    .getElementById(
        "movementForm"
    )
    .addEventListener(
        "submit",
        function(event) {


            /* EVITAR RECARGAR */

            event.preventDefault();


            /* ---------- OBTENER TIPO ---------- */

            const type =
                document
                    .getElementById(
                        "movementType"
                    )
                    .value;


            /* ---------- PRODUCTO ---------- */

            const productId =
                Number(
                    document
                        .getElementById(
                            "movementProduct"
                        )
                        .value
                );


            /* ---------- CANTIDAD ---------- */

            const quantity =
                Number(
                    document
                        .getElementById(
                            "movementQuantity"
                        )
                        .value
                );


            /* ---------- MOTIVO ---------- */

            const reason =
                document
                    .getElementById(
                        "movementReason"
                    )
                    .value
                    .trim();


            /* ---------- BUSCAR PRODUCTO ---------- */

            const product =
                findProduct(
                    productId
                );


            /* ---------- VALIDAR PRODUCTO ---------- */

            if (!product) {

                alert(
                    "Selecciona un producto."
                );

                return;

            }


            /* ---------- VALIDAR CANTIDAD ---------- */

            if (
                !quantity ||
                quantity <= 0
            ) {

                alert(
                    "La cantidad debe ser mayor que 0."
                );

                return;

            }


            /* =================================================
               24. ENTRADA DE INVENTARIO
            ================================================= */

            if (
                type === "entry"
            ) {

                product.stock +=
                    quantity;

            }


            /* =================================================
               25. SALIDA DE INVENTARIO
            ================================================= */

            else {


                /* ---------- REVISAR STOCK ---------- */

                if (
                    quantity >
                    product.stock
                ) {

                    alert(
                        "No hay suficiente stock."
                    );

                    return;

                }


                /* ---------- RESTAR STOCK ---------- */

                product.stock -=
                    quantity;

            }


            /* =================================================
               26. GUARDAR MOVIMIENTO
            ================================================= */

            data.movements.push({

                id:
                    Date.now(),

                productId:
                    productId,

                type:
                    type,

                quantity:
                    quantity,

                reason:
                    reason
                    ||
                    (
                        type === "entry"
                        ?
                        "Entrada de inventario"
                        :
                        "Salida de inventario"
                    ),

                date:
                    new Date()
                    .toISOString()

            });


            /* ---------- GUARDAR DATOS ---------- */

            saveData();


            /* ---------- ACTUALIZAR PANTALLA ---------- */

            render();


            /* ---------- CERRAR MODAL ---------- */

            closeModal(
                "movementModal"
            );

        }
    );


/* =========================================================
   27. NAVEGACIÓN
========================================================= */

function show(section) {


    /* ---------- PRODUCTOS ---------- */

    if (
        section === "products"
    ) {

        document
            .getElementById(
                "productsSection"
            )
            .scrollIntoView({
                behavior: "smooth"
            });

        return;

    }


    /* ---------- STOCK BAJO ---------- */

    if (
        section === "low"
    ) {

        document
            .getElementById(
                "lowSection"
            )
            .scrollIntoView({
                behavior: "smooth"
            });

        return;

    }


    /* ---------- HISTORIAL ---------- */

    if (
        section === "history"
    ) {

        document
            .getElementById(
                "historySection"
            )
            .scrollIntoView({
                behavior: "smooth"
            });

        return;

    }


    /* ---------- ENTRADA ---------- */

    if (
        section === "entry"
    ) {

        openMovementModal(
            "entry"
        );

        return;

    }


    /* ---------- SALIDA ---------- */

    if (
        section === "exit"
    ) {

        openMovementModal(
            "exit"
        );

        return;

    }

}


/* =========================================================
   28. CERRAR MODAL AL HACER CLIC AFUERA
========================================================= */

document
    .querySelectorAll(".modal")
    .forEach(
        modal => {

            modal.addEventListener(
                "click",
                function(event) {


                    if (
                        event.target ===
                        modal
                    ) {

                        modal
                            .classList
                            .remove(
                                "active"
                            );

                    }

                }
            );

        }
    );


/* =========================================================
   29. INICIAR APLICACIÓN
========================================================= */

loadData();

render();


/* =========================================================
   FIN DE app.js
========================================================= */