/* =========================================================
   LATA-ZO
   SISTEMA DE CONTROL DE INVENTARIO
   ARCHIVO: app.js
========================================================= */


/* =========================================================
   1. CONFIGURACIÓN GENERAL
========================================================= */

const STORAGE_KEY = "latazo_inventario_v2";
const DEFAULT_MIN_STOCK = 5;

const SUPABASE_URL =
    "https://lkiohnjtpltmbxjjfugv.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_YSo0l7Hioa6y2UWsFgsnmg_ZxB5FNd1"


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* =========================================================
   2. DATOS PRINCIPALES
========================================================= */

let data = {
    products: [],
    movements: []
};


/* =========================================================
   3. CARGAR DATOS DESDE SUPABASE
========================================================= */

async function loadData() {

    console.log("Cargando datos desde Supabase...");


    /* ---------- PRODUCTOS ---------- */

    const {
        data: products,
        error: productsError
    } = await supabaseClient
        .from("products")
        .select("*")
        .order("id", {
            ascending: true
        });


    if (productsError) {

        console.error(
            "Error cargando productos:",
            productsError
        );

        alert(
            "No se pudieron cargar los productos."
        );

        return;
    }


    /* ---------- MOVIMIENTOS ---------- */

    const {
        data: movements,
        error: movementsError
    } = await supabaseClient
        .from("movements")
        .select("*")
        .order("id", {
            ascending: true
        });


    if (movementsError) {

        console.error(
            "Error cargando movimientos:",
            movementsError
        );

        alert(
            "No se pudieron cargar los movimientos."
        );

        return;
    }


    /* =====================================================
       CONVERTIR LOS NOMBRES DE SUPABASE
       A LOS NOMBRES QUE USA LATA-ZO
    ===================================================== */

    data.products =
        (products || []).map(product => ({

            id:
                Number(product.id),

            name:
                product.name,

            category:
                product.category,

            stock:
                Number(product.stock),

            minStock:
                Number(product.min_stock),

            price:
                Number(product.price)

        }));


    data.movements =
        (movements || []).map(movement => ({

            id:
                Number(movement.id),

            productId:
                Number(movement.product_id),

            type:
                movement.type,

            quantity:
                Number(movement.quantity),

            reason:
                movement.reason,

            date:
                movement.date

        }));


    console.log(
        "Productos cargados:",
        data.products
    );


    console.log(
        "Movimientos cargados:",
        data.movements
    );


    render();
}


/* =========================================================
   4. GUARDAR DATOS EN SUPABASE
========================================================= */

async function saveData() {


    /* =====================================================
       PRODUCTOS
    ===================================================== */

    const productsToSave =
        data.products.map(product => ({

            id:
                Number(product.id),

            name:
                product.name,

            category:
                product.category,

            stock:
                Number(product.stock),

            min_stock:
                Number(product.minStock),

            price:
                Number(product.price)

        }));


    const {
        error: productsError
    } = await supabaseClient
        .from("products")
        .upsert(
            productsToSave,
            {
                onConflict: "id"
            }
        );


    if (productsError) {

        console.error(
            "Error guardando productos:",
            productsError
        );

        alert(
            "No se pudo guardar el producto."
        );

        return false;
    }


    /* =====================================================
       MOVIMIENTOS
    ===================================================== */

    if (data.movements.length > 0) {


        const movementsToSave =
            data.movements.map(movement => ({

                id:
                    Number(movement.id),

                product_id:
                    Number(movement.productId),

                type:
                    movement.type,

                quantity:
                    Number(movement.quantity),

                reason:
                    movement.reason || null,

                date:
                    movement.date

            }));


        const {
            error: movementsError
        } = await supabaseClient
            .from("movements")
            .upsert(
                movementsToSave,
                {
                    onConflict: "id"
                }
            );


        if (movementsError) {

            console.error(
                "Error guardando movimientos:",
                movementsError
            );

            alert(
                "No se pudo guardar el movimiento."
            );

            return false;
        }
    }


    console.log(
        "Datos guardados correctamente."
    );

    return true;
}


