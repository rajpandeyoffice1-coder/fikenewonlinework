var express = require('express');
var router = express.Router();
var upload = require('./multer');
var pool = require('./pool')
var table = 'users';
const fs = require("fs");



router.get('/',(req,res)=>{
    if(req.session.adminid){
        res.render('users',{msg:'all'})
    }
    else {
        res.render('admin_login',{msg:'Please Login First'})
    }
  // res.render('category')
    
})


router.get('/active',(req,res)=>{
    if(req.session.adminid){
        res.render('users',{msg:'active1'})
    }
    else {
        res.render('admin_login',{msg:'Please Login First'})
    }
  // res.render('category')
    
})


router.get('/inactive',(req,res)=>{
    if(req.session.adminid){
        res.render('users',{msg:'inactive1'})
    }
    else {
        res.render('admin_login',{msg:'Please Login First'})
    }
  // res.render('category')
    
})


router.post('/storeEditId',(req,res)=>{
    req.session.editStoreId = req.body.id
    res.send('success')
})


router.post('/insert',upload.single('image'),(req,res)=>{
	let body = req.body
    body['image'] = req.file.filename;
	pool.query(`insert into ${table} set ?`,body,(err,result)=>{
		if(err) {
            res.json({
                status:500,
                type : 'error',
                description:err
            })
        }
		else {
            res.json({
                status:200,
                type : 'success',
                description:'successfully added'
            })
            
        }
	})
})



router.get('/all',(req,res)=>{
	pool.query(`select * from ${table} order by id desc `,(err,result)=>{
		if(err) throw err;
        else res.json(result)
	})
})



router.get('/delete', (req, res) => {
    let body = req.body
    pool.query(`delete from ${table} where id = ${req.query.id}`, (err, result) => {
        if(err) {
            res.json({
                status:500,
                type : 'error',
                description:err
            })
        }
        else {
            res.json({
                status:200,
                type : 'success',
                description:'successfully delete'
            })
        }
    })
})


router.post('/update', (req, res) => {
    
    pool.query(`update ${table} set ? where id = ?`, [req.body, req.body.id], (err, result) => {
        console.log(err)
        if(err) {
            res.json({
                status:500,
                type : 'error',
                description:err
            })
        }
        else {
            res.json({
                status:200,
                type : 'success',
                description:'successfully update'
            })

            
        }
    })
})







router.post('/update_image',upload.single('image'), (req, res) => {
    let body = req.body;
    body['image'] = req.file.filename


    pool.query(`select image from ${table} where id = '${req.body.id}'`,(err,result)=>{
        if(err) throw err;
        else {
            fs.unlinkSync(`public/images/${result[0].image}`); 


 pool.query(`update ${table} set ? where id = ?`, [req.body, req.body.id], (err, result) => {
        if(err) {
            res.json({
                status:500,
                type : 'error',
                description:err
            })
        }
        else {
            // res.json({
            //     status:200,
            //     type : 'success',
            //     description:'successfully update'
            // })

            res.redirect('/category')
        }
    })


        }
    })

  
   
})


router.get('/wishlist',(req,res)=>{

    var query9=`select w.*,
    (select p.name from product p where p.id = w.booking_id) as productname,
    (select p.image from product p where p.id = w.booking_id) as productimage,
    (select m.net_amount from product_manage m where m.productid = w.booking_id and m.sizeid = w.size) as productprice,
    (select m.quantity from product_manage m where m.productid = w.booking_id and m.sizeid = w.size) as productquantity,
  
    (select p.categoryid from product p where p.id = w.booking_id) as productcategoryid
  
    from wishlist w where w.usernumber = '${req.query.number}';`
	pool.query(query9,(err,result)=>{
		if(err) throw err;
        // else res.json(result)
        else res.render('show-wishlist',{result:result})
	})
})



router.get('/cart',(req,res)=>{
	pool.query(`select c.* , (select p.name from product p where p.id = c.booking_id) as productname from cart c where c.usernumber = '${req.query.number}' and c.status is null`,(err,result)=>{
		if(err) throw err;
       // else res.json(result)
        else res.render('show-cart',{result:result})
	})
})


router.get('/transacations',(req,res)=>{
	pool.query(`select c.* , (select p.name from product p where p.id = c.booking_id) as productname from cart c where c.usernumber = '${req.query.number}' and c.status is null`,(err,result)=>{
		if(err) throw err;
       // else res.json(result)
        else res.render('show-transacations',{result:result})
	})
})




router.get('/orders',(req,res)=>{
	pool.query(`select  b.* , (select p.name from product p where p.id = b.booking_id) as productname,
    (select u.email from users u where u.id = b.usernumber) as usermobilenumber,
    (select a.address1 from address a where a.id = b.address ) as useraddress1,
    (select a.address2 from address a where a.id = b.address ) as useraddress2,
    (select a.city from address a where a.id = b.address ) as usercity,
    (select a.postcode from address a where a.id = b.address ) as userpostcode,
    (select a.id_state from address a where a.id = b.address ) as userstate,
    (select a.id_country from address a where a.id = b.address ) as usercountry
    
    from booking b where b.usernumber = '${req.query.number}' order by id desc`,(err,result)=>{
		if(err) throw err;
        else res.render('show-orders',{result:result})
	})
})



module.exports = router;