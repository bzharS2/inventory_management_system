/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { getDashboard } from "../services/api";
import NavBar from "../components/NavBar";
import "./Dashboard.css";

function CountUpNumber({ value, suffix = "" }) {
  const target = Number(value);
  const decimalPlaces = getDecimalPlaces(value);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!Number.isFinite(target)) {
      setDisplayValue(0);
      return undefined;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      setDisplayValue(target);
      return undefined;
    }

    const duration = 900;
    const startTime = performance.now();
    let animationFrame;

    function updateValue(currentTime) {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easedProgress = 1 - (1 - progress) ** 3;
      setDisplayValue(target * easedProgress);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(updateValue);
      }
    }

    animationFrame = requestAnimationFrame(updateValue);

    return () => cancelAnimationFrame(animationFrame);
  }, [target]);

  const formattedValue = displayValue.toFixed(decimalPlaces);

  return (
    <>
      {formattedValue}
      {suffix}
    </>
  );
}

function getDecimalPlaces(value) {
  const valueString = String(value);
  const decimalPart = valueString.split(".")[1];

  return decimalPart ? decimalPart.length : 0;
}

function Dashboard() {
  const [data, setData] = useState(null);

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
            <span className="stat-card__value">
              <CountUpNumber value={data.products} />
            </span>
          </div>

          <div className="stat-card">
            <span className="stat-card__label">Total Sales</span>
            <span className="stat-card__value">
              <CountUpNumber value={data.total_sales} suffix="$" />
            </span>
          </div>

          <div className="stat-card">
            <span className="stat-card__label">Total Stock</span>
            <span className="stat-card__value">
              <CountUpNumber value={data.total_stock} />
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
