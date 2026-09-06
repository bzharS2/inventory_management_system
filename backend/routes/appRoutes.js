const express = require("express");
const router = express.Router();
const { getProductsController,
    getProductByBarcode,
    createProductController,
    updateProductController,
    deleteProductController,
    addStockController,
    createSalesController,
    getSalesController,
    getDashboardController,
    getLowStockController,
    getSortByPopularController,
    getSearchByNameController,
    getSalesByDateController,
    getSalesByRangeController
} = require('../controllers/appControllers');


router.get('/products', getProductsController);// done
router.get('/product/barcode/:barcode', getProductByBarcode);//done
router.post('/products', createProductController);//done
router.put('/product/:id', updateProductController);//done
router.delete('/product/:id',deleteProductController);//done
router.patch('/product/:id/stock',addStockController);//done
router.get('/product/sort/lowStock',getLowStockController);//done
router.get('/product/sort/popular',getSortByPopularController);//done
router.post('/product/name',getSearchByNameController);// done


router.post('/sales',createSalesController);
router.get('/sales',getSalesController);// done
router.post('/sales/date',getSalesByDateController);// done
router.post('/sales/range',getSalesByRangeController);// done

router.get('/dashboard',getDashboardController);// done 

module.exports = router;