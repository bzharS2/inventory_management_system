async function getCsrfToken() {
  const response = await fetch('http://localhost:5000/auth/csrf-token', {
    credentials: 'include',
  });

  const data = await response.json().catch(() => ({}));
  return response.ok ? data.csrfToken : '';
}

async function requestJson(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    credentials: 'include',
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));
  return data;
}

async function getDashboard() {
  return requestJson('http://localhost:5000/app/dashboard');
}

async function getProducts() {
  return requestJson('http://localhost:5000/app/products');
}

async function getSales() {
  return requestJson('http://localhost:5000/app/sales');
}

async function searchProducts(query) {
  return requestJson('http://localhost:5000/app/product/name', {
    method: 'POST',
    body: JSON.stringify({ name: query }),
  });
}

async function getProductsByBarcode(barcode) {
  return requestJson(`http://localhost:5000/app/product/barcode/${barcode}`);
}

async function deleteProduct(id) {
  const csrfToken = await getCsrfToken();
  return requestJson(`http://localhost:5000/app/product/${id}`, {
    method: 'DELETE',
    headers: { 'X-CSRF-Token': csrfToken },
  });
}

async function createProduct(productData) {
  const csrfToken = await getCsrfToken();
  return requestJson('http://localhost:5000/app/products', {
    method: 'POST',
    headers: { 'X-CSRF-Token': csrfToken },
    body: JSON.stringify(productData),
  });
}

async function updateProduct(productData) {
  const csrfToken = await getCsrfToken();
  return requestJson(`http://localhost:5000/app/product/${productData.id}`, {
    method: 'PUT',
    headers: { 'X-CSRF-Token': csrfToken },
    body: JSON.stringify(productData),
  });
}

async function addStock(productData) {
  const csrfToken = await getCsrfToken();
  return requestJson(`http://localhost:5000/app/product/${productData.id}/stock`, {
    method: 'PATCH',
    headers: { 'X-CSRF-Token': csrfToken },
    body: JSON.stringify(productData),
  });
}

async function getLowStocks() {
  return requestJson('http://localhost:5000/app/product/sort/lowStock');
}

async function getPopularProducts() {
  return requestJson('http://localhost:5000/app/product/sort/popular');
}

async function getSalesDate(date) {
  return requestJson('http://localhost:5000/app/sales/date', {
    method: 'POST',
    body: JSON.stringify({ date }),
  });
}

async function getSalesByRange(startDate, endDate) {
  return requestJson('http://localhost:5000/app/sales/range', {
    method: 'POST',
    body: JSON.stringify({ from: startDate, to: endDate }),
  });
}

async function createSales(items) {
  const csrfToken = await getCsrfToken();
  return requestJson('http://localhost:5000/app/sales', {
    method: 'POST',
    headers: { 'X-CSRF-Token': csrfToken },
    body: JSON.stringify({ items }),
  });
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
  createSales,
};