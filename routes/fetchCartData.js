var express = require('express');

var router = express.Router();
var pool = require('./pool')

const fetchCartData = (req, res, next) => {
    const usernumber = req.session.usernumber || req.session.ipaddress;
  
    // Queries to fetch all required data
    const query = `SELECT * FROM category ORDER BY id DESC;`;
    const query1 = `
      SELECT c.*,
        (SELECT p.name FROM product p WHERE p.id = c.booking_id) AS bookingname,
        (SELECT p.image FROM product p WHERE p.id = c.booking_id) AS bookingimage,
        (SELECT p.quantity FROM product_manage p WHERE p.productid = c.booking_id AND p.sizeid = c.size) AS availablequantity
      FROM cart c WHERE c.usernumber = '${usernumber}';
    `;
    const query2 = `SELECT SUM(price) AS totalprice FROM cart WHERE usernumber = '${usernumber}';`;
    const query3 = `SELECT SUM(quantity) AS counter FROM cart WHERE usernumber = '${usernumber}';`;
    const query6 = `SELECT * FROM users WHERE id = '${req.session.usernumber || 84}';`;
    const query7 = `SELECT COUNT(id) AS counter FROM wishlist WHERE usernumber = '${usernumber}';`;
    const query8 = `SELECT SUM(quantity) AS counter FROM cart WHERE usernumber = '${usernumber}';`;
  
    // Combine and execute all queries
    pool.query(query + query1 + query2 + query3 + query6 + query7 + query8, (err, result) => {
      if (err) {
        console.error('Database query error:', err);
        return res.status(500).send('An internal error occurred.');
      }
  
      // Attach results to the req object for use in the route
      req.cartData = {
        categories: result[0],
        cartItems: result[1],
        totalPrice: result[2][0]?.totalprice || 0,
        cartCounter: result[3][0]?.counter || 0,
        userInfo: result[4][0] || null,
        wishlistCounter: result[5][0]?.counter || 0,
        totalQuantity: result[6][0]?.counter || 0,
        shippingCharges: result[2][0]?.totalprice > 500 ? 0 : 500,
      };
  
      // Proceed to the next handler
      next();
    });
  };
  
  module.exports = fetchCartData;
  