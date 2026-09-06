/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { getDashboard } from "../services/api";
import NavBar from "../components/NavBar";
import "./Dashboard.css";

function Dashboard() {
  const [data, setData] = useState([]);

  async function loadDashboard() {
    const result = await getDashboard();
    setData(result);
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
   
    <div className="dashboard">
       <NavBar/>
      <header className="dashboard__header">
        <span className="dashboard__eyebrow">Overview</span>
        <h1 className="dashboard__title">Dashboard</h1>
      </header>

      {data && (
        <div className="dashboard__grid">
          <div className="stat-card">
            <span className="stat-card__label">Products</span>
            <span className="stat-card__value">{data.products}</span>
          </div>

          <div className="stat-card">
            <span className="stat-card__label">Total Sales</span>
            <span className="stat-card__value">{data.total_sales}$</span>
          </div>

          <div className="stat-card">
            <span className="stat-card__label">Total Stock</span>
            <span className="stat-card__value">{data.total_stock}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
