/* eslint-disable react-hooks/set-state-in-effect */
import NavBar from "../components/NavBar";
import { useEffect, useState } from "react";
import { getPopularProducts } from "../services/api";
import "./Popular.css";
function Popular() {
  const [data, setData] = useState([]);
  async function loadPopularProducts() {
    const result = await getPopularProducts();
    setData(result);
  }
  useEffect(() => {
    loadPopularProducts();
  }, []);
  return (
    <div className="popular">
      <NavBar />

      <header className="popular__header">
        <span className="popular__eyebrow">Top Sellers</span>
        <h1 className="popular__title">Popular</h1>
      </header>

      {data && data.length > 0 ? (
        <div className="popular__list">
          {data.map((item, index) => (
            <div className="popular-card" key={item.id}>
              <span className="popular-card__rank">{index + 1}</span>

              <div className="popular-card__main">
                <h2 className="popular-card__name">{item.name}</h2>
              </div>

              <div className="popular-card__stats">
                <div className="popular-card__stat">
                  <span className="popular-card__stat-label">Sold</span>
                  <span className="popular-card__stat-value">{item.quantity_sold}</span>
                </div>
                <div className="popular-card__stat">
                  <span className="popular-card__stat-label">Total Sales</span>
                  <span className="popular-card__stat-value">{item.total_sales}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="popular__empty">
          <span className="popular__empty-icon">★</span>
          <h2 className="popular__empty-title">No sales yet</h2>
          <p className="popular__empty-text">
            Popular products will show up here once sales come in.
          </p>
        </div>
      )}
    </div>
  );
}
export default Popular;
