import NavBar from "../components/NavBar";
import { useState } from "react";
import CartForm from "../components/CartForm";
import AlertDialog from "../components/AlertDialog";
import { createSales } from "../services/api";
import "./Cart.css";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [fromUpdate, setFromUpdate] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  async function handleAddProduct(product) {
    if (
      product === null ||
      product === undefined ||
      !product.id ||
      !product.name ||
      !product.price ||
      !product.quantity
    ) {
      console.alert("get the product first then add it to the cart");
      return;
    }
    const exists = cartItems.some((item) => item.barcode === product.barcode);
    if (!exists) {
      setCartItems([...cartItems, product]);
    } else
      alert(
        "Product already exists in the cart. Please update the quantity instead.",
      );
  }

  async function handleUpdateProduct(product) {
    if (
      !product.quantity
    ) {
      console.alert("get the product first then add it to the cart");
      return;
    }
    const updatedItems = cartItems.map((item) =>
      item.id === product.id ? product : item,
    );
    setCartItems(updatedItems);
    setFromUpdate(false);
  }
  async function handleCheckout(items) {
    const result = await createSales(items);
    if (result.error) {
      setAlertMessage({
        title: "Checkout failed",
        message: result.error,
      });
      return;
    }
    if (result.message) {
      setAlertMessage({
        title: "Checkout complete",
        message: `${result.message}\nTotal Price: $${result.totalPrice.toFixed(2)}`,
      });
      setShowForm(false);
      setCartItems([]);
    }
  }
  return (
    <div className="cart">
      <NavBar />

      <header className="cart__header">
        <span className="cart__eyebrow">Checkout</span>
        <h1 className="cart__title">Cart Page</h1>
      </header>

      <div className="cart__toolbar">
        <button
          className="cart__btn cart__btn--primary"
          onClick={() => setShowForm(true)}
        >
          Add Product
        </button>
        <button
          className="cart__btn cart__btn--ghost"
          onClick={() => setCartItems([])}
        >
          Clear Cart
        </button>
      </div>

      {showForm && (
        <div className="cart__form-overlay">
          <CartForm
            item={null}
            onSubmit={handleAddProduct}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {fromUpdate && (
        <div className="cart__form-overlay">
          <CartForm
            item={selectedItem}
            onSubmit={handleUpdateProduct}
            onCancel={() => setFromUpdate(false)}
          />
        </div>
      )}

      <AlertDialog
        open={alertMessage !== null}
        title={alertMessage?.title}
        message={alertMessage?.message}
        onClose={() => setAlertMessage(null)}
      />

      {cartItems.length > 0 ? (
        <div className="cart__section">
          <h2 className="cart__section-title">Cart Items</h2>
          <ul className="cart__list">
            {cartItems.map(
              (item) => (
                (
                  <li className="cart-item" key={item.id}>
                    <div className="cart-item__main">
                      <span className="cart-item__name">{item.name}</span>
                      <span className="cart-item__price">{item.price}$</span>
                    </div>
                    <span className="cart-item__quantity">
                      Quantity: {item.quantity}
                    </span>
                    <div className="cart-item__actions">
                      <button
                        className="cart-item__btn cart-item__btn--update"
                        onClick={() => {
                          setSelectedItem(item);
                          setFromUpdate(true);
                        }}
                      >
                        Update
                      </button>
                      <button
                        className="cart-item__btn cart-item__btn--remove"
                        onClick={() =>
                          setCartItems(
                            cartItems.filter(
                              (i) => i.id !== item.id && i.id == i.id,
                            ),
                          )
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                )
              ),
            )}
          </ul>
        </div>
      ) : (
        <div className="cart__empty">
          <span className="cart__empty-icon">🛒</span>
          <h2 className="cart__empty-title">Your cart is empty</h2>
          <p className="cart__empty-text">Add a product to get started.</p>
        </div>
      )}

      {cartItems.length > 0 && (
        <div className="cart__checkout">
          <button
            className="cart__btn cart__btn--checkout"
            onClick={() => {
              handleCheckout(cartItems);
            }}
          >
            Checkout
          </button>
        </div>
      )}
    </div>
  );
}
export default Cart;
