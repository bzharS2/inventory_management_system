/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { getSales, getSalesDate, getSalesByRange } from "../services/api";
import NavBar from "../components/NavBar";
import "./Sales.css";

function Sales() {
  const [data, setData] = useState([]);
  const [date, setDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  async function loadSales() {
    const result = await getSales();
    setData(result);
  }
  async function loadSalesDate(date) {
    if (!date || date.trim() === "") {
      alert("Please select a valid date.");
      setDate("");
      loadSales();
      return;
    }
    const result = await getSalesDate(date);
    setData(result);
  }
  async function loadSalesByRange(startDate, endDate) {
    if (
      !startDate ||
      !endDate ||
      startDate.trim() === "" ||
      endDate.trim() === "" ||
      new Date(startDate) > new Date(endDate)
    ) {
      alert(
        "Invalid date range. Please ensure both dates are filled and the start date is not after the end date.",
      );
      loadSales();
      setStartDate("");
      setEndDate("");
      return;
    }
    const result = await getSalesByRange(startDate, endDate);
    setData(result);
  }

  useEffect(() => {
    loadSales();
  }, []);

  return (
    <div className="sales">
      <NavBar />

      <header className="sales__header">
        <span className="sales__eyebrow">Activity</span>
        <h1 className="sales__title">Sales</h1>
      </header>

      <div className="sales__filters">
        <div className="sales__filter-group">
          <span className="sales__filter-label">Filter by range</span>
          <div className="sales__filter-row">
            <div className="sales__field">
              <label htmlFor="start-date">Start Date</label>
              <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="sales__field">
              <label htmlFor="end-date">End Date</label>
              <input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <button
              className="sales__btn sales__btn--ghost"
              onClick={() => {
                loadSalesByRange(startDate, endDate);
                setDate("");
              }}
            >
              Filter
            </button>
          </div>
        </div>

        <div className="sales__filter-group">
          <span className="sales__filter-label">Filter by date</span>
          <div className="sales__filter-row">
            <div className="sales__field">
              <label htmlFor="date">Date</label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <button
              className="sales__btn sales__btn--ghost"
              onClick={() => {
                loadSalesDate(date);
                setStartDate("");
                setEndDate("");
              }}
            >
              Filter
            </button>
            <button
              className="sales__btn sales__btn--primary"
              onClick={() => {
                loadSales();
                setDate("");
                setStartDate("");
                setEndDate("");
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="sales__list">
        {data &&
          data.map((sale) => (
            <div className="sale-card" key={sale.id}>
              <div className="sale-card__main">
                <h2 className="sale-card__name">{sale.name}</h2>
                <span className="sale-card__date">
                  {sale.sold_at.split("T")[0]}
                </span>
              </div>

              <div className="sale-card__stats">
                <div className="sale-card__stat">
                  <span className="sale-card__stat-label">Quantity</span>
                  <span className="sale-card__stat-value">{sale.quantity}</span>
                </div>
                <div className="sale-card__stat">
                  <span className="sale-card__stat-label">Total</span>
                  <span className="sale-card__stat-value">
                    {sale.total_price}$
                  </span>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default Sales;
