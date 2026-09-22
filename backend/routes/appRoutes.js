const express = require('express');
const router = express.Router();
const csurf = require('csurf');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');
const {
  getProductsController,
  getProductByBarcode,
  createProductController,
  updateProductController,
  addStockController,
  createSalesController,
  getSalesController,
  getDashboardController,
  getLowStockController,
  getSortByPopularController,
  getSearchByNameController,
  getSalesByDateController,
  getSalesByRangeController,
  getActivityLogsController,
} = require('../controllers/appControllers');

const csrfProtection = csurf({
  cookie: false,
});

router.get('/products', requireAuth, requireRole(['admin', 'staff']), getProductsController);
router.get('/product/barcode/:barcode', requireAuth, requireRole(['admin', 'staff']), getProductByBarcode);
router.post('/products', requireAuth, requireRole('admin'), csrfProtection, createProductController);
router.put('/product/:id', requireAuth, requireRole('admin'), csrfProtection, updateProductController);
router.patch('/product/:id/stock', requireAuth, requireRole('admin'), csrfProtection, addStockController);
router.get('/product/sort/lowStock', requireAuth, requireRole(['admin', 'staff']), getLowStockController);
router.get('/product/sort/popular', requireAuth, requireRole('admin'), getSortByPopularController);
router.post('/product/name', requireAuth, requireRole(['admin', 'staff']), getSearchByNameController);

router.post('/sales', requireAuth, requireRole(['admin', 'staff']), csrfProtection, createSalesController);
router.get('/sales', requireAuth, requireRole('admin'), getSalesController);
router.post('/sales/date', requireAuth, requireRole('admin'), getSalesByDateController);
router.post('/sales/range', requireAuth, requireRole('admin'), getSalesByRangeController);

router.get('/dashboard', requireAuth, requireRole('admin'), getDashboardController);
router.get('/activity-logs', requireAuth, requireRole('admin'), getActivityLogsController);

module.exports = router;