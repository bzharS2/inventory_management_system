require("dotenv").config();
const db = require("../db");

const getProductsController = async (req, res) => {
    try {
        const [result] = await db.query(`SELECT * FROM products`);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ error: `internal server error` })
    }
}
const getProductByBarcode = async (req, res) => {
    const code = req.params.barcode;
    if (!code || code.length > 50) {
        return res.status(400).json({ error: `invalid barcode` })
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
}
const createProductController = async (req, res) => {
    const { name, description, barcode, price, quantity } = req.body;
    if (!name ||
        name.trim() == '' ||
        !description ||
        description.trim() == "" ||
        !barcode ||
        barcode.length > 50 ||
        !price ||
        price == 0 ||
        price < 0 ||
        !quantity ||
        quantity < 1) {
        return res.status(400).json({ error: `invalid values` });
    }
    try {
        const [result] = await db.query(`INSERT INTO products (name,description,barcode,price,quantity) VALUES(?,?,?,?,?)`, [name, description, barcode, price, quantity]);
        if (result.affectedRows == 0) {
            return res.status(400).json({ error: `product didn't get created` });
        }
        return res.status(200).json({ message: `product created successfully` });
    } catch (error) {
        return res.status(500).json({ error: error });
    }
}
const updateProductController = async (req, res) => {
    const id = req.params.id;
    const { name, description, barcode, price, quantity } = req.body;
    if (!name ||
        name.trim() == '' ||
        !description ||
        description.trim() == "" ||
        !barcode ||
        barcode.length > 50 ||
        !price ||
        price == 0 ||
        price < 0 ||
        !quantity ||
        quantity < 1) {
        return res.status(400).json({ error: `invalid values` });
    }
    try {
        const [result] = await db.query(`UPDATE products SET name = ?, description = ?, barcode = ?, price = ?, quantity = ? WHERE id = ?;`,
            [name, description, barcode, price, quantity, id]);
        if (result.affectedRows == 0) {
            return res.status(400).json({ error: `product didn't get update` });
        }
        return res.status(200).json({ message: `product updated successfully` });
    } catch (error) {
        return res.status(500).json({ error: error })
    }
}
const deleteProductController = async (req, res) => {
    const id = req.params.id;
    if (!id || id < 1) {
        return res.status(400).json({ error: `invalid inputs` });
    }
    try {
        const [result] = await db.query(`DELETE FROM products WHERE id= ?`, [id]);
        if (result.affectedRows == 0) {
            return res.status(404).json({ error: `product not found` })
        }
        return res.status(200).json({ message: `product deleted successfully` })
    } catch (error) {
        return res.status(500).json({ error: `internal server error` });
    }
}
const addStockController = async (req, res) => {
    const id = req.params.id;
    const amount = req.body.quantity;
    if (!id || id < 1 || !amount || amount < 1) {
        return res.status(400).json({ error: `invalid values` });
    }
    try {
        const [result] = await db.query(`UPDATE products SET quantity=quantity+? WHERE id=?`, [amount, id]);
        if (result.affectedRows == 0) {
            return res.status(400).json({ error: `stock didn't get added` });
        }
        return res.status(200).json({ message: `stock added successfully` });
    } catch (error) {
        return res.status(500).json({ error: error });
    }
}
const createSalesController = async (req, res) => {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: `invalid type` });
    }

    for (let i = 0; i < items.length; i++) {
        const { id, quantity } = items[i];

        if (!id || id < 1 || !quantity || quantity < 1) {
            return res.status(400).json({ error: `invalid values` });
        }
    }

    const connection = await db.getConnection();
    let totalPrice = 0;

    try {
        await connection.beginTransaction();

        for (let i = 0; i < items.length; i++) {
            const { id, quantity } = items[i];

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
                (product_id, quantity, total_price)
                VALUES (?, ?, ?)`,
                [id, quantity, total]
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
        return res.status(500).json({ error: `internal server error` })
    }
}
const getDashboardController = async (req, res) => {
    try {
        const [result] = await db.query(`
    SELECT
        (SELECT COUNT(*) FROM products) AS products,
        (SELECT SUM(quantity) FROM products) AS total_stock,
        COALESCE((SELECT SUM(total_price) FROM sales), 0) AS total_sales
    `); // COALESCE(IF_NULL,RETURN THIS);

        if (result.length == 0) {
            return res.status(404).json({ error: `no dashboard` });
        }
        return res.status(200).json(result[0]);
    } catch (error) {
        return res.status(500).json({ error: `internal server error` })
    }
}
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
}
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
}
const getSearchByNameController = async (req, res) => {
    const name = req.body.name;
    if (!name || name.trim() == "") {
        return res.status(400).json({ error: `invalid value` });
    }
    try {
        const [result] = await db.query(`SELECT * FROM products WHERE name LIKE ?`, [`%${name}%`]);
        if (result.length == 0) {
            return res.status(200).json({ message: `no items found with that name` });
        }
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ error: `internal server error` });
    }

}
const getSalesByDateController = async (req, res) => {
    const date = req.body.date;
    if (!date || date.trim() == "") {
        return res.status(400).json({ error: `invalid date` })
    }
    try {
        const [result] = await db.query('SELECT products.id,products.name,sales.quantity,sales.total_price,sales.sold_at FROM sales JOIN products ON sales.product_id = products.id WHERE DATE(sales.sold_at) = ?', [date]);

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ error: `internal server error` })
    }
}
const getSalesByRangeController = async (req, res) => {
    const { from, to } = req.body;
    if (!from || !to || from.trim() == "" || to.trim() == "" || new Date(from) > new Date(to)) {
        return res.status(400).json({ error: `invalid values` });
    }

    try {
        const [result] = await db.query('SELECT products.id,products.name,sales.quantity,sales.total_price,sales.sold_at FROM sales JOIN products ON sales.product_id = products.id WHERE sales.sold_at>=? AND sales.sold_at<?', [from, to]);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ error: `internal server error` })
    }
}
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
    getSalesByRangeController
}