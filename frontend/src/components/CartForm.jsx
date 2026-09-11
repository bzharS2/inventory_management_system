/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import "./Form.css";
import { getProductsByBarcode } from "../services/api";
function CartForm({ item, onSubmit, onCancel }) {
  const [data, setData] = useState([]);
  const [quantity, setQuantity] = useState("");
  const [barcode, setBarcode] = useState("");

  async function handleSearchByBarcode(value) {
    if (value == "") {
      return;
    }
    const result = await getProductsByBarcode(value);
    setData(result);
  }
  useEffect(() => {
    if (item) {
      setQuantity(item.quantity || "");
      setBarcode(item.barcode || "");
    } else {
      setQuantity("");
      setBarcode("");
    }
  }, [item]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!item) {
      const formData = { ...data[0], quantity: parseInt(quantity) };

      await onSubmit(formData);
    } else {
      const formData = { ...item, quantity: parseInt(quantity) };
      await onSubmit(formData);
    }
  }

  return (
    <form className="user-form" onSubmit={handleSubmit}>
      <div className="user-form__header">
        <span className="user-form__tag">{item ? "EDIT" : "ADD"}</span>
        <h2 className="user-form__title">
          {item ? "Update Product" : "Add Product"}
        </h2>
      </div>

      <div className="user-form__grid">
        <div className="user-form__field">
          <label htmlFor="product-quantity">Quantity</label>
          <input
            id="product-quantity"
            type="number"
            value={quantity}
            min={1}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </div>

        {!item && (
          <div className="user-form__field">
            <label htmlFor="product-barcode">Barcode</label>
            <input
              id="product-barcode"
              type="number"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              required
            />
          </div>
        )}
      </div>

      {data && data.length > 0 ? (
        <ul className="cart-form-preview">
          {data.map((product) => (
            <li className="cart-form-preview__item" key={product.id}>
              <span className="cart-form-preview__name">{product.name}</span>
              <span className="cart-form-preview__prices">
                <span>Cost: {product.initial_cost}$</span>
                <span>Price: {product.price}$</span>
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="user-form__actions">
        <button
          type="button"
          className="user-form__btn user-form__btn--ghost"
          onClick={onCancel}
        >
          Cancel
        </button>
        {!item && (
          <button
            onClick={() => handleSearchByBarcode(barcode)}
            type="button"
            className="user-form__btn user-form__btn--ghost"
          >
            Get Product
          </button>
        )}
        <button
          type="submit"
          className="user-form__btn user-form__btn--primary"
        >
          {item ? "Update Product" : "Add Product"}
        </button>
      </div>
    </form>
  );
}

export default CartForm;
