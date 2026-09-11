/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import "./Form.css";
function Form({ item, onSubmit, onCancel }) {
  const [name, setName] = useState("");
  const [initialCost, setInitialCost] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [barcode, setBarcode] = useState("");

  // If user exists, we're editing
  useEffect(() => {
    if (item) {
      setName(item.name || "");
      setInitialCost(item.initial_cost || "");
      setPrice(item.price || "");
      setQuantity(item.quantity || "");
      setDescription(item.description || "");
      setBarcode(item.barcode || "");
    } else {
      setName("");
      setInitialCost("");
      setPrice("");
      setQuantity("");
      setDescription("");
      setBarcode("");
    }
  }, [item]);


  async function handleSubmit(e) {
    e.preventDefault();

    const formData = {
      id: item?.id,
      name,
      description,
      barcode,
      initial_cost: initialCost,
      price,
      quantity,
    };

    await onSubmit(formData);
  }

  return (
    <form className="user-form" onSubmit={handleSubmit}>
      <div className="user-form__header">
        <span className="user-form__tag">{item ? "EDIT" : "NEW"}</span>
        <h2 className="user-form__title">
          {item ? "Update Product" : "Create Product"}
        </h2>
      </div>

      <div className="user-form__grid">
        <div className="user-form__field">
          <label htmlFor="product-name">Name</label>
          <input
            id="product-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="user-form__field">
          <label htmlFor="product-initial-cost">Initial Cost</label>
          <input
            id="product-initial-cost"
            type="number"
            min="0.01"
            step="0.01"
            value={initialCost}
            onChange={(e) => setInitialCost(e.target.value)}
            required
          />
        </div>

        <div className="user-form__field">
          <label htmlFor="product-price">Price</label>
          <input
            id="product-price"
            type="number"
            min="0.01"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>

        <div className="user-form__field">
          <label htmlFor="product-quantity">Quantity</label>
          <input
            id="product-quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>

        <div className="user-form__field user-form__field--wide">
          <label htmlFor="product-description">Description</label>
          <input
            id="product-description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="user-form__field">
          <label htmlFor="product-barcode">Barcode</label>
          <input
            id="product-barcode"
            type="number"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
          />
        </div>
      </div>

      <div className="user-form__actions">
        <button
          type="button"
          className="user-form__btn user-form__btn--ghost"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="user-form__btn user-form__btn--primary"
        >
          {item ? "Update Product" : "Create Product"}
        </button>
      </div>
    </form>
  );
}

export default Form;
