/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import {
  getProducts,
  searchProducts,
  getProductsByBarcode,
  deleteProduct,
  createProduct,
  updateProduct,
  addStock,
} from "../services/api";
import NavBar from "../components/NavBar";
import "./Products.css";
import Form from "../components/form";
import StockForm from "../components/StockForm";
import ConfirmDialog from "../components/ConfirmDialog";

function Products() {
  const [data, setData] = useState([]);
  const [barcode, setBarcode] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [fromUpdate, setFromUpdate] = useState(false);
  const [itemToUpdate, setItemToUpdate] = useState(null);
  const [fromStock, setFromStock] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  async function loadProducts() {
    const result = await getProducts();
    setData(result);
  }
  async function handleSearch(value) {
    if (value === "") {
      return loadProducts();
    }
    const result = await searchProducts(value);
    setData(result);
  }
  async function handleSearchByBarcode(value) {
    if (value == "") {
      return loadProducts();
    }
    const result = await getProductsByBarcode(value);
    setData(result);
  }
  async function handleDelete() {
    const result = await deleteProduct(itemToDelete);
    if (result.error) {
      alert(result.error);
    }
    setItemToDelete(null);
    loadProducts();
  }
  async function addProduct(productData) {
    const result = await createProduct(productData);
    if (result.error) {
      alert(result.error);
    }
    setShowForm(false);
    loadProducts();
  }
  async function handleUpdateProduct(productData) {
    const result = await updateProduct(productData);
    if (result.error) {
      alert(result.error);
    }
    setFromUpdate(false);
    loadProducts();
  }
  async function handleAddStock(productData) {
    const result = await addStock(productData);
    if (result.error) {
      alert(result.error);
    }
    setFromStock(false);
    loadProducts();
  }

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <div className="products">
      <NavBar />

      <header className="products__header">
        <span className="products__eyebrow">Inventory</span>
        <h1 className="products__title">Products</h1>
      </header>

      <div className="products__toolbar">
        <div className="products__search-group">
          <input
            className="products__input"
            type="text"
            placeholder="Search by name..."
            onChange={(e) => handleSearch(e.target.value)}
          />

          <div className="products__search-inline">
            <input
              className="products__input"
              type="text"
              placeholder="Search by barcode..."
              onChange={(e) => {
                if (e.target.value === "") {
                  return loadProducts();
                }
                setBarcode(e.target.value);
              }}
            />
            <button
              className="products__btn products__btn--ghost"
              onClick={() => handleSearchByBarcode(barcode)}
            >
              Submit
            </button>
          </div>
        </div>

        <button
          className="products__btn products__btn--primary"
          onClick={() => setShowForm(true)}
        >
          Add Product
        </button>
      </div>


      {showForm && (
        <div className="products__form-overlay">
          <Form
            item={null}
            onSubmit={addProduct}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {fromUpdate && (
        <div className="products__form-overlay">
          <Form
            item={itemToUpdate}
            onSubmit={handleUpdateProduct}
            onCancel={() => setFromUpdate(false)}
          />
        </div>
      )}

      {fromStock && (
        <div className="products__form-overlay">
          <StockForm
            item={itemToUpdate}
            onSubmit={handleAddStock}
            onCancel={() => setFromStock(false)}
          />
        </div>
      )}

      <ConfirmDialog
        open={itemToDelete !== null}
        title="Delete product?"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setItemToDelete(null)}
      />

      <div className="products__list">
        {data &&
          data.length > 0 &&
          data.map((item) => (
            <div className="product-card" key={item.id}>
              <div className="product-card__main">
                <h2 className="product-card__name">{item.name}</h2>
                <p className="product-card__description">{item.description}</p>
                <span className="product-card__barcode">{item.barcode}</span>
              </div>

              <div className="product-card__stats">
                <div className="product-card__stat">
                  <span className="product-card__stat-label">Price</span>
                  <span className="product-card__stat-value">
                    {item.price}$
                  </span>
                </div>
                <div className="product-card__stat">
                  <span className="product-card__stat-label">Quantity</span>
                  <span className="product-card__stat-value">
                    {item.quantity}
                  </span>
                </div>

                <div className="product-card__actions">
                  <button
                    className="product-card__btn product-card__btn--update"
                    onClick={() => {
                      setItemToUpdate(item);
                      setFromUpdate(true);
                    }}
                  >
                    Update
                  </button>
                  <button
                    className="product-card__btn product-card__btn--delete"
                    onClick={() => setItemToDelete(item.id)}
                  >
                    Delete
                  </button>
                  <button
                    className="product-card__btn product-card__btn--stock"
                    onClick={() => {
                      setItemToUpdate(item);
                      setFromStock(true);
                    }}
                  >
                    Add Stock
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default Products;
