var express = require('express');
var router = express.Router();
var upload = require('./multer');
var pool = require('./pool');
const fs = require("fs");

var table = 'category';

/* =====================
   CREATE PAGE
===================== */
router.get('/create', (req, res) => {
    if (req.session.adminid) {
        res.render('category');
    } else {
        res.render('admin_login', { msg: 'Please Login First' });
    }
});

/* =====================
   STORE EDIT ID
===================== */
router.post('/storeEditId', (req, res) => {
    req.session.editStoreId = req.body.id;
    res.send('success');
});

/* =====================
   INSERT CATEGORY
===================== */
router.post('/insert', upload.single('image'), (req, res) => {
    let body = req.body;
    body.image = req.file.filename;

    pool.query(
        `SELECT * FROM ${table} WHERE name = ?`,
        [req.body.name],
        (err, result) => {
            if (err) {
                return res.json({ status: 500, description: err });
            }

            if (result.length > 0) {
                return res.json({
                    status: 300,
                    type: 'exists',
                    description: 'Category Already Exists'
                });
            }

            pool.query(
                `INSERT INTO ${table} SET ?`,
                body,
                (err) => {
                    if (err) {
                        return res.json({
                            status: 500,
                            type: 'error',
                            description: err
                        });
                    }

                    res.json({
                        status: 200,
                        type: 'success',
                        description: 'successfully added'
                    });
                }
            );
        }
    );
});

/* =====================
   SHOW ALL CATEGORY ✅
===================== */
router.get('/all', (req, res) => {
    pool.query(`SELECT * FROM ${table} ORDER BY id DESC`, (err, result) => {
        if (err) {
            return res.status(500).json([]);
        }
        res.json(result);
    });
});

/* =====================
   DELETE CATEGORY
===================== */
router.get('/delete', (req, res) => {
    pool.query(
        `DELETE FROM ${table} WHERE id = ?`,
        [req.query.id],
        (err) => {
            if (err) {
                return res.json({
                    status: 500,
                    type: 'error',
                    description: err
                });
            }

            res.json({
                status: 200,
                type: 'success',
                description: 'successfully deleted'
            });
        }
    );
});

/* =====================
   UPDATE CATEGORY
===================== */
router.post('/update', (req, res) => {
    pool.query(
        `SELECT * FROM ${table} WHERE name = ?`,
        [req.body.name],
        (err, result) => {
            if (err) throw err;

            if (result.length && result[0].id != req.body.id) {
                return res.json({
                    status: 300,
                    type: 'exists',
                    description: 'Category Already Exists'
                });
            }

            pool.query(
                `UPDATE ${table} SET ? WHERE id = ?`,
                [req.body, req.body.id],
                (err) => {
                    if (err) throw err;

                    res.json({
                        status: 200,
                        type: 'success',
                        description: 'successfully updated'
                    });
                }
            );
        }
    );
});

/* =====================
   UPDATE IMAGE
===================== */
router.post('/update_image', upload.single('image'), (req, res) => {
    let body = req.body;
    body.image = req.file.filename;

    pool.query(
        `UPDATE ${table} SET ? WHERE id = ?`,
        [body, body.id],
        (err) => {
            if (err) {
                return res.json({
                    status: 500,
                    type: 'error',
                    description: err
                });
            }

            res.redirect('/category/create');
        }
    );
});

module.exports = router;
