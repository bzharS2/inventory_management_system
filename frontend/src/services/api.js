async function getDashboard() {
  const response = await fetch(`http://localhost:5000/app/dashboard`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
  const data = await response.json();
  return data;
}
async function getProducts() {
  const response = await fetch(`http://localhost:5000/app/products`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
  const data = await response.json();
  return data;
}
async function getSales() {
  const response = await fetch(`http://localhost:5000/app/sales`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
  const data = await response.json();
  return data;
}
async function searchProducts(query) {
  const response = await fetch(`http://localhost:5000/app/product/name`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: query
    }),
  })
  const data = await response.json();
  return data;
}
async function getProductsByBarcode(barcode) {
  const response = await fetch(`http://localhost:5000/app/product/barcode/${barcode}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
  const data = await response.json();
  return data;
}
async function deleteProduct(id) {
  const response = await fetch(`http://localhost:5000/app/product/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  })
  const data = await response.json();
  return data;
}
async function createProduct(productData) {
  const response = await fetch(`http://localhost:5000/app/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(productData),
  })
  const data = await response.json();
  return data;
}
async function updateProduct(productData) {
  const response = await fetch(`http://localhost:5000/app/product/${productData.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(productData),
  })
  const data = await response.json();
  return data;
}
async function addStock(productData) {
  const response = await fetch(`http://localhost:5000/app/product/${productData.id}/stock`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(productData),
  })
  const data = await response.json();
  return data;
}
async function getLowStocks() {
  const response = await fetch(`http://localhost:5000/app/product/sort/lowStock`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
  const data = await response.json();
  return data;
}
async function getPopularProducts() {
  const response = await fetch(`http://localhost:5000/app/product/sort/popular`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
  const data = await response.json();
  return data;
}
async function getSalesDate(date) {
  const response = await fetch(`http://localhost:5000/app/sales/date`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      date: date
    }),
  })
  const data = await response.json();
  return data;
}
async function getSalesByRange(startDate, endDate) {
  const response = await fetch(`http://localhost:5000/app/sales/range`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: startDate,
      to: endDate
    }),
  })
  const data = await response.json();
  return data;
}
async function createSales(items) {
  const response = await fetch(`http://localhost:5000/app/sales`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: items
    }),
  })
  const data = await response.json();
  return data;
}

export {
  getDashboard,
  getProducts,
  getSales,
  searchProducts,
  getProductsByBarcode,
  deleteProduct,
  createProduct,
  updateProduct,
  addStock,
  getLowStocks,
  getPopularProducts,
  getSalesDate,
  getSalesByRange,
  createSales
};