/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import {getLowStocks} from "../services/api";
import NavBar from "../components/NavBar";
import "./LowStocks.css";
function LowStocks() {
    const [data,setData] = useState([]);

    async function loadLowStocks() {
        const result = await getLowStocks();
        console.log(result);
        setData(result);
        
    }
    useEffect(() => {
        loadLowStocks();
    },[])
    return (
        <div className="low-stocks">
            <NavBar />

            <header className="low-stocks__header">
                <span className="low-stocks__eyebrow">Inventory Alerts</span>
                <h1 className="low-stocks__title">Low Stock</h1>
            </header>

            {data && data.length > 0 ? (
                <div className="low-stocks__list">
                    {data.map((item) => (
                        <div className="low-stock-card" key={item.id}>
                            <div className="low-stock-card__main">
                                <h2 className="low-stock-card__name">{item.name}</h2>
                                <span className="low-stock-card__barcode">barcode: {item.barcode}</span>
                            </div>
                            <div className="low-stock-card__stock">
                                <span className="low-stock-card__stock-label">Stock</span>
                                <span className="low-stock-card__stock-value">{item.quantity}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="low-stocks__empty">
                    <span className="low-stocks__empty-icon">✓</span>
                    <h2 className="low-stocks__empty-title">All stocked up</h2>
                    <p className="low-stocks__empty-text">
                        No products are running low right now.
                    </p>
                </div>
            )}
        </div>
    );
}
export default LowStocks;
