// Inicializar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { 
  getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc 
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB_p6pdSZioqABLhyYPQ2Qm8RzXqItzkqQ",
  authDomain: "inven-tazo.firebaseapp.com",
  projectId: "inven-tazo",
  storageBucket: "inven-tazo.firebasestorage.app",
  messagingSenderId: "747586992158",
  appId: "1:747586992158:web:c1c29b7be1938bcb44d68f",
  measurementId: "G-77XQF13BQ4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Clase Producto
class Producto {
  constructor(id, nombre, precio, cantidad) {
    this.id = id;
    this.nombre = nombre;
    this.precio = parseFloat(precio);
    this.cantidad = parseInt(cantidad);
  }
}

// Gestor de Inventario
class GestorInventario {
  constructor() {
    this.productos = [];
    this.cargarProductos();
  }

  async cargarProductos() {
    this.productos = [];
    const querySnapshot = await getDocs(collection(db, "productos"));
    querySnapshot.forEach((doc) => {
      this.productos.push(new Producto(doc.id, doc.data().nombre, doc.data().precio, doc.data().cantidad));
    });
    this.actualizarTabla();
  }

  async agregarProducto(nombre, precio, cantidad) {
    await addDoc(collection(db, "productos"), {
      nombre: nombre,
      precio: parseFloat(precio),
      cantidad: parseInt(cantidad)
    });
    await this.cargarProductos();
  }

  async eliminarProducto(id) {
    await deleteDoc(doc(db, "productos", id));
    await this.cargarProductos();
  }

  async actualizarCantidad(id, nuevaCantidad) {
    const producto = this.productos.find(p => p.id === id);
    if (producto) {
      await updateDoc(doc(db, "productos", id), {
        cantidad: parseInt(nuevaCantidad)
      });
      await this.cargarProductos();
    }
  }

  actualizarTabla() {
    const tbody = document.querySelector('#tabla-productos tbody');
    tbody.innerHTML = '';
    
    this.productos.forEach(producto => {
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${producto.nombre}</td>
        <td>$${producto.precio.toFixed(2)}</td>
        <td>${producto.cantidad}</td>
        <td>
          <button onclick="gestor.eliminarProducto('${producto.id}')">Eliminar</button>
          <button onclick="gestor.venderProducto('${producto.id}')">Vender</button>
        </td>
      `;
      tbody.appendChild(fila);
    });
  }

  async venderProducto(id) {
    const producto = this.productos.find(p => p.id === id);
    if (producto && producto.cantidad > 0) {
      await updateDoc(doc(db, "productos", id), {
        cantidad: producto.cantidad - 1
      });
      await this.cargarProductos();
    } else {
      alert('No hay stock disponible');
    }
  }
}

// Inicializar
const gestor = new GestorInventario();

// Eventos del formulario
document.getElementById('formulario-producto').addEventListener('submit', async (e) => {
  e.preventDefault();
  const nombre = document.getElementById('nombre').value;
  const precio = document.getElementById('precio').value;
  const cantidad = document.getElementById('cantidad').value;
  
  await gestor.agregarProducto(nombre, precio, cantidad);
  e.target.reset();
});
