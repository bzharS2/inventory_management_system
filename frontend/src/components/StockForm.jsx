/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import "./Form.css";
function Form({ item, onSubmit, onCancel }) {
  const [quantity, setQuantity] = useState("");

  useEffect(() => {
    setQuantity("");
  }, [item]);

  async function handleSubmit(e) {
    e.preventDefault();

    const formData = {
      id: item?.id,
      quantity,
    };

    await onSubmit(formData);
  }

  return (
    <form className="user-form" onSubmit={handleSubmit}>
      <div className="user-form__header">
        <span className="user-form__tag">NEW</span>
        <h2 className="user-form__title">
          add stock to {item?.name}
        </h2>
      </div>

      <div className="user-form__grid">

        <div className="user-form__field">
          <label htmlFor="product-quantity">Quantity</label>
          <input
            id="product-quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
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
         add stock
        </button>
      </div>
    </form>
  );
}

export default Form;
