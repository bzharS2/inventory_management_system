require("dotenv").config();
const db = require("../db");
const { logActivity } = require("../utils/activityLogger");
const {
    MAX_NAME,
    MAX_DESCRIPTION,
    parsePositiveInt,
    parseId,
    parsePrice,
    parseText,
    parseBarcode,
    parseIsoDate,
    escapeLike,
    isDuplicateKeyError
} = require("../utils/validation");

const getProductsController = async (req, res) => {
    try {
        const [result] = await db.query(`SELECT * FROM products`);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ error: `internal server error` });
    }
};

const getProductByBarcode = async (req, res) => {
    const code = parseBarcode(req.params.barcode);
    if (!code) {
        return res.status(400).json({ error: `invalid barcode` });
    }
    try {
        const [result] = await db.query(`SELECT * FROM products WHERE barcode=?`, [code]);
        if (result.length === 0) {
            return res.status(200).json({ message: `there is no products with that barcode` });
        }
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ error: `internal server error` });
    }
};

const createProductController = async (req, res) => {
    const name = parseText(req.body.name, MAX_NAME);
    const description = parseText(req.body.description, MAX_DESCRIPTION);
    const barcode = parseBarcode(req.body.barcode);
    const initialCost = parsePrice(req.body.initial_cost);
    const price = parsePrice(req.body.price);
    const quantity = parsePositiveInt(req.body.quantity);

    if (
        !name ||
        !description ||
        !barcode ||
        initialCost === null ||
        price === null ||
        quantity === null
    ) {
        return res.status(400).json({ error: `invalid values` });
    }

    try {
        const [result] = await db.query(
            `INSERT INTO products (name,description,barcode,initial_cost,price,quantity) VALUES(?,?,?,?,?,?)`,
            [name, description, barcode, initialCost, price, quantity]
        );
        if (result.affectedRows == 0) {
            return res.status(400).json({ error: `product didn't get created` });
        }

        await logActivity({
            userId: req.user.id,
            action: 'CREATE_PRODUCT',
            targetType: 'product',
            targetId: result.insertId,
            details: `Created product ${name}`,
        });

        return res.status(200).json({ message: `product created successfully` });
    } catch (error) {
        if (isDuplicateKeyError(error)) {
            return res.status(400).json({ error: `barcode already exists` });
        }
        return res.status(500).json({ error: `internal server error` });
    }
};

const updateProductController = async (req, res) => {
    const id = parseId(req.params.id);
    const name = parseText(req.body.name, MAX_NAME);
    const description = parseText(req.body.description, MAX_DESCRIPTION);
    const barcode = parseBarcode(req.body.barcode);
    const initialCost = parsePrice(req.body.initial_cost);
    const price = parsePrice(req.body.price);
    const quantity = parsePositiveInt(req.body.quantity);

    if (
        !id ||
        !name ||
        !description ||
        !barcode ||
        initialCost === null ||
        price === null ||
        quantity === null
    ) {
        return res.status(400).json({ error: `invalid values` });
    }

    try {
        const [result] = await db.query(
            `UPDATE products SET name = ?, description = ?, barcode = ?, initial_cost = ?, price = ?, quantity = ? WHERE id = ?;`,
            [name, description, barcode, initialCost, price, quantity, id]
        );
        if (result.affectedRows == 0) {
            return res.status(400).json({ error: `product didn't get update` });
        }

        await logActivity({
            userId: req.user.id,
            action: 'UPDATE_PRODUCT',
            targetType: 'product',
            targetId: id,
            details: `Updated product ${name}`,
        });

        return res.status(200).json({ message: `product updated successfully` });
    } catch (error) {
        if (isDuplicateKeyError(error)) {
            return res.status(400).json({ error: `barcode already exists` });
        }
        return res.status(500).json({ error: `internal server error` });
    }
};

const deleteProductController = async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) {
        return res.status(400).json({ error: `invalid inputs` });
    }
    try {
        const [result] = await db.query(`DELETE FROM products WHERE id= ?`, [id]);
        if (result.affectedRows == 0) {
            return res.status(404).json({ error: `product not found` });
        }

        await logActivity({
            userId: req.user.id,
            action: 'DELETE_PRODUCT',
            targetType: 'product',
            targetId: id,
            details: 'Deleted product',
        });

        return res.status(200).json({ message: `product deleted successfully` });
    } catch (error) {
        return res.status(500).json({ error: `internal server error` });
    }
};

const addStockController = async (req, res) => {
    const id = parseId(req.params.id);
    const amount = parsePositiveInt(req.body.quantity);
    if (!id || amount === null) {
        return res.status(400).json({ error: `invalid values` });
    }
    try {
        const [result] = await db.query(`UPDATE products SET quantity=quantity+? WHERE id=?`, [amount, id]);
        if (result.affectedRows == 0) {
            return res.status(400).json({ error: `stock didn't get added` });
        }

        await logActivity({
            userId: req.user.id,
            action: 'ADD_STOCK',
            targetType: 'product',
            targetId: id,
            details: `Added ${amount} units to stock`,
        });

        return res.status(200).json({ message: `stock added successfully` });
    } catch (error) {
        return res.status(500).json({ error: `internal server error` });
    }
};