/* =========================================================
   5. DINERO
========================================================= */

function money(value) {

    return "$" +
        Number(value).toFixed(2);

}


/* =========================================================
   6. BUSCAR PRODUCTO
========================================================= */

function findProduct(id) {

    return data.products.find(
        product =>
            product.id === Number(id)
    );

}


/* =========================================================
   7. PROTEGER TEXTO HTML
========================================================= */

function escapeHTML(text) {

    return String(text)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


/* =========================================================
   8. RESUMEN DEL INVENTARIO
========================================================= */

function renderSummary() {


    /* ---------- TOTAL PRODUCTOS ---------- */

    const totalProducts =
        data.products.length;


    /* ---------- TOTAL STOCK ---------- */

    const totalStock =
        data.products.reduce(
            (total, product) =>
                total +
                Number(product.stock),
            0
        );


    /* ---------- STOCK BAJO ---------- */

    const lowStock =
        data.products.filter(
            product =>
                Number(product.stock) <=
                Number(product.minStock)
        ).length;


    /* ---------- VALOR TOTAL ---------- */

    const totalValue =
        data.products.reduce(
            (total, product) =>
                total +
                (
                    Number(product.stock) *
                    Number(product.price)
                ),
            0
        );


    /* ---------- MOSTRAR ---------- */

    const totalProductsElement =
        document.getElementById(
            "totalProducts"
        );

    if (totalProductsElement) {
        totalProductsElement.textContent =
            totalProducts;
    }


    const totalStockElement =
        document.getElementById(
            "totalStock"
        );

    if (totalStockElement) {
        totalStockElement.textContent =
            totalStock;
    }


    const lowStockElement =
        document.getElementById(
            "lowStock"
        );

    if (lowStockElement) {
        lowStockElement.textContent =
            lowStock;
    }


    const totalValueElement =
        document.getElementById(
            "totalValue"
        );

    if (totalValueElement) {
        totalValueElement.textContent =
            money(totalValue);
    }

}


/* =========================================================
   9. MOSTRAR PRODUCTOS
========================================================= */

function renderProducts() {


    const list =
        document.getElementById(
            "productsList"
        );


    if (!list) {
        return;
    }


    /* ---------- BUSCADOR ---------- */

    const searchInput =
        document.getElementById(
            "searchInput"
        );


    const search =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    /* ---------- CATEGORÍA ---------- */

    const categoryFilter =
        document.getElementById(
            "categoryFilter"
        );


    const category =
        categoryFilter
            ? categoryFilter.value
            : "all";


    /* ---------- FILTRAR ---------- */

    const products =
        data.products.filter(
            product => {

                const matchesSearch =
                    String(product.name)
                        .toLowerCase()
                        .includes(search);


                const matchesCategory =
                    category === "all" ||
                    product.category === category;


                return (
                    matchesSearch &&
                    matchesCategory
                );

            }
        );


    /* ---------- SIN PRODUCTOS ---------- */

    if (!products.length) {

        list.innerHTML = `

            <div class="empty">

                No hay productos para mostrar.

            </div>

        `;

        return;
    }


    /* ---------- TARJETAS ---------- */

    list.innerHTML =

        products.map(product => {


            let stockClass =
                "stock-ok";


            if (
                Number(product.stock) <= 0
            ) {

                stockClass =
                    "stock-empty";

            }

            else if (
                Number(product.stock) <=
                Number(product.minStock)
            ) {

                stockClass =
                    "stock-low";

            }


            return `

                <div class="product-card">

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

                        <div class="${stockClass} product-stock">

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


                    <div class="product-actions">

                        <button
                            class="small-button edit-button"
                            onclick="editProduct(${product.id})">

                            ✏️ Editar

                        </button>


                        <button
                            class="small-button delete-button"
                            onclick="deleteProduct(${product.id})">

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


    if (!list) {
        return;
    }


    const lowProducts =
        data.products.filter(
            product =>
                Number(product.stock) <=
                Number(product.minStock)
        );


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
   11. HISTORIAL
========================================================= */

function renderHistory() {


    const list =
        document.getElementById(
            "historyList"
        );


    if (!list) {
        return;
    }


    const movements =

        [...data.movements]

            .sort(
                (a, b) =>
                    new Date(b.date) -
                    new Date(a.date)
            )

            .slice(0, 20);


    if (!movements.length) {

        list.innerHTML = `

            <div class="empty">

                Todavía no hay movimientos.

            </div>

        `;

        return;
    }


    list.innerHTML =

        movements.map(
            movement => {


                const product =
                    findProduct(
                        movement.productId
                    );


                const isEntry =
                    movement.type === "entry";


                const date =
                    new Date(
                        movement.date
                    ).toLocaleString(
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
                                        movement.reason ||
                                        "Sin motivo"
                                    )
                                }

                            </div>


                            <div class="history-date">

                                ${date}

                            </div>

                        </div>


                        <div class="${
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

            }
        ).join("");

}


/* =========================================================
   12. ACTUALIZAR APLICACIÓN
========================================================= */

function render() {

    renderSummary();

    renderProducts();

    renderLowStock();

    renderHistory();

}


/* =========================================================
   13. MODALES
========================================================= */

function openModal(id) {

    const element =
        document.getElementById(id);

    if (element) {

        element.classList.add(
            "active"
        );

    }

}


function closeModal(id) {

    const element =
        document.getElementById(id);

    if (element) {

        element.classList.remove(
            "active"
        );

    }

}


/* =========================================================
   14. ABRIR PRODUCTO
========================================================= */

function openProductModal() {


    const form =
        document.getElementById(
            "productForm"
        );


    if (form) {
        form.reset();
    }


    const productId =
        document.getElementById(
            "productId"
        );


    if (productId) {
        productId.value = "";
    }


    const title =
        document.getElementById(
            "productModalTitle"
        );


    if (title) {

        title.textContent =
            "Agregar producto";

    }


    openModal(
        "productModal"
    );

}


/* =========================================================
   15. GUARDAR PRODUCTO
========================================================= */

const productForm =
    document.getElementById(
        "productForm"
    );


if (productForm) {

    productForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            /* ---------- DATOS ---------- */

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


            /* ---------- VALIDAR ---------- */

            if (!name) {

                alert(
                    "Escribe el nombre del producto."
                );

                return;
            }


            if (!category) {

                alert(
                    "Selecciona una categoría."
                );

                return;
            }


            /* =================================================
               EDITAR
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
               CREAR
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

            const saved =
                await saveData();


            if (!saved) {
                return;
            }


            /* ---------- ACTUALIZAR ---------- */

            render();


            /* ---------- CERRAR ---------- */

            closeModal(
                "productModal"
            );

        }
    );

}


/* =========================================================
   16. EDITAR PRODUCTO
========================================================= */

function editProduct(id) {


    const product =
        findProduct(id);


    if (!product) {
        return;
    }


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


    document
        .getElementById(
            "productModalTitle"
        )
        .textContent =
        "Editar producto";


    openModal(
        "productModal"
    );

}


/* =========================================================
   17. ELIMINAR PRODUCTO
========================================================= */

async function deleteProduct(id) {


    const product =
        findProduct(id);


    if (!product) {
        return;
    }


    const confirmDelete =
        confirm(
            `¿Quieres eliminar "${product.name}"?`
        );


    if (!confirmDelete) {
        return;
    }


    /* ---------- ELIMINAR DE SUPABASE ---------- */

    const {
        error
    } = await supabaseClient
        .from("products")
        .delete()
        .eq(
            "id",
            Number(id)
        );


    if (error) {

        console.error(
            "Error eliminando producto:",
            error
        );

        alert(
            "No se pudo eliminar el producto."
        );

        return;
    }


    /* ---------- ELIMINAR DE MEMORIA ---------- */

    data.products =
        data.products.filter(
            product =>
                product.id !==
                Number(id)
        );


    /* ---------- ACTUALIZAR ---------- */

    render();

}


/* =========================================================
   18. ABRIR ENTRADA / SALIDA
========================================================= */

function openMovementModal(type) {


    const form =
        document.getElementById(
            "movementForm"
        );


    if (form) {
        form.reset();
    }


    document
        .getElementById(
            "movementType"
        )
        .value =
        type;


    const title =
        document.getElementById(
            "movementTitle"
        );


    if (title) {

        if (type === "entry") {

            title.textContent =
                "➕ Entrada de inventario";

        }

        else {

            title.textContent =
                "➖ Salida de inventario";

        }

    }


    populateMovementProducts();


    openModal(
        "movementModal"
    );

}


/* =========================================================
   19. PRODUCTOS EN MOVIMIENTOS
========================================================= */

function populateMovementProducts() {


    const select =
        document.getElementById(
            "movementProduct"
        );


    if (!select) {
        return;
    }


    select.innerHTML = `

        <option value="">

            Selecciona un producto

        </option>

    `;


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
   20. GUARDAR ENTRADA / SALIDA
========================================================= */

const movementForm =
    document.getElementById(
        "movementForm"
    );


if (movementForm) {

    movementForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const type =
                document
                    .getElementById(
                        "movementType"
                    )
                    .value;


            const productId =
                Number(
                    document
                        .getElementById(
                            "movementProduct"
                        )
                        .value
                );


            const quantity =
                Number(
                    document
                        .getElementById(
                            "movementQuantity"
                        )
                        .value
                );


            const reason =
                document
                    .getElementById(
                        "movementReason"
                    )
                    .value
                    .trim();


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
               ENTRADA
            ================================================= */

            if (
                type === "entry"
            ) {

                product.stock +=
                    quantity;

            }


            /* =================================================
               SALIDA
            ================================================= */

            else {

                if (
                    quantity >
                    product.stock
                ) {

                    alert(
                        "No hay suficiente stock."
                    );

                    return;
                }


                product.stock -=
                    quantity;

            }


            /* =================================================
               CREAR MOVIMIENTO
            ================================================= */

            const newMovement = {

                id:
                    Date.now(),

                productId:
                    productId,

                type:
                    type,

                quantity:
                    quantity,

                reason:
                    reason ||
                    (
                        type === "entry"
                            ? "Entrada de inventario"
                            : "Salida de inventario"
                    ),

                date:
                    new Date()
                        .toISOString()

            };


            data.movements.push(
                newMovement
            );


            /* ---------- GUARDAR ---------- */

            const saved =
                await saveData();


            if (!saved) {

                /* Si falla, deshacemos el cambio */

                if (
                    type === "entry"
                ) {

                    product.stock -=
                        quantity;

                }

                else {

                    product.stock +=
                        quantity;

                }


                data.movements =
                    data.movements.filter(
                        movement =>
                            movement.id !==
                            newMovement.id
                    );

                return;
            }


            /* ---------- ACTUALIZAR ---------- */

            render();


            /* ---------- CERRAR ---------- */

            closeModal(
                "movementModal"
            );

        }
    );

}


/* =========================================================
   21. NAVEGACIÓN
========================================================= */

function show(section) {


    if (
        section === "products"
    ) {

        const element =
            document.getElementById(
                "productsSection"
            );


        if (element) {

            element.scrollIntoView();

        }


        return;
    }


    if (
        section === "low"
    ) {

        const element =
            document.getElementById(
                "lowSection"
            );


        if (element) {

            element.scrollIntoView();

        }


        return;
    }


    if (
        section === "history"
    ) {

        const element =
            document.getElementById(
                "historySection"
            );


        if (element) {

            element.scrollIntoView();

        }


        return;
    }


    if (
        section === "entry"
    ) {

        openMovementModal(
            "entry"
        );

        return;
    }


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
   22. CERRAR MODAL AL HACER CLIC AFUERA
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
   23. INICIAR APLICACIÓN
========================================================= */

loadData();


/* =========================================================
   FIN DE app.js
========================================================= */