const createSalesController = async (req, res) => {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: `invalid type` });
    }

    const parsedItems = [];
    for (let i = 0; i < items.length; i++) {
        const id = parseId(items[i] && items[i].id);
        const quantity = parsePositiveInt(items[i] && items[i].quantity);

        if (!id || quantity === null) {
            return res.status(400).json({ error: `invalid values` });
        }

        parsedItems.push({ id, quantity });
    }

    const connection = await db.getConnection();
    let totalPrice = 0;

    try {
        await connection.beginTransaction();

        for (let i = 0; i < parsedItems.length; i++) {
            const { id, quantity } = parsedItems[i];

            const [check] = await connection.query(
                `SELECT id, price, quantity
                 FROM products
                 WHERE id = ?
                 FOR UPDATE`,
                [id]
            );

            if (check.length === 0) {
                await connection.rollback();
                return res.status(404).json({ error: `item not found` });
            }

            const price = check[0].price;
            const amount = check[0].quantity;

            if (amount < quantity) {
                await connection.rollback();
                return res.status(400).json({
                    error: `not enough quantity, we only have ${amount} of this item`
                });
            }

            const total = price * quantity;
            totalPrice += total;

            const [result] = await connection.query(
                `INSERT INTO sales
                (product_id, quantity, total_price, user_id)
                VALUES (?, ?, ?, ?)`,
                [id, quantity, total, req.user.id]
            );

            if (result.affectedRows === 0) {
                await connection.rollback();
                return res.status(400).json({
                    error: `sales wasn't created`
                });
            }

            const [update] = await connection.query(
                `UPDATE products
                 SET quantity = quantity - ?
                 WHERE id = ?`,
                [quantity, id]
            );

            if (update.affectedRows === 0) {
                await connection.rollback();
                return res.status(400).json({
                    error: `products table wasn't updated`
                });
            }
        }

        await connection.commit();

        await logActivity({
            userId: req.user.id,
            action: 'CREATE_SALE',
            targetType: 'sale',
            targetId: null,
            details: `Created sale total $${Number(totalPrice).toFixed(2)}`,
        });

        return res.status(200).json({
            message: `sales created successfully`,
            totalPrice: totalPrice
        });
    } catch (error) {
        await connection.rollback();
        return res.status(500).json({
            error: `internal server error`
        });
    } finally {
        connection.release();
    }
};

const getSalesController = async (req, res) => {
    try {
        const [result] = await db.query(`SELECT sales.id, products.name,sales.total_price,sales.quantity,sales.sold_at FROM sales JOIN products ON sales.product_id = products.id`);
        if (result.length == 0) {
            return res.status(404).json({ error: `no sales found` });
        }
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ error: `internal server error` });
    }
};

const getDashboardController = async (req, res) => {
    try {
        const [result] = await db.query(`
    SELECT
        (SELECT COUNT(*) FROM products) AS products,
        (SELECT SUM(quantity) FROM products) AS total_stock,
        COALESCE((SELECT SUM(total_price) FROM sales), 0) AS total_sales
    `);

        if (result.length == 0) {
            return res.status(404).json({ error: `no dashboard` });
        }
        return res.status(200).json(result[0]);
    } catch (error) {
        return res.status(500).json({ error: `internal server error` });
    }
};

const getLowStockController = async (req, res) => {
    try {
        const [result] = await db.query(`SELECT * FROM products WHERE quantity<=5`);
        if (result.length == 0) {
            return res.status(200).json({ message: `no low stocks` });
        }
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ error: `internal server error` });
    }
};

const getSortByPopularController = async (req, res) => {
    try {
        const [result] = await db.query(`SELECT
            products.id,
    products.name,
    SUM(sales.quantity) AS quantity_sold,
    SUM(sales.total_price) AS total_sales
    FROM sales
    JOIN products
    ON sales.product_id = products.id
    GROUP BY products.id, products.name
    ORDER BY quantity_sold DESC;
    `);
        if (result.length == 0) {
            return res.status(404).json({ error: `no sales found` });
        }
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ error: `internal server error` });
    }
};

const getSearchByNameController = async (req, res) => {
    const name = parseText(req.body.name, MAX_NAME);
    if (!name) {
        return res.status(400).json({ error: `invalid value` });
    }
    try {
        const [result] = await db.query(
            `SELECT * FROM products WHERE name LIKE ? ESCAPE '\\\\'`,
            [`%${escapeLike(name)}%`]
        );
        if (result.length == 0) {
            return res.status(200).json({ message: `no items found with that name` });
        }
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ error: `internal server error` });
    }
};

const getSalesByDateController = async (req, res) => {
    const date = parseIsoDate(req.body.date);
    if (!date) {
        return res.status(400).json({ error: `invalid date` });
    }
    try {
        const [result] = await db.query(
            'SELECT products.id,products.name,sales.quantity,sales.total_price,sales.sold_at FROM sales JOIN products ON sales.product_id = products.id WHERE DATE(sales.sold_at) = ?',
            [date]
        );

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ error: `internal server error` });
    }
};

const getSalesByRangeController = async (req, res) => {
    const from = parseIsoDate(req.body.from);
    const to = parseIsoDate(req.body.to);
    if (!from || !to || from > to) {
        return res.status(400).json({ error: `invalid values` });
    }

    try {
        const [result] = await db.query(
            'SELECT products.id,products.name,sales.quantity,sales.total_price,sales.sold_at FROM sales JOIN products ON sales.product_id = products.id WHERE sales.sold_at>=? AND sales.sold_at < DATE_ADD(?, INTERVAL 1 DAY)',
            [from, to]
        );
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ error: `internal server error` });
    }
};

const getActivityLogsController = async (req, res) => {
    try {
        const [result] = await db.query(`
            SELECT a.id, u.username, a.action, a.entity_type, a.entity_id, a.details, a.created_at
            FROM activity_logs a
            LEFT JOIN users u ON a.user_id = u.id
            ORDER BY a.id DESC
            LIMIT 100
        `);
        return res.status(200).json(result);
    } catch (error) {
        console.error('Activity log fetch error:', error);
        return res.status(500).json({ error: 'internal server error' });
    }
};

module.exports = {
    getProductsController,
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
    getSalesByRangeController,
    getActivityLogsController
};
