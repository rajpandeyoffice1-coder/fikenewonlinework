var express = require('express');
var router = express.Router();
var upload = require('./multer');
const util = require("util");
var pool = require('./pool')
queryAsync = util.promisify(pool.query).bind(pool);
const emailTemplates = require('./emailTemplates'); // Email templates
const verify = require('./verify'); 



var table = 'category';
const fs = require("fs");
const fetch = require("node-fetch");
const fetchCartData = require('./fetchCartData');
const deliveryApi = require('./delivery');


var nodemailer = require('nodemailer');


var bcrypt = require('bcryptjs');
const { Console } = require('console');










/* GET home page. */
router.get('/',fetchCartData, function(req, res, next) {
console.log(req.session.usernumber)
   
// req.session.usernumber = null;

 if(req.session.usernumber){
  var query1 = `select * from category;`
  var query2 = `select * from banner;`
  var query3 = `select * from users where usernumber = '${req.session.usernumber}';`
  var query5 = `select p.* ,
  (select m.net_amount from product_manage m where m.productid = p.id) as net_amount,
  (select m.quantity from product_manage m where m.productid = p.id) as quantity

  from product p order by p.id desc limit 9;`
 
  var query6 = `select p.* ,
  (select m.net_amount from product_manage m where m.productid = p.id) as net_amount,
  (select m.quantity from product_manage m where m.productid = p.id) as quantity

  from product p where p.type = 'Most Loved' limit 8;`
  var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.usernumber}';`
  var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.usernumber}';`
  var query9 = `select * from coupon order by id desc limit 1;`
  var query10 = `
  SELECT p.*, 
         m.net_amount, 
         m.discount, 
         m.price, 
         m.quantity
  FROM product p
  INNER JOIN product_manage m ON m.productid = p.id
  WHERE m.discount > 0
  LIMIT 8;
`;



  pool.query(query1+query2+query3+query5+query6+query7+query8+query9+query10,(err,result)=>{
    if(err) throw err;
    else  res.render('index', { title: 'Express',result,login:true,cartData:req.cartData });
  })
 }
 else{
  var query1 = `select * from category;`
  var query2 = `select * from banner;`
  var query3 = `select * from cart where usernumber = '${req.session.ipaddress}';`
  

  var query5 = `select p.* ,
  (select m.net_amount from product_manage m where m.productid = p.id) as net_amount,
  (select m.quantity from product_manage m where m.productid = p.id) as quantity

  from product p order by p.id desc limit 9;`



  var query6 = `select p.* ,
  (select m.net_amount from product_manage m where m.productid = p.id) as net_amount,
  (select m.discount from product_manage m where m.productid = p.id) as discount,
  (select m.price from product_manage m where m.productid = p.id) as price,
  (select m.quantity from product_manage m where m.productid = p.id) as quantity

  from product p where p.type = 'Most Loved' limit 8;`

  var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.ipaddress}';`
  var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.ipaddress}';`
  var query9 = `select * from coupon order by id desc limit 1;`
  var query10 = `
  SELECT p.*, 
         m.net_amount, 
         m.discount, 
         m.price, 
         m.quantity
  FROM product p
  INNER JOIN product_manage m ON m.productid = p.id
  WHERE m.discount > 0
  LIMIT 8;
`;






  pool.query(query1+query2+query3+query5+query6+query7+query8+query9+query10,(err,result)=>{
    // err ? console.log(err) : res.render('index', { title: 'Express',result,login:false });
    if(err) throw err;
    else  res.render('index', { title: 'Express',result,login:false,cartData:req.cartData });
    // res.json(req.cartData)
  })
 }


 
});






router.get('/order-history',(req,res)=>{
  pool.query(`select  b.* , (select p.name from product p where p.id = b.booking_id) as productname,
  (select u.email from users u where u.id = b.usernumber) as usermobilenumber
 
  
  from booking b where b.status =  'completed' order by id desc;`,(err,result)=>{
    if(err) throw err;
    else res.render('show-orders',{result:result})
  })
})




router.get('/running-order',(req,res)=>{
  pool.query(`select  b.* , (select p.name from product p where p.id = b.booking_id) as productname ,
  (select u.email from users u where u.id = b.usernumber) as usermobilenumber
 
  
  from booking b where b.status != 'completed' and b.status != 'Cancel' order by id desc;`,(err,result)=>{
    if(err) throw err;
    else res.render('show-orders',{result:result})
  })
})


router.get('/cancel-order',(req,res)=>{
  pool.query(`select  b.* , (select p.name from product p where p.id = b.booking_id) as productname ,
  (select u.email from users u where u.id = b.usernumber) as usermobilenumber
  
  from booking b where b.status = 'Cancel' order by id desc `,(err,result)=>{
    if(err) throw err;
    else res.render('show-orders',{result:result})
  })
})



router.get('/replacement-order',(req,res)=>{
  pool.query(`select  b.* , (select p.name from product p where p.id = b.booking_id) as productname ,
  (select u.email from users u where u.id = b.usernumber) as usermobilenumber,
  (select r.issue from replacements r where r.order_id = b.id and r.product_id = b.booking_id) as issues,
  (select r.video from replacements r where r.order_id = b.id and r.product_id = b.booking_id) as video
  
  from booking b where b.status = 'replacement' order by id desc `,(err,result)=>{
    if(err) throw err;
    else res.render('replacement-orders',{result:result})
  })
})



router.get('/replacement-accepted-order',(req,res)=>{
  pool.query(`select  b.* , (select p.name from product p where p.id = b.booking_id) as productname ,
  (select u.email from users u where u.id = b.usernumber) as usermobilenumber
  
  from booking b where b.status = 'replacement accept' order by id desc `,(err,result)=>{
    if(err) throw err;
    else res.render('show-orders',{result:result})
  })
})



router.get('/replacement-reject-order',(req,res)=>{
  pool.query(`select  b.* , (select p.name from product p where p.id = b.booking_id) as productname ,
  (select u.email from users u where u.id = b.usernumber) as usermobilenumber
  
  from booking b where b.status = 'replacement reject' order by id desc `,(err,result)=>{
    if(err) throw err;
    else res.render('show-orders',{result:result})
  })
})


router.get('/purchase-report',(req,res)=>{
  pool.query(`select * from cancel_booking order by id desc `,(err,result)=>{
    if(err) throw err;
    else res.render('purchase-report',{result:result})
  })
})






router.get('/sales-report',(req,res)=>{
  pool.query(`select b.*,
  (select u.email from users u where u.id = b.usernumber) as usermobilenumber
  
  from booking b order by id desc `,(err,result)=>{
    if(err) throw err;
    else res.render('sales-report',{result:result})
  })
})


router.get('/stock-report',(req,res)=>{
  pool.query(`select p.* ,
   (select c.name from product c where c.id = p.productid) as categoryname from product_manage p order by quantity `,(err,result)=>{
    if(err) throw err;
    else res.render('sales-report',{result:result})
  })
})


router.get('/shop',(req,res)=>{
// console.log(req.session.usernumber)
if(req.session.usernumber){
  var query = `select * from category order by id desc;`
  var query1 = `select p.* ,
  (select m.net_amount from product_manage m where m.productid = p.id and m.sizeid = 'S') as net_amount,
  (select m.quantity from product_manage m where m.productid = p.id and m.sizeid = 'S') as quantity

  from product p where p.categoryid = '${req.query.id}' and (select m.net_amount from product_manage m where m.productid = p.id and m.sizeid = 'S') is not null;`
  var query2 = `select * from category where id = '${req.query.id}';`
  var query6 = `select * from users where usernumber = '${req.session.usernumber}';`
    var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.usernumber}';`
    var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.usernumber}';`
    var query9 = `select * from wishlist_name where usernumber = '${req.session.usernumber}';`


  pool.query(query+query1+query2+query6+query7+query8+query9,(err,result)=>{
    if(err) throw err;
    // else res.json(result)
    else if(result[1][0]) res.render('shop',{result:result,login:true,title:result[2][0].name})
    else  res.render('shop',{result,login:true,title:result[2][0].name})
  })
}
else{
  var query = `select * from category order by id desc;`
  var query1 = `select p.* ,
  (select m.net_amount from product_manage m where m.productid = p.id and m.sizeid = 'S') as net_amount,
  (select m.quantity from product_manage m where m.productid = p.id and m.sizeid = 'S') as quantity

  from product p where p.categoryid = '${req.query.id}' and (select m.net_amount from product_manage m where m.productid = p.id and m.sizeid = 'S') is not null;`
  
  var query2 = `select * from category where id = '${req.query.id}';`
  var query6 = `select * from users where id = '84';`
    var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.ipaddress}';`
    var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.ipaddress}';`
    var query9 = `select * from wishlist_name where usernumber = '${req.session.usernumber}';`


  pool.query(query+query1+query2+query6+query7+query8+query9,(err,result)=>{
     if(err) throw err;
    else if(result[1][0]) res.render('shop',{result:result,login:false,title:result[2][0].name})
    else  res.render('shop',{result,login:false,title:result[2][0].name})
  })
}

  
 
})



router.get('/shop/all-collections',(req,res)=>{

  if(req.session.usernumber){
    var query = `select * from category order by id desc;`
    var query1 = `select p.* ,
    (select m.net_amount from product_manage m where m.productid = p.id and m.sizeid = 'S') as net_amount,
    (select m.quantity from product_manage m where m.productid = p.id and m.sizeid = 'S') as quantity
  
    from product p where (select m.net_amount from product_manage m where m.productid = p.id and m.sizeid = 'S') is not null;`
    
   
    var query2 = `select * from category where id = '${req.query.id}';`
    var query6 = `select * from users where usernumber = '${req.session.usernumber}';`
    var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.usernumber}';`
    var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.usernumber}';`
    var query9 = `select * from wishlist_name where usernumber = '${req.session.usernumber}';`

  
    pool.query(query+query1+query2+query6+query7+query8+query9,(err,result)=>{
      if(err) throw err;
      else if(result[1][0]) res.render('all-shop',{result:result,login:true,title:'All Collections'})
      else  res.render('all-shop',{result,login:true,title:'All Collections'})
    })
  }
  else{
    var query = `select * from category order by id desc;`
    var query1 = `select p.* ,
    (select m.net_amount from product_manage m where m.productid = p.id and m.sizeid = 'S') as net_amount,
    (select m.quantity from product_manage m where m.productid = p.id and m.sizeid = 'S') as quantity
  
    from product p where (select m.net_amount from product_manage m where m.productid = p.id and m.sizeid = 'S') is not null;`
    
    var query2 = `select * from category where id = '${req.query.id}';`
    var query6 = `select * from users where id = '84';`
    var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.ipaddress}';`
    var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.ipaddress}';`
    var query9 = `select * from wishlist_name where usernumber = '${req.session.usernumber}';`


    pool.query(query+query1+query2+query6+query7+query8+query9,(err,result)=>{
       if(err) throw err;
      else if(result[1][0]) res.render('all-shop',{result:result,login:false,title:'All Collections'})
      else  res.render('all-shop',{result,login:false,title:'All Collections'})
    })
  }
  
    
   
  })




  router.get('/search',fetchCartData,(req,res)=>{

    if(req.session.usernumber){
      var query = `select * from category order by id desc;`
      var query1 = `SELECT p.*,
      (SELECT m.net_amount FROM product_manage m WHERE m.productid = p.id) AS net_amount,
      (SELECT m.quantity FROM product_manage m WHERE m.productid = p.id) AS quantity,
      (SELECT m.price FROM product_manage m WHERE m.productid = p.id) AS price,
      (SELECT m.discount FROM product_manage m WHERE m.productid = p.id) AS discount
    FROM product p
    WHERE (p.name LIKE '%${req.query.q}%' OR p.description LIKE '%${req.query.q}%')
    AND (SELECT m.net_amount FROM product_manage m WHERE m.productid = p.id) IS NOT NULL
    ORDER BY p.id DESC;
  `;
    var query2 = `SELECT * FROM category WHERE name LIKE '%${req.query.q}%';`;
      var query6 = `select * from users where usernumber = '${req.session.usernumber}';`
    var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.usernumber}';`
    var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.usernumber}';`
    var query9 = `select * from wishlist_name where usernumber = '${req.session.usernumber}';`

    
      pool.query(query+query1+query2+query6+query7+query8+query9,(err,result)=>{
        if(err) throw err;
        else if(result[1][0]) res.render('all-shop',{result:result,login:true,title:'Most Loved',cartData:req.cartData,q:'search'})
        else  res.render('all-shop',{result,login:true,title:'Most Loved',cartData:req.cartData,q:'search'})
      })
    }
    else{
      var query = `select * from category order by id desc;`
      var query1 = `SELECT p.*,
        (SELECT m.net_amount FROM product_manage m WHERE m.productid = p.id) AS net_amount,
        (SELECT m.quantity FROM product_manage m WHERE m.productid = p.id) AS quantity,
        (SELECT m.price FROM product_manage m WHERE m.productid = p.id) AS price,
        (SELECT m.discount FROM product_manage m WHERE m.productid = p.id) AS discount
      FROM product p
      WHERE (p.name LIKE '%${req.query.q}%' OR p.description LIKE '%${req.query.q}%')
      AND (SELECT m.net_amount FROM product_manage m WHERE m.productid = p.id) IS NOT NULL
      ORDER BY p.id DESC;
    `;
      var query2 = `SELECT * FROM category WHERE name LIKE '%${req.query.q}%';`;
      var query6 = `select * from users where id =  'null';`
    var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.ipaddress}';`
    var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.ipaddress}';`
    var query9 = `select * from wishlist_name where usernumber = '${req.session.usernumber}';`

    
      pool.query(query+query1+query2+query6+query7+query8+query9,(err,result)=>{
         if(err) throw err;
        else if(result[1][0]) res.render('all-shop',{result:result,login:false,title:'Most Loved',cartData:req.cartData,q:'search'})
        else  res.render('all-shop',{result,login:false,title:'Most Loved',cartData:req.cartData,q:'search'})
      })
    }
    
      
     
    })


  router.get('/category',fetchCartData,(req,res)=>{

    if(req.session.usernumber){
      var query = `select * from category order by id desc;`
      var query1 = `select p.* ,
      (select m.net_amount from product_manage m where m.productid = p.id) as net_amount,
      (select m.quantity from product_manage m where m.productid = p.id) as quantity,
      (select m.price from product_manage m where m.productid = p.id) as price,
      (select m.discount from product_manage m where m.productid = p.id) as discount

    
      from product p where p.categoryid = '${req.query.id}' and (select m.net_amount from product_manage m where m.productid = p.id) is not null order by p.id desc;`
     
 
      var query2 = `select * from category where id = '${req.query.id}';`
      var query6 = `select * from users where usernumber = '${req.session.usernumber}';`
    var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.usernumber}';`
    var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.usernumber}';`
    var query9 = `select * from wishlist_name where usernumber = '${req.session.usernumber}';`

    
      pool.query(query+query1+query2+query6+query7+query8+query9,(err,result)=>{
        if(err) throw err;
        else if(result[1][0]) res.render('all-shop',{result:result,login:true,title:'Most Loved',cartData:req.cartData})
        else  res.render('all-shop',{result,login:true,title:'Most Loved',cartData:req.cartData})
      })
    }
    else{
      var query = `select * from category order by id desc;`
      var query1 = `select p.* ,
      (select m.net_amount from product_manage m where m.productid = p.id) as net_amount,
      (select m.quantity from product_manage m where m.productid = p.id) as quantity,
      (select m.price from product_manage m where m.productid = p.id) as price,
      (select m.discount from product_manage m where m.productid = p.id) as discount

    
      from product p where p.categoryid = '${req.query.id}' and (select m.net_amount from product_manage m where m.productid = p.id) is not null order by p.id desc;`
     
      var query2 = `select * from category where id = '${req.query.id}';`
      var query6 = `select * from users where id =  'null';`
    var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.ipaddress}';`
    var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.ipaddress}';`
    var query9 = `select * from wishlist_name where usernumber = '${req.session.usernumber}';`

    
      pool.query(query+query1+query2+query6+query7+query8+query9,(err,result)=>{
         if(err) throw err;
        else if(result[1][0]) res.render('all-shop',{result:result,login:false,title:'Most Loved',cartData:req.cartData})
        else  res.render('all-shop',{result,login:false,title:'Most Loved',cartData:req.cartData})
      })
    }
    
      
     
    })




   

    



router.get('/shop/subcategory',(req,res)=>{

 pool.query(`select categoryid from subcategory where id = '${req.query.id}'`,(err,result)=>{
   if(err) throw err;
   else {
     let categoryid = result[0].categoryid

     if(req.session.usernumber){
      var query = `select * from category order by id desc;`
      var query1 = `select * from product where subcategoryid = '${req.query.id}';`
      var query2 =  `select * from subcategory where categoryid = '${categoryid}';`
    
      pool.query(query+query1+query2,(err,result)=>{
        if(err) throw err;
        else if(result[1][0]) res.render('shop',{result:result,login:true})
        else  res.render('not_found',{result,login:true})
      })
    }
    else{
      var query = `select * from category order by id desc;`
      var query1 = `select * from product where subcategoryid = '${req.query.id}';`
      var query2 =  `select * from subcategory where categoryid = '${categoryid}';`
      pool.query(query+query1+query2,(err,result)=>{
        if(err) throw err;
        else if(result[1][0]) res.render('shop',{result:result,login:false})
        else  res.render('not_found',{result,login:false})
      })
    }
   }
 })
  })


  const he = require('he');



router.get('/product',fetchCartData,(req,res)=>{
// req.session.usernumber = 85
  pool.query(`select categoryid from product where id = '${req.query.id}'`,(err,result)=>{
  if(err) throw err;
  else if(result[0]) {
    let categoryid = result[0].categoryid
  if(req.session.usernumber){
      var query = `select * from category order by id desc;`

      var query1 = `select p.* ,
      (select m.net_amount from product_manage m where m.productid = p.id) as net_amount,
      (select m.quantity from product_manage m where m.productid = p.id) as quantity,
       (select m.price from product_manage m where m.productid = p.id) as price,
      (select m.discount from product_manage m where m.productid = p.id) as discount
      from product p where p.id = '${req.query.id}' ;`
     

      var query2 = `select p.* ,
      (select m.net_amount from product_manage m where m.productid = p.id) as net_amount,
      (select m.quantity from product_manage m where m.productid = p.id) as quantity,
      (select m.price from product_manage m where m.productid = p.id) as price,
      (select m.discount from product_manage m where m.productid = p.id) as discount


      from product p where p.categoryid = '${categoryid}' and p.id!= '${req.query.id}' and (select m.net_amount from product_manage m where m.productid = p.id) is not null order by id limit 8;`
     
     var query6 = `select * from users where usernumber = '${req.session.usernumber}';`
     var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.usernumber}';`
     var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.usernumber}';`
     var query9 = `select * from wishlist_name where usernumber = '${req.session.usernumber}';`
     var query10 = `select * from product_manage where productid = '${req.query.id}';`
     var query11 = `select * from productimages where productid = '${req.query.id}';`
     var query12 = `SELECT r.* , (select b.name from booking b where b.orderid = r.order_id order by id desc limit 1) as username FROM reviews r WHERE r.product_id = '${req.query.id}' order by id desc;`;
     var query13 = `SELECT AVG(rating) AS average_rating FROM reviews WHERE product_id = '${req.query.id}';`;
     var query14 = `SELECT rating, COUNT(rating) AS count FROM reviews WHERE product_id = '${req.query.id}' GROUP BY rating ORDER BY rating ASC;`;
       pool.query(query+query1+query2+query6+query7+query8+query9+query10+query11+query12+query13+query14,(err,result)=>{
        if(err) throw err;
        else{
          let decodedDescription = he.decode(result[1][0].description);
          let shortDecodeDescription = he.decode(result[1][0].short_description);
          let ratingsData = {};
          let totalReviews = 0;
      
          // Process result[14] which contains the rating counts
          if (result[11] && result[11].length > 0) {
              result[11].forEach(row => {
                  ratingsData[row.rating] = row.count;
                  totalReviews += row.count;
              });
          }
      
          // Calculate percentage for each star rating (1-5)
          let ratingsPercentages = {};
          for (let i = 1; i <= 5; i++) {
              ratingsPercentages[i] = totalReviews > 0 ? (ratingsData[i] || 0) / totalReviews * 100 : 0;
          }


          res.render('view-product', {
            title: 'Express',
            login: true,
            result: result,
            sizerequest: req.query.size,
            title: result[1][0].name,
            cartData: req.cartData,
            ratingsData: ratingsData,
            ratingsPercentages: ratingsPercentages,
            totalReviews: totalReviews,
            decodedDescription:decodedDescription,
            shortDecodeDescription:shortDecodeDescription
        });

        } 
      })
      
  
    }
    else{
      var query = `select * from category order by id desc;`
    

      var query1 = `select p.* ,
      (select m.net_amount from product_manage m where m.productid = p.id) as net_amount,
      (select m.quantity from product_manage m where m.productid = p.id) as quantity,
       (select m.price from product_manage m where m.productid = p.id) as price,
      (select m.discount from product_manage m where m.productid = p.id) as discount
      from product p where p.id = '${req.query.id}' ;`
     

      var query2 = `select p.* ,
      (select m.net_amount from product_manage m where m.productid = p.id) as net_amount,
      (select m.quantity from product_manage m where m.productid = p.id) as quantity,
       (select m.price from product_manage m where m.productid = p.id) as price,
      (select m.discount from product_manage m where m.productid = p.id) as discount

       from product p where p.id!= '${req.query.id}' and (select m.net_amount from product_manage m where m.productid = p.id) is not null order by id limit 8;`

     var query6 = `select * from users where id = '84';`
     var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.ipaddress}';`
     var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.ipaddress}';`
     var query9 = `select * from wishlist_name where usernumber = '${req.session.ipaddress}';`
     var query10 = `select * from product_manage where productid = '${req.query.id}';`
     var query11 = `select * from productimages where productid = '${req.query.id}';`
     var query12 = `SELECT r.* , (select b.name from booking b where b.orderid = r.order_id order by id desc limit 1) as username FROM reviews r WHERE r.product_id = '${req.query.id}' order by id desc;`;

     var query13 = `SELECT AVG(rating) AS average_rating FROM reviews WHERE product_id = '${req.query.id}';`;
     var query14 = `SELECT rating, COUNT(rating) AS count FROM reviews WHERE product_id = '${req.query.id}' GROUP BY rating ORDER BY rating ASC;`;
     

      pool.query(query+query1+query2+query6+query7+query8+query9+query10+query11+query12+query13+query14,(err,result)=>{
        if(err) throw err;
        else{

          let decodedDescription = he.decode(result[1][0].description);
          let shortDecodeDescription = he.decode(result[1][0].short_description);
          let ratingsData = {};
          let totalReviews = 0;
      
          // Process result[14] which contains the rating counts
          if (result[11] && result[11].length > 0) {
              result[11].forEach(row => {
                  ratingsData[row.rating] = row.count;
                  totalReviews += row.count;
              });
          }
      
          // Calculate percentage for each star rating (1-5)
          let ratingsPercentages = {};
          for (let i = 1; i <= 5; i++) {
              ratingsPercentages[i] = totalReviews > 0 ? (ratingsData[i] || 0) / totalReviews * 100 : 0;
          }


          res.render('view-product', {
            title: 'Express',
            login: true,
            result: result,
            sizerequest: req.query.size,
            title: result[1][0].name,
            cartData: req.cartData,
            ratingsData: ratingsData,
            ratingsPercentages: ratingsPercentages,
            totalReviews: totalReviews,
            decodedDescription:decodedDescription,
            shortDecodeDescription:shortDecodeDescription
        });

        } 

      })
  
    }

  }
  else {
    res.render('view-product')
  }
})


})




router.post('/mycart',(req,res)=>{
  res.json({msg:'success'})
})



router.post("/cart-handler", (req, res) => {
  let body = req.query
console.log('usern ka number',req.body)

if(req.session.usernumber || req.session.usernumber!= undefined){
  body['usernumber'] = req.session.usernumber;

  console.log(req.query)
  if (req.query.quantity == "0" || req.query.quantity == 0) {
  pool.query(`delete from cart where booking_id = '${req.query.booking_id}' and  usernumber = '${req.session.usernumber}' and status is null`,(err,result)=>{
      if (err) throw err;
      else {
        res.json({
          msg: "updated sucessfully",
        });
      }
  })
  }
  else {
      pool.query(`select oneprice from cart where booking_id = '${req.query.booking_id}' and  categoryid = '${req.query.categoryid}' and usernumber = '${req.session.usernumber}' and status is null`,(err,result)=>{
          if (err) throw err;
          else if (result[0]) {
             // res.json(result[0])
              pool.query(`update cart set quantity = ${req.query.quantity} , price = ${result[0].oneprice}*${req.query.quantity}  where booking_id = '${req.query.booking_id}' and categoryid = '${req.query.categoryid}' and usernumber = '${req.session.usernumber}'`,(err,result)=>{
                  if (err) throw err;
                  else {
                    console.log('h')
                    //  res.redirect('/mycart')
                    var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.usernumber}';`
                    var query8 = `select sum(price) as counter from cart where usernumber = '${req.session.usernumber}';`
                    pool.query(query7+query8,(err,result)=>{
                      if(err) throw err;
                      else res.json(result)
                    })
                    // res.json({msg:'su'})
                    }

              })
          }
          else {
            body["price"] = (req.query.price)*(req.query.quantity)
               pool.query(`insert into cart set ?`, body, (err, result) => {
               if (err) throw err;
               else {
                var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.usernumber}';`
                var query8 = `select sum(price) as counter from cart where usernumber = '${req.session.usernumber}';`
                pool.query(query7+query8,(err,result)=>{
                  if(err) throw err;
                  else res.json(result)
                })
               }
             });

          }

      })
  }
}
else {



    body['usernumber'] = req.session.ipaddress;

    
    if (req.query.quantity == "0" || req.query.quantity == 0) {
    pool.query(`delete from cart where booking_id = '${req.query.booking_id}' and  usernumber = '${req.session.ipaddress}' and status is null`,(err,result)=>{
        if (err) throw err;
        else {
          res.json({
            msg: "updated sucessfully",
          });
        }
    })
    }
    else {
        pool.query(`select oneprice from cart where booking_id = '${req.query.booking_id}' and  categoryid = '${req.query.categoryid}' and usernumber = '${req.session.ipaddress}' and status is null`,(err,result)=>{
            if (err) throw err;
            else if (result[0]) {
               // res.json(result[0])
                pool.query(`update cart set quantity = ${req.query.quantity} , price = ${result[0].oneprice}*${req.query.quantity}  where booking_id = '${req.query.booking_id}' and categoryid = '${req.query.categoryid}' and usernumber = '${req.session.ipaddress}'`,(err,result)=>{
                    if (err) throw err;
                    else {
                      var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.ipaddress}';`
                      var query8 = `select sum(price) as counter from cart where usernumber = '${req.session.ipaddress}';`
                      pool.query(query7+query8,(err,result)=>{
                        if(err) throw err;
                        else res.json(result)
                      })
                      }
  
                })
            }
            else {
              console.log(result)
              body["price"] = (req.query.price)*(req.query.quantity)
                 pool.query(`insert into cart set ?`, body, (err, result) => {
                 if (err) throw err;
                 else {
                  var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.ipaddress}';`
                  var query8 = `select sum(price) as counter from cart where usernumber = '${req.session.ipaddress}';`
                  pool.query(query7+query8,(err,result)=>{
                    if(err) throw err;
                    else res.json(result)
                  })
                 }
               });
  
            }
  
        })
    }
  


 
 


 

}



})


// router.post("/cart-handler1", (req, res) => {
//   let body = req.body
// console.log('usern ka number',req.session.ipaddress)

// if(req.session.usernumber || req.session.usernumber!= undefined){
//   body['usernumber'] = req.session.usernumber;

//   console.log(req.body)
//   if (req.body.quantity == "0" || req.body.quantity == 0) {
//   pool.query(`delete from cart where booking_id = '${req.body.booking_id}' and  usernumber = '${req.body.usernumber}' and size='${req.body.size}' and status is null`,(err,result)=>{
//       if (err) throw err;
//       else {
//         res.json({
//           msg: "updated sucessfully",
//         });
//       }
//   })
//   }
//   else {
//       pool.query(`select oneprice from cart where booking_id = '${req.body.booking_id}' and  categoryid = '${req.body.categoryid}' and usernumber = '${req.body.usernumber}' and size='${req.body.size}' and status is null`,(err,result)=>{
//           if (err) throw err;
//           else if (result[0]) {
//             console.log(result[0])
//               pool.query(`update cart set quantity = ${req.body.quantity} , price = ${result[0].oneprice}*${req.body.quantity}  where booking_id = '${req.body.booking_id}' and categoryid = '${req.body.categoryid}' and usernumber = '${req.body.usernumber}' and size='${req.body.size}'`,(err,result)=>{
//                   if (err) throw err;
//                   else {
//                     var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.usernumber}';`
//                     var query8 = `select sum(price) as counter from cart where usernumber = '${req.session.usernumber}';`
//                     pool.query(query7+query8,(err,result)=>{
//                       if(err) throw err;
//                       else res.json(result)
//                     })
//                     }

//               })
//           }
//           else {
//             body["price"] = (req.body.price)*(req.body.quantity)
//                pool.query(`insert into cart set ?`, body, (err, result) => {
//                if (err) throw err;
//                else {
//                 var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.usernumber}';`
//                     var query8 = `select sum(price) as counter from cart where usernumber = '${req.session.usernumber}';`
//                     pool.query(query7+query8,(err,result)=>{
//                       if(err) throw err;
//                       else res.json(result)
//                     })
//                }
//              });

//           }

//       })
//   }
// }
// else {



//   if(req.session.ipaddress){
//     body['usernumber'] = req.session.ipaddress;

//     console.log(req.body)
//     if (req.body.quantity == "0" || req.body.quantity == 0) {
//     pool.query(`delete from cart where booking_id = '${req.body.booking_id}' and  usernumber = '${req.body.usernumber}' and size='${req.body.size}' and status is null`,(err,result)=>{
//         if (err) throw err;
//         else {
//           res.json({
//             msg: "updated sucessfully",
//           });
//         }
//     })
//     }
//     else {
//         pool.query(`select oneprice from cart where booking_id = '${req.body.booking_id}' and  categoryid = '${req.body.categoryid}' and usernumber = '${req.body.usernumber}' and size='${req.body.size}' and status is null`,(err,result)=>{
//             if (err) throw err;
//             else if (result[0]) {
//                // res.json(result[0])
//                 pool.query(`update cart set quantity = ${req.body.quantity} , price = ${result[0].oneprice}*${req.body.quantity}  where booking_id = '${req.body.booking_id}' and categoryid = '${req.body.categoryid}' and usernumber = '${req.body.usernumber}' and size='${req.body.size}'`,(err,result)=>{
//                     if (err) throw err;
//                     else {
//                       var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.ipaddress}';`
//                       var query8 = `select sum(price) as counter from cart where usernumber = '${req.session.ipaddress}';`
//                       pool.query(query7+query8,(err,result)=>{
//                         if(err) throw err;
//                         else res.json(result)
//                       })
//                       }
  
//                 })
//             }
//             else {
//               body["price"] = (req.body.price)*(req.body.quantity)
//                  pool.query(`insert into cart set ?`, body, (err, result) => {
//                  if (err) throw err;
//                  else {
//                   var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.ipaddress}';`
//                       var query8 = `select sum(price) as counter from cart where usernumber = '${req.session.ipaddress}';`
//                       pool.query(query7+query8,(err,result)=>{
//                         if(err) throw err;
//                         else res.json(result)
//                       })
//                  }
//                });
  
//             }
  
//         })
//     }
  


//   }

//   else {

//     var otp =   Math.floor(100000 + Math.random() * 9000);
//     req.session.ipaddress = otp;
//     body['usernumber'] = otp;
//     console.log(req.body)
//     if (req.body.quantity == "0" || req.body.quantity == 0) {
//     pool.query(`delete from cart where booking_id = '${req.body.booking_id}' and  usernumber = '${req.body.usernumber}' and size='${req.body.size}' and status is null`,(err,result)=>{
//         if (err) throw err;
//         else {
//           res.json({
//             msg: "updated sucessfully",
//           });
//         }
//     })
//     }
//     else {
//         pool.query(`select oneprice from cart where booking_id = '${req.body.booking_id}' and  categoryid = '${req.body.categoryid}' and usernumber = '${req.body.usernumber}' and size='${req.body.size}' and status is null`,(err,result)=>{
//             if (err) throw err;
//             else if (result[0]) {
//                // res.json(result[0])
//                 pool.query(`update cart set quantity = ${req.body.quantity} , price = ${result[0].oneprice}*${req.body.quantity}  where booking_id = '${req.body.booking_id}' and categoryid = '${req.body.categoryid}' and usernumber = '${req.body.usernumber}' and size='${req.body.size}'`,(err,result)=>{
//                     if (err) throw err;
//                     else {
//                       var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.ipaddress}';`
//                       var query8 = `select sum(price) as counter from cart where usernumber = '${req.session.ipaddress}';`
//                       pool.query(query7+query8,(err,result)=>{
//                         if(err) throw err;
//                         else res.json(result)
//                       })
//                       }
  
//                 })
//             }
//             else {
//               body["price"] = (req.body.price)*(req.body.quantity)
//                  pool.query(`insert into cart set ?`, body, (err, result) => {
//                  if (err) throw err;
//                  else {
//                   var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.ipaddress}';`
//                       var query8 = `select sum(price) as counter from cart where usernumber = '${req.session.ipaddress}';`
//                       pool.query(query7+query8,(err,result)=>{
//                         if(err) throw err;
//                         else res.json(result)
//                       })
//                  }
//                });
  
//             }
  
//         })
//     }
  


//   }


 

// }



// })



router.post("/cart-handler1", (req, res) => {
  let body = req.body;
  console.log("User session IP:", req.session.ipaddress);

  const fetchProductDetails = (booking_id, callback) => {
    const query = `
      SELECT p.categoryid, pm.net_amount
      FROM product p
      LEFT JOIN product_manage pm ON p.id = pm.productid
      WHERE p.id = '${booking_id}'
    `;

    pool.query(query, (err, result) => {
      if (err) return callback(err);
      if (result.length === 0) return callback("Product not found");
      callback(null, result[0]);
    });
  };

  const handleCartOperation = (usernumber) => {
    body["usernumber"] = usernumber;
    body["size"] = "free"; // Fixed size

    if (body.quantity == "0" || body.quantity == 0) {
      // Delete item from cart
      pool.query(
        `DELETE FROM cart 
         WHERE booking_id = '${body.booking_id}' AND usernumber = '${usernumber}' AND size = 'free' AND status IS NULL`,
        (err) => {
          if (err) throw err;
          res.json({ msg: "Deleted successfully" });
        }
      );
    } else {
      // Check if item exists in cart
      pool.query(
        `SELECT oneprice FROM cart 
         WHERE booking_id = '${body.booking_id}' AND usernumber = '${usernumber}' AND size = 'free' AND status IS NULL`,
        (err, result) => {
          if (err) throw err;
          if (result[0]) {
            // Update cart
            console.log('body',result[0])

            pool.query(
              `UPDATE cart 
               SET quantity = ${body.quantity}, price = ${result[0].oneprice} * ${body.quantity}
               WHERE booking_id = '${body.booking_id}' AND usernumber = '${usernumber}' AND size = 'free'`,
              (err) => {
                if (err) throw err;
                fetchCartTotals(usernumber);
              }
            );
          } else {
            // Insert into cart
            body["price"] = body["net_amount"] * body["quantity"];
            body["oneprice"] = body["net_amount"];
            console.log('body',body)
            pool.query(`INSERT INTO cart SET ?`, body, (err) => {
              if (err) throw err;
              fetchCartTotals(usernumber);
            });
          }
        }
      );
    }
  };

  const fetchCartTotals = (usernumber) => {
    const query7 = `SELECT SUM(quantity) AS counter FROM cart WHERE usernumber = '${usernumber}';`;
    const query8 = `SELECT SUM(price) AS counter FROM cart WHERE usernumber = '${usernumber}';`;
    pool.query(query7 + query8, (err, result) => {
      if (err) throw err;
      res.json(result);
    });
  };

  // Main logic starts here
  fetchProductDetails(body.booking_id, (err, productDetails) => {
    if (err) return res.status(500).json({ error: err });

    // Add fetched product details to request body
    body["categoryid"] = productDetails.categoryid;
    body["net_amount"] = productDetails.net_amount;

    if (req.session.usernumber) {
      handleCartOperation(req.session.usernumber);
    } else if (req.session.ipaddress) {
      handleCartOperation(req.session.ipaddress);
    } else {
      // Generate random OTP for guest user
      const otp = Math.floor(100000 + Math.random() * 9000);
      req.session.ipaddress = otp;
      handleCartOperation(otp);
    }
  });
});





router.get('/mycart',fetchCartData,(req,res)=>{

 console.log(req.session.ipaddress)

  if(req.session.usernumber){
    var query = `select * from category order by id desc;`
    var query1 = `select c.* , 
    (select p.name from product p where p.id = c.booking_id) as bookingname,
    (select p.image from product p where p.id = c.booking_id) as bookingimage,
    (select p.quantity from product_manage p where p.productid = c.booking_id and p.sizeid = c.size) as availablequantity
    

    
     from cart c where c.usernumber = '${req.session.usernumber}';`
   var query2 = `select sum(price) as totalprice from cart where usernumber = '${req.session.usernumber}';`   
   var query3 = `select sum(quantity) as counter from cart where usernumber = '${req.session.usernumber}';`   
   var query6 = `select * from users where usernumber = '${req.session.usernumber}';`
   var query7 = `select count(id) as counter from wishlist where usernumber = '${req.session.usernumber}';`
   var query8 = `select sum(quantity) as counter from cart where usernumber = '${req.session.usernumber}';`           



    pool.query(query+query1+query2+query3+query6+query7+query8,(err,result)=>{
      if(err) throw err;
      else if(!result[1][0]){
        res.render('cart',{result,login:true,searchname:req.query.search_query,title:'My Cart',cartData:req.cartData})

      }
      else{
if(result[2][0].totalprice > 500) {
  res.render('cart', { title: 'Cart',login:true,result , shipping_charges : 0 ,cartData:req.cartData });

}
else if(result[1][0]) {
  res.render('cart', { title: 'Cart',login:true,result , shipping_charges : 500,cartData:req.cartData });

}

   
      }
   
   
       })

  }
  else{
    var query = `select * from category order by id desc;`
    var query1 = `select c.* , 
    (select p.name from product p where p.id = c.booking_id) as bookingname,
    (select p.image from product p where p.id = c.booking_id) as bookingimage,
    (select p.quantity from product_manage p where p.productid = c.booking_id and p.sizeid = c.size) as availablequantity


    
     from cart c where c.usernumber = '${req.session.ipaddress}';`
   var query2 = `select sum(price) as totalprice from cart where usernumber = '${req.session.ipaddress}' ;`              
   var query3 = `select sum(quantity) as counter from cart where usernumber = '${req.session.ipaddress}';`
   var query6 = `select * from users where id = '84';`
   var query7 = `select count(id) as counter from wishlist where usernumber = '${req.session.ipaddress}';`
   var query8 = `select sum(quantity) as counter from cart where usernumber = '${req.session.ipaddress}';`              

    pool.query(query+query1+query2+query3+query6+query7+query8,(err,result)=>{
      if(err) throw err;
      else if(!result[1][0]){
        res.render('cart',{result,login:true,searchname:req.query.search_query,title:'My Cart',cartData:req.cartData})

      }
      else{
     

        if(result[2][0].totalprice > 500) {
          res.render('cart', { title: 'Cart',login:false,result , shipping_charges : 0,cartData:req.cartData });
        
        }
        else {
          res.render('cart', { title: 'Cart',login:false,result , shipping_charges : 500 ,cartData:req.cartData});
        
        }
        
   
      }
   
   
       })

  }
})





router.get('/delete',(req,res)=>{
  if(req.session.usernumber){
  pool.query(`delete from cart where id = '${req.query.id}' and usernumber = '${req.session.usernumber}'`,(err,result)=>{
  if(err) throw err;
  else res.redirect('/mycart')
  })
  }
  else {
    pool.query(`delete from cart where id = '${req.query.id}' and usernumber = '${req.session.ipaddress}'`,(err,result)=>{
      if(err) throw err;
      else res.redirect('/mycart')
      })
  }
})





router.get('/checkout',fetchCartData,(req,res)=>{
  //  req.session.usernumber = null;  
// res.json(req.session)

  if(req.session.usernumber){

    req.session.page = '1'
    var query = `select * from category order by id desc;`
    var query1 = `select c.* , 
    (select p.name from product p where p.id = c.booking_id) as bookingname,
    (select p.image from product p where p.id = c.booking_id) as bookingimage,
    (select p.quantity from product_manage p where p.productid = c.booking_id and p.sizeid = c.size) as availablequantity

    
     from cart c where c.usernumber = '${req.session.usernumber}';`
   var query2 = `select sum(price) as totalprice from cart where usernumber = '${req.session.usernumber}';`              
   var query3 = `select sum(quantity) as counter from cart where usernumber = '${req.session.usernumber}';`
   var query6 = `select * from users where id = '84';`
    var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.usernumber}';`
    var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.usernumber}';`
    var query9 = `select * from address where usernumber = '${req.session.usernumber}';`


    pool.query(query+query1+query2+query3+query6+query7+query8+query9,(err,result)=>{
      if(err) throw err;
      else{
     

        if(result[2][0].totalprice > 500) {
          res.render('checkout', { title: 'Express',login:true,result , shipping_charges : 0 ,msg:'',cartData:req.cartData });
        
        }
        else {
          res.render('checkout', { title: 'Express',login:true,result , shipping_charges : 500,msg:'',cartData:req.cartData });
        
        }
        
   
      }
   
   
       })

 
   

  }
  else{
    req.session.page = '1'
    var query = `select * from category order by id desc;`
    var query1 = `select c.* , 
    (select p.name from product p where p.id = c.booking_id) as bookingname,
    (select p.image from product p where p.id = c.booking_id) as bookingimage,
    (select p.quantity from product_manage p where p.productid = c.booking_id and p.sizeid = c.size) as availablequantity

    
     from cart c where c.usernumber = '${req.session.ipaddress}';`
   var query2 = `select sum(price) as totalprice from cart where usernumber = '${req.session.ipaddress}';`              
   var query3 = `select sum(quantity) as counter from cart where usernumber = '${req.session.ipaddress}';`

   var query6 = `select * from users where id = '84';`
    var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.ipaddress}';`
    var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.ipaddress}';`
    var query9 = `select * from address where usernumber = '${req.session.ipaddress}';`


    pool.query(query+query1+query2+query3+query6+query7+query8,(err,result)=>{
      if(err) throw err;
      else{
     

        if(result[2][0].totalprice > 500) {
          res.render('checkout', { title: 'Express',login:true,result , shipping_charges : 0 ,msg:'',cartData:req.cartData });
        
        }
        else {
          res.render('checkout', { title: 'Express',login:true,result , shipping_charges : 500,msg:'',cartData:req.cartData });
        
        }
        
   
      }
   
   
       })
    // res.render('checkout',{msg:''})
  }
})





router.post('/order-as-a-guest',(req,res)=>{
  let body = req.body;



  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();
  
  today = mm + '/' + dd + '/' + yyyy;
  



  pool.query(`select * from users where email = '${req.body.email}'`,(err,result)=>{
    if(err) throw err;
    else if(result[0]){
      req.session.page = '1'
      var query = `select * from category order by id desc;`
      var query1 = `select c.* , 
      (select p.name from product p where p.id = c.booking_id) as bookingname,
      (select p.image from product p where p.id = c.booking_id) as bookingimage,
         (select p.quantity from product_manage p where p.productid = c.booking_id and p.sizeid = c.size) as availablequantity

  
      
       from cart c where c.usernumber = '${req.session.ipaddress}';`
     var query2 = `select sum(price) as totalprice from cart where usernumber = '${req.session.ipaddress}';`              
     var query3 = `select sum(quantity) as counter from cart where usernumber = '${req.session.ipaddress}';`
  
     var query6 = `select * from users where id = '84';`
      var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.ipaddress}';`
      var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.ipaddress}';`
  
  
      pool.query(query+query1+query2+query3+query6+query7+query8,(err,result)=>{
        if(err) throw err;
        else{
       
  
          if(result[2][0].totalprice > 500) {
            res.render('checkout', { title: 'Express',login:true,result , shipping_charges : 0 ,msg:'Email Already Exists' });
          
          }
          else {
            res.render('checkout', { title: 'Express',login:true,result , shipping_charges : 500,msg:'Email Already Exists' });
          
          }
          
     
        }
     
     
         })
    // res.render('checkout',{msg:'Email Already Exists'})
    }
    else{
      pool.query(`insert into users set ?`,body,(err,result)=>{
        if(err) throw err;
        else {
          console.log(result)

           req.session.usernumber = result.insertId;

           pool.query(`update cart set usernumber = '${result.insertId}' where usernumber = '${req.session.ipaddress}'`,(err,result)=>{
             if(err) throw err;


      pool.query(`insert into wishlist_name(name,quantity,created,usernumber) values('My Wishlist' , '0' , '${today}' , '${req.session.usernumber}')`,(err,result)=>{
        if(err){
          throw err;
        }
        else {
           res.redirect('/address');
        }
      })
           
            // 
           })
          
        }
      })
      
    }
  })
})



router.post('/signup-insert',(req,res)=>{
  let body = req.body;


  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();
  
  today = mm + '/' + dd + '/' + yyyy;



  pool.query(`select * from users where email = '${req.body.email}' or usernumber = '${req.body.usernumber}'`,(err,result)=>{
    if(err) throw err;
    else if(result[0]){
      var query = `select * from category order by id desc;`
      var query1 = `select * from website_customize where name = 'pp';`
      var query2 = `select * from website_customize where name = 'about';`
    
      var query6 = `select * from users where id = '84';`
      var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.usernumber}';`
      var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.usernumber}';`
        pool.query(query+query1+query2+query6+query7+query8,(err,result)=>{
            if(err) throw err;
            else res.render('signup',{msg : 'Email ID or Mobile Number Already Exists' , login:false,result:result})
        })
    }
    else{
      pool.query(`insert into users set ?`,body,(err,result)=>{
        if(err) throw err;
        else {
          console.log(result)
          let email = req.body.email;
          let password = req.body.password;
          pool.query(`insert into wishlist_name(name,quantity,created,usernumber) values('My Wishlist' , '0' , '${today}' , '${result.insertId}')`,(err,result)=>{
            if(err){
              throw err;
            }
            else {
              
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'leffetbysm@gmail.com',
    pass: 'leffet20'
  }
});

var mailOptions = {
  from: 'leffetbysm@gmail.com',
  to: email,
  subject: 'Thank You for creating a new account at leffet.in.',
  text: `
  ${req.body.firstname} ${req.body.lastname}


  Your login details are.
  Email: ${email} 
  Password : ${password}
  `
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    res.redirect('/login')

  } else {
    res.redirect('/login')
  }
});
              // res.redirect('/login')
            }
          })
         
        }
      })
      
    }
  })
})



router.post('/login',(req,res)=>{
  let body = req.body;
  console.log(body);
  pool.query(`select * from users where email = '${req.body.email}' and password = '${req.body.password}'`,(err,result)=>{
    if(err) throw err;
    else if(result[0]){
      console.log(result)
      req.session.usernumber = result[0].usernumber;
      pool.query(`update cart set usernumber = '${req.session.usernumber}' where usernumber = '${req.session.ipaddress}'`,(err,result)=>{
        if(err) throw err;
        else res.redirect('/address');
      })
      // res.redirect('/address')
    }
    else{


      body['quantity'] = 0;
    
      body['created'] = today;
      body['usernumber'] = req.session.usernumber;
    
      pool.query(`insert into wishlist_name set ?`,body,(err,result)=>{
        if(err){
          throw err;
        }
        else {
          res.json({msg:'success'})
        }
      })

      
    



      // res.render('checkout',{msg:'Invalid Credentials'})

    }
  })
})



router.post('/login1',(req,res)=>{
  let body = req.body;
  console.log(body);
  pool.query(`select * from users where email = '${req.body.email}' and password = '${req.body.password}'`,(err,result)=>{
    if(err) throw err;
    else if(result[0]){
      req.session.usernumber = result[0].usernumber
       res.redirect('/');

    }
    else{
      var query = `select * from category order by id desc;`
      var query1 = `select * from website_customize where name = 'pp';`
      var query2 = `select * from website_customize where name = 'about';`
    
      var query6 = `select * from users where id = '82';`
      var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.usernumber}';`
      var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.usernumber}';`
        pool.query(query+query1+query2+query6+query7+query8,(err,result)=>{
            if(err) throw err;


            var query = `select * from category order by id desc;`
            var query1 = `select * from website_customize where name = 'pp';`
            var query2 = `select * from website_customize where name = 'about';`
          
            var query6 = `select * from users where id = '84';`
            var query7 = `select count(id) as counter from cart where usernumber = '${req.session.usernumber}';`
            var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.usernumber}';`
              pool.query(query+query1+query2+query6+query7+query8,(err,result)=>{
                  if(err) throw err;
                  else res.render('login',{msg : 'Invalid Credentials' , login:false,result:result})

                  // else res.json(result)
              })
            



            // else res.json(result)
        })

    }
  })
})


router.get('/address',(req,res)=>{

// console.log(req.session.usernumber)
// console.log(req.session.ipaddress)

  var query = `select * from category order by id desc;`
  var query1 = `select c.* , 
  (select p.name from product p where p.id = c.booking_id) as bookingname,
  (select p.image from product p where p.id = c.booking_id) as bookingimage,
     (select p.quantity from product_manage p where p.productid = c.booking_id and p.sizeid = c.size) as availablequantity


  
   from cart c where c.usernumber = '${req.session.usernumber}';`
 var query2 = `select sum(price) as totalprice from cart where usernumber = '${req.session.usernumber}';`              
 var query3 = `select sum(quantity) as counter from cart where usernumber = '${req.session.usernumber}';` 
 var query4 = `select * from address where usernumber = '${req.session.usernumber}';` 
 var query5 = `select * from users where usernumber = '${req.session.usernumber}';`

 var query7 = `select count(id) as counter from wishlist where usernumber = '${req.session.usernumber}';`
 var query8 = `select sum(quantity) as counter from cart where usernumber = '${req.session.usernumber}';`

 pool.query(query+query1+query2+query3+query5+query7+query8+query4,(err,result)=>{
   if(err) throw err;
   else if(result[7][0]){
    //  res.json(result)
    res.render('address1',{result:result,login:true})

   }
   else{
     res.render('address',{result:result,login:true})
    // res.json(result)

   }

 })            

})


router.get('/mylogout',(req,res)=>{
  req.session.usernumber = null;
  res.redirect('/checkout')
})


router.get('/shipping',fetchCartData,(req,res)=>{
  console.log('query',req.query)
  req.session.address_id = req.query.id_address_delivery

  var queryold = `select c.booking_id , c.usernumber , 
  (select weight from product_manage p where p.productid = c.booking_id and p.sizeid = c.size)*c.quantity as totalweighthai
   from cart c where c.usernumber = '${req.session.usernumber}'`
   pool.query(queryold,(err,result)=>{
     if(err) throw err;
     else {
       console.log(result)
let totalweight = 0;
for(i=0;i<result.length;i++){

totalweight = (+totalweight) + (+result[i].totalweighthai)



}
// res.json(totalweight)



var query = `select * from category order by id desc;`
var query1 = `select c.* , 
(select p.name from product p where p.id = c.booking_id) as bookingname,
(select p.image from product p where p.id = c.booking_id) as bookingimage,

   (select p.quantity from product_manage p where p.productid = c.booking_id and p.sizeid = c.size) as availablequantity



 from cart c where c.usernumber = '${req.session.usernumber}';`
var query2 = `select sum(price) as totalprice from cart where usernumber = '${req.session.usernumber}';`              
var query3 = `select sum(quantity) as counter from cart where usernumber = '${req.session.usernumber}';` 
var query4 = `select * from address where usernumber = '${req.session.usernumber}';` 
var query5 = `select * from users where usernumber = '${req.session.usernumber}';`
var query7 = `select count(id) as counter from wishlist where usernumber = '${req.session.usernumber}';`
var query8 = `select sum(quantity) as counter from cart where usernumber = '${req.session.usernumber}';`
 var query9 = `select * from address where id = '${req.session.address_id}' `
// res.json(totalweight)

pool.query(query+query1+query2+query3+query4+query5+query7+query8+query9,(err,result)=>{
if(err) throw err;
 else{
  // req.session.shipping_charges = result[8][0].charges;

   res.render('shipping',{result:result,addressid:req.session.address_id,login:true,cartData:req.cartData})
//  res.json(req.session)
}

}) 




     }
   })




  // res.render('shipping') 
})




router.get('/payment',(req,res)=>{
  console.log('payment data',req.query)
  req.session.message = req.query.message


  var queryold = `select c.booking_id , c.usernumber , 
  (select weight from product_manage p where p.productid = c.booking_id and p.sizeid = c.size) as totalweighthai
   from cart c where c.usernumber = '${req.session.usernumber}'`
   pool.query(queryold,(err,result)=>{
     if(err) throw err;
     else {
       console.log(result)
let totalweight = 0;
for(i=0;i<result.length;i++){

totalweight = (+totalweight) + (+result[i].totalweighthai)

}




var query = `select * from category order by id desc;`
var query1 = `select c.* , 
(select p.name from product p where p.id = c.booking_id) as bookingname,
(select p.image from product p where p.id = c.booking_id) as bookingimage,
   (select p.quantity from product_manage p where p.productid = c.booking_id and p.sizeid = c.size) as availablequantity



 from cart c where c.usernumber = '${req.session.usernumber}';`
var query2 = `select sum(price) as totalprice from cart where usernumber = '${req.session.usernumber}';`              
var query3 = `select sum(quantity) as counter from cart where usernumber = '${req.session.usernumber}';` 
var query4 = `select * from address where usernumber = '${req.session.usernumber}';` 
var query5 = `select * from users where usernumber = '${req.session.usernumber}';`
var query7 = `select count(id) as counter from wishlist where usernumber = '${req.session.usernumber}';`
var query8 = `select sum(quantity) as counter from cart where usernumber = '${req.session.usernumber}';`
var query9 = `select charges from country where name = (select id_country from address where id = '${req.session.address_id}') and from_Weight < ${totalweight} and to_weight >  ${totalweight}; `

pool.query(query+query1+query2+query3+query4+query5+query7+query8+query9,(err,result)=>{
if(err) throw err;
 else{
 res.render('payment',{result:result,addressid:req.session.address_id,message:req.session.message,login:true})

}

}) 
     }


     })
  
  // res.render('shipping') 





})



router.post('/payment-create',(req,res)=>{
  
  const url = `https://rzp_live_Yfnp0JSMDmIFvv:WuBf9SuLkWzXyENB29QTbUw0@api.razorpay.com/v1/orders/`;

  const data = {
    amount: req.body.amount* 100, // amount in the smallest currency unit
    // amount:100,
    currency: "INR",
    payment_capture: true,
  };
  console.log("data", data);
  const options = {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  };
  fetch(url, options)
    .then((res) => res.json())
    .then((resu) => {
         res.render('open',{resu : resu.id})
        // res.json(resu)
    })
})



router.get('/size-chart',(req,res)=>{
  if(req.session.usernumber){
    var query = `select * from category order by id desc;`

    var query1 = `select * from website_customize where name = 'about';`
    var query2 = `select * from website_customize where name = 'about';`
    var query6 = `select * from users where usernumber = '${req.session.usernumber}';`
    var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.usernumber}';`
    var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.usernumber}';`
    pool.query(query+query1+query2+query6+query7+query8,(err,result)=>{
    res.render('sizechart',{result:result,login:true,title:'Size Chart'})
    })
  }
  else{
    var query = `select * from category order by id desc;`

    var query1 = `select * from website_customize where name = 'about';`
    var query2 = `select * from website_customize where name = 'about';`
    var query6 = `select * from users where id = '84';`
    var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.ipaddress}';`
    var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.ipaddress}';`
    pool.query(query+query1+query2+query6+query7+query8,(err,result)=>{
    res.render('sizechart',{result:result,login:false,title:'Size Chart'})
    })
  }

 
})


router.get('/wishlist',(req,res)=>{
  console.log(req.session.usernumber)
  var query = `select * from category order by id desc;`
  var query1 = `select * from users where usernumber = '${req.session.usernumber}';`
  var query2 = `select * from website_customize where name = 'about';`
    var query6 = `select * from users where usernumber = '${req.session.usernumber}';`
    var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.usernumber}';`
    var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.usernumber}';`
    var query9 = `select * from wishlist_name where usernumber = '${req.session.usernumber}' order by id desc;`
  if(req.session.usernumber){
pool.query(query+query1+query2+query6+query7+query8+query9,(err,result)=>{
  if(err) throw err;
  else res.render('wishlist',{result:result,msg:'',login:true,title:'My Wishlist'})
})
  }
  else{
    res.redirect('/login')
  }
  
  // res.render('wishlist')
})



router.post('/delete-wishlist',(req,res)=>{
  console.log(req.body)
  pool.query(`delete from wishlist_name where id = '${req.body.id}'`,(err,result)=>{
    if(err) throw err;
    else {
      pool.query(`delete from wishlist where wishlistid = '${req.body.id}'`,(err,result)=>{
        if(err) throw err;
        else {
          res.json({msg:'success'})

        }
      })
    }
  })
})



router.post('/s',(req,res)=>{
  let body = req.body;
  console.log(req.body)

  var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();

today = mm + '/' + dd + '/' + yyyy;


  body['quantity'] = 0;

  body['created'] = today;
  body['usernumber'] = req.session.usernumber;

  pool.query(`insert into wishlist_name set ?`,body,(err,result)=>{
    if(err){
      throw err;
    }
    else {
      res.json({msg:'success'})
    }
  })

  // res.json({msg:'success'})
})


router.get('/identity',(req,res)=>{
  var query = `select * from category order by id desc;`
  var query1 = `select * from users where usernumber = '${req.session.usernumber}';`
  var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.usernumber}';`
  var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.usernumber}';`
  if(req.session.usernumber){
pool.query(query+query1+query7+query8,(err,result)=>{
  if(err) throw err;
  else res.render('identity',{result:result,msg:'',login:true})
})
  }
  else{
    res.redirect('/')
  }
  
})



router.post('/identity/update',(req,res)=>{
  let body = req.body;
  // console.log(req.body)
  pool.query(`update users set ? where id = ?`, [req.body, req.body.id], (err, result) => {
    if(err) {
        res.json({
            status:500,
            type : 'error',
            description:err
        })
    }
    else {
      var query = `select * from category order by id desc;`
  var query1 = `select * from users where usernumber = '${req.session.usernumber}';`
  
pool.query(query+query1,(err,result)=>{
  if(err) throw err;
  else res.render('identity',{result:result,msg:'Identity Successfully Updated'})
})
 

        
    }
})
})


router.get('/alert',(req,res)=>{
  var query = `select * from category order by id desc;`
  var query1 = `select * from users where usernumber = '${req.session.usernumber}';`
  var query2 = `select * from website_customize where name = 'about';`
  var query6 = `select * from users where usernumber = '${req.session.usernumber}';`
  var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.usernumber}';`
  var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.usernumber}';`
  var query9 = `select * from alert where usernumber = '${req.session.usernumber}' order by id desc limit 20;`
  if(req.session.usernumber){
    pool.query(query+query1+query2+query6+query7+query8+query9,(err,result)=>{
      if(err) throw err;
      else res.render('alert',{result:result,msg:'',login:true,title:'Alert'})
    })
      }
      else{
        res.redirect('/')
      }
  // res.render('alert')
})


router.get('/helpdesk',(req,res)=>{
  var query = `select * from category order by id desc;`
  var query1 = `select * from users where usernumber = '${req.session.usernumber}';`
  var query2 = `select * from website_customize where name = 'about';`
  var query6 = `select * from users where usernumber = '${req.session.usernumber}';`
  var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.usernumber}';`
  var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.usernumber}';`
  var query9 = `select * from helpdesk where usernumber = '${req.session.usernumber}' order by id desc limit 7;`
  if(req.session.usernumber){
    pool.query(query+query1+query2+query6+query7+query8+query9,(err,result)=>{
      if(err) throw err;
      else res.render('helpdesk',{result:result,msg:'',login:true,title:'Helpdesk'})
    })
      }
      else{
        res.redirect('/')
      }
  // res.render('helpdesk')
})



// router.post('/order-now',(req,res)=>{
//   let body = req.body;
// // console.log('body',req.body)
//   let cartData = req.body

//   console.log('CardData',cartData)
//   if(req.body.payment_mode == 'online') {

//     req.session.userfirstname =  req.body.first_name;
  
//     req.session.address1 = req.body.address1;
//     req.session.address2 = req.body.address2;
//     req.session.city = req.body.city;
//     req.session.state = req.body.state;
//     req.session.pincode = req.body.pincode;
//     req.session.time = req.body.time;
//     req.session.payment_mode = req.body.payment_mode;
   
   
//     if((+req.session.totalprice) > 500) {
//       amount = req.session.totalprice
//     }
//     else {
//      amount = (+req.session.totalprice) + 500
//     }


//     const url = `https://rzp_live_wdTkjI7Ba4b5qN:rxR0Prlwb9Gz7HctbrpukFOe@api.razorpay.com/v1/orders/`;
//     const data = {
//       amount: amount* 100, // amount in the smallest currency unit
//       //amount:100,
//       currency: "INR",
//       payment_capture: true,
//     };
//     console.log("data", data);
//     const options = {
//       method: "POST",
//       body: JSON.stringify(data),
//       headers: {
//         "Content-Type": "application/json",
//       },
//     };
//     fetch(url, options)
//       .then((res) => res.json())
//       .then((resu) => {
//            res.render('open',{resu : resu.id})
//       })

//   }
//   else{


//     console.log('CardData',cartData)

//        body['status'] = 'pending'
        
    
//       var today = new Date();
//     var dd = today.getDate();
    
//     var mm = today.getMonth()+1; 
//     var yyyy = today.getFullYear();
//     if(dd<10) 
//     {
//       dd='0'+dd;
//     } 
    
//     if(mm<10) 
//     {
//       mm='0'+mm;
//     } 
//     today = yyyy+'-'+mm+'-'+dd;
    
    
//     body['date'] = today
    
    
    
//       var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//       var result = '';
//       for ( var i = 0; i < 12; i++ ) {
//           result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
//       }
//      orderid = result;
//      req.session.orderid = orderid;
    
    
//         body['address'] = req.body.address + ','  + req.body.city + ',' + req.body.pincode;
//         body['name'] = req.body.first_name  ;
    
    
//      console.log(req.body)
    
    
//      pool.query(`select * from cart where usernumber = '${req.session.usernumber}'`,(err,result)=>{
//          if(err) throw err;
//          else {
    
//          let data = result
    
//          for(i=0;i<result.length;i++){
//           data[i].name = req.body.name
//           data[i].date = today
//           data[i].orderid = orderid
//           data[i].status = 'pending'
//           data[i].number = req.session.usernumber
//           data[i].usernumber = req.session.usernumber
//           data[i].payment_mode = 'cash'
//           data[i].address = req.body.address
//           data[i].id = null
//           data[i].pincode = req.body.pincode
//           data[i].order_date = today
//           data[i].time = req.body.time
//           data[i].price = data[i].price
//             data[i].shipping_charges = 0

//           // if((+data[i].price) > 500){
//           //   data[i].price = data[i].price
//           //   data[i].shipping_charges = 0
//           // }
//           // else{
//           // data[i].price = (+data[i].price) + 500;
//           // data[i].shipping_charges = 500
//           // }
    
    
//          }
    
    
       
    
//     for(i=0;i<data.length;i++) {
//       console.log('quantity1',data[i])
    
//     let quantity = data[i].quantity;
//     let booking_id = data[i].booking_id;
    
//      pool.query(`insert into booking set ?`,data[i],(err,result)=>{
//              if(err) throw err;
//              else {
        
    
//     pool.query(`update product set quantity = quantity - ${quantity} where id = '${booking_id}'`,(err,result)=>{
//      if(err) throw err;
//      else {
    
//      }
    
//     })
    
//              }
//         })
//     }
    
    
      
    
    
//     pool.query(`delete from cart where usernumber = '${req.session.usernumber}'`,(err,result)=>{
//       if(err) throw err;
//       else {
//          res.redirect('/confirmation')
//       }
//     })
    
    
//          }
//      })

//   }

  

 
// })



router.get('/payment-failed',(req,res)=>{
  res.redirect(`/shipping?id_address_delivery=${req.session.addressInsertId}`)
})



router.post('/order-now', async (req, res) => {
  try {
    let body = req.body;
    console.log('Cart Data:', body);

    if(req.body.payment_mode == 'online') {

      const today = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD format
      const orderid = Math.random().toString(36).substr(2, 12); // Random 12-character order ID
      req.session.orderid = orderid;

      req.session.userfirstname =  req.body.first_name;
    
      req.session.address = `${req.body.address}-${req.body.city}-${req.body.pincode}`;
      req.session.city = req.body.city;
      req.session.state = req.body.state;
      req.session.pincode = req.body.pincode;
      req.session.payment_mode = req.body.payment_mode;
      req.session.totalprice = req.body.total_amount;
      req.session.address = req.body.address;
      req.session.last_name = req.body.last_name
     
      if((+req.session.totalprice) > 500) {
        amount = req.session.totalprice
      }
      else {
       amount = (+req.session.totalprice) + 0;
      }
  
  
      const url = `https://rzp_live_73LM5AK2fWqoob:igp3tmmiP1WGwFYLU7aZNoCo@api.razorpay.com/v1/orders/`;
      const data = {
        amount: amount* 100, // amount in the smallest currency unit
        //amount:100,
        currency: "INR",
        payment_capture: true,
      };
      console.log("data", data);
      const options = {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      };
      fetch(url, options)
        .then((res) => res.json())
        .then((resu) => {
             res.render('open',{resu : resu.id})
        })
  
    }
     else {
      // Handle cash on delivery
      body['status'] = 'pending';

      const today = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD format
      const orderid = Math.random().toString(36).substr(2, 12); // Random 12-character order ID
      req.session.orderid = orderid;

      body['address'] = `${req.body.address}, ${req.body.city}, ${req.body.pincode}`;
      body['name'] = req.body.first_name;
      body['date'] = today;

      // Fetch cart data and process the order
      pool.query(`SELECT c.* ,
         (select p.name from product p where p.id = c.booking_id) as product_name,
         (select p.sku from product p where p.id = c.booking_id) as product_sku
         FROM cart c WHERE c.usernumber = '${req.session.usernumber}'`, async (err, result) => {
        if (err) throw err;
      console.log('result fetch',result)
        const data = result.map((item) => ({
          // ...item,
          name: body.name,
          date: today,
          orderid,
          status: 'pending',
          number: req.session.usernumber,
          payment_mode: 'cash',
          address: body.address,
          order_date: today,
          time: body.time,
          price: item.price,
          shipping_charges: 0,
          quantity : item.quantity,
          booking_id : item.booking_id,
          product_name:item.product_name,
          product_sku:item.product_sku
        }));


        console.log('data comes',data)

        // Insert booking and update product quantities
        for (const orderItem of data) {
          const { quantity, booking_id } = orderItem;

          // Insert into booking table
          await new Promise((resolve, reject) => {
            pool.query('INSERT INTO booking SET ?', orderItem, (err) => {
              if (err) reject(err);
              resolve();
            });
          });

          // Update product quantities
          await new Promise((resolve, reject) => {
            pool.query(
              `UPDATE product SET quantity = quantity - ${quantity} WHERE id = '${booking_id}'`,
              (err) => {
                if (err) reject(err);
                resolve();
              }
            );
          });
        }

        // Delete cart items
        pool.query(`DELETE FROM cart WHERE usernumber = '${req.session.usernumber}'`, async (err) => {
          if (err) throw err;

          // Create a shipping order via Shiprocket
          try {
            const token = await deliveryApi.shippingAuthLogin();
            console.log('token recieved',token)
            console.log('body recieved',req.body)
            console.log('data recieved',data)

            const shippingOrderDetails = {
              order_id: orderid,
              order_date: today,
              pickup_location: 'store_location',
              billing_customer_name: req.body.first_name,
              billing_last_name: '',
              billing_address: req.body.address,
              billing_address_2: '',
              billing_city: req.body.city,
              billing_pincode: req.body.pincode,
              billing_state: req.body.state,
              billing_country: 'India',
              billing_email: req.body.email,
              billing_phone: req.body.number,
              shipping_is_billing: true,
              order_items: data.map((item) => ({
                name: item.product_name,
                sku: item.product_sku || 'SKU-20250402125200046',
                units: item.quantity,
                selling_price: item.price,
              })),
              payment_method: 'COD',
              shipping_charges: 0,
              sub_total: data.reduce((sum, item) => sum + item.price * item.quantity, 0),
              length: 10,
              breadth: 10,
              height: 10,
              weight: 1.0,
            };


            console.log('shippingOrderDetails',shippingOrderDetails)

            const shippingResponse = await deliveryApi.createShippingOrder(shippingOrderDetails, token);
            console.log('Shipping Order Response:', shippingResponse);
             pool.query(`insert into shipping set ?`,shippingResponse,(err,result)=>{
              if(err) throw err;
              else{
                res.redirect('/confirmation');

              }
             })



          } catch (shippingError) {
            console.error('Failed to create shipping order:', shippingError.message);
            res.status(500).json({ success: false, error: shippingError.message });
          }
        });
      });
    }
  } catch (error) {
    console.error('Error handling order:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});




router.get('/myorder',fetchCartData,(req,res)=>{
  if(req.session.usernumber){
    // res.json(req.session.usernumber)
    req.session.page = null;
    var query = `select * from category order by id desc;`
    var query1 = `select b.* , (select p.name from product p where p.id = b.booking_id) as bookingname,
    (select p.image from product p where p.id = b.booking_id) as bookingimage,
    (select u.email from users u where u.id = b.usernumber) as usermobilenumber

    from booking b where b.number = '${req.session.usernumber}' order by id desc;`
    var query6 = `select * from users where usernumber = '${req.session.usernumber}';`
    var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.usernumber}';`
    var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.usernumber}';`
    pool.query(query+query1+query6+query7+query8,(err,result)=>{
      if(err) throw err;
      else res.render('myorder',{result:result,login:true,msg1:'You have not placed any orders.',msg2:`Here are the orders you've placed since your account was created`,title:'Order History',cartData:req.cartData})
    // else res.json(result[1])
    })
  }
  else{
    req.session.page = null;
  res.redirect('/login')
  }
 
})


router.get('/credit-slip',(req,res)=>{
  if(req.session.usernumber){
    req.session.page = null;
    var query = `select * from category order by id desc;`
    var query1 = `select b.* , (select p.name from product p where p.id = b.booking_id) as bookingname,
    (select p.image from product p where p.id = b.booking_id) as bookingimage,
    (select u.email from users u where u.id = b.usernumber) as usermobilenumber

    from booking b where usernumber = '${req.session.usernumber}' and status = 'Cancel'  order by id desc;`
    var query6 = `select * from users where usernumber = '${req.session.usernumber}';`
    var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.usernumber}';`
    var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.usernumber}';`
    pool.query(query+query1+query6+query7+query8,(err,result)=>{
      if(err) throw err;
      else res.render('myorder',{result:result,login:true,msg1:'You have not received any credit slips.',msg2:'Credit slips you have received after canceled orders.',title:'Credit Slips'})
    })
  }
  else{
    req.session.page = null;
  res.redirect('/login')
  }
 
})





router.get('/myorder/cancel',(req,res)=>{
  pool.query(`update booking set status = 'cancel' where id = '${req.query.orderid}'`,(err,result)=>{
      if(err) throw err;
      else res.redirect('/myorder')
  })
})





// router.get('/search',(req,res)=>{

// if(req.session.usernumber){
//   var query = `select * from category order by id desc;`
//   var query1 = `select * from product where keywords Like '%${req.query.search}%' order by quantity desc;`
//    var query2 = `select * from category order by id desc;`

//   var query6 = `select * from users where usernumber = '${req.session.usernumber}';`
//     var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.usernumber}';`
//     var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.usernumber}';`
//     var query9 = `select * from wishlist_name where usernumber = '${req.session.usernumber}';`
//   pool.query(query+query1+query2+query6+query7+query8+query9,(err,result)=>{
//     if(err) throw err;
//     else if(result[1][0]){
//       res.render('shop',{result:result,login:true})
//     }
//     else res.render('not_found',{result:result,login:true})
//   })
// }
// else{
//   var query = `select * from category order by id desc;`
//   var query1 = `select * from product where keywords Like '%${req.query.search}%' order by quantity desc;`
//   var query2 = `select * from category where id = '${req.query.id}';`
//   var query6 = `select * from users where id = '84';`
//     var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.ipaddress}';`
//     var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.ipaddress}';`
//     var query9 = `select * from wishlist_name where usernumber = '${req.session.ipaddress}';`
//   pool.query(query+query1+query6+query7+query8+query9,(err,result)=>{
//     if(err) throw err;
//     else if(result[1][0]){
//       res.render('shop',{result:result,login:false})
//     }
//     else res.render('not_found',{result:result,login:false})

//   })
// }

  
 
// })










router.get('/website-customization',(req,res)=>{
  res.render('website_customization')
})



router.get('/faq-customization',(req,res)=>{
  res.render('faq_customization')
})




router.post('/faq-insert',(req,res)=>{
  let body = req.body
  pool.query(`insert into faq set ?`,body,(err,result)=>{
    if(err) throw err;
    else res.json({
      msg : 'success'
    })
  })
})



router.post('/website-customization-insert',(req,res)=>{
  let body = req.body   
  pool.query(`select * from website_customize where name = '${req.body.name}'`,(err,result)=>{
    if(err) throw err;
    else if(result[0]){
      res.json({
        msg : 'Already Inserted'
      })
    }
    else {
      pool.query(`insert into website_customize set ?`,body,(err,result)=>{
        if(err) throw err;
        else res.json({
          msg : 'success'
        })
      })
    }
  })
})




router.get('/view-all-product',(req,res)=>{


  if(req.session.usernumber){
    var query = `select * from category order by id desc;`
    var query1 = `select t.* ,   
    (select p.name from product p where p.id = t.productid) as productname,
    (select p.price from product p where p.id = t.productid) as productprice,
    (select p.quantity from product p where p.id = t.productid) as productquantity,
    (select p.discount from product p where p.id = t.productid) as productdiscount,
    (select p.image from product p where p.id = t.productid) as productimage,
    (select p.categoryid from product p where p.id = t.productid) as productcategoryid,
    (select p.subcategoryid from product p where p.id = t.productid) as productsubcategoryid,
    (select p.net_amount from product p where p.id = t.productid) as productnetamount 
    from promotional_text_management t where t.bannerid = '${req.query.id}' order by productquantity desc `
    pool.query(query+query1,(err,result)=>{
      if(err) throw err;
      else if(result[1][0]) res.render('view_all_product',{result:result,login:true})
      else  res.render('not_found',{result,login:true})
    })
  }
  else{
    var query = `select * from category order by id desc;`
    var query1 = `select t.* ,   
    (select p.name from product p where p.id = t.productid) as productname,
    (select p.price from product p where p.id = t.productid) as productprice,
    (select p.quantity from product p where p.id = t.productid) as productquantity,
    (select p.discount from product p where p.id = t.productid) as productdiscount,
    (select p.image from product p where p.id = t.productid) as productimage,
    (select p.categoryid from product p where p.id = t.productid) as productcategoryid,
    (select p.subcategoryid from product p where p.id = t.productid) as productsubcategoryid,
    (select p.net_amount from product p where p.id = t.productid) as productnetamount 
    from promotional_text_management t where t.bannerid = '${req.query.id}' order by productquantity desc ;`
    pool.query(query+query1,(err,result)=>{
      if(err) throw err;
      else  res.render('view_all_product',{result:result,login:false})
    })
  }
  

 
})




router.get('/banner-product',(req,res)=>{


  if(req.session.usernumber){
    var query = `select * from category order by id desc;`
    var query1 = `select t.* ,   
    (select p.name from product p where p.id = t.productid) as productname,
    (select p.price from product p where p.id = t.productid) as productprice,
    (select p.quantity from product p where p.id = t.productid) as productquantity,
    (select p.discount from product p where p.id = t.productid) as productdiscount,
    (select p.image from product p where p.id = t.productid) as productimage,
    (select p.categoryid from product p where p.id = t.productid) as productcategoryid,
    (select p.subcategoryid from product p where p.id = t.productid) as productsubcategoryid,
    (select p.net_amount from product p where p.id = t.productid) as productnetamount 
    from banner_manage t where t.bannerid = '${req.query.id}' `
    pool.query(query+query1,(err,result)=>{
      if(err) throw err;
      else if(result[1][0]) res.render('view_all_product',{result:result,login:true})
      else  res.render('not_found',{result,login:true})
    })
  }
  else{
    var query = `select * from category order by id desc;`
    var query1 = `select t.* ,   
    (select p.name from product p where p.id = t.productid) as productname,
    (select p.price from product p where p.id = t.productid) as productprice,
    (select p.quantity from product p where p.id = t.productid) as productquantity,
    (select p.discount from product p where p.id = t.productid) as productdiscount,
    (select p.image from product p where p.id = t.productid) as productimage,
    (select p.categoryid from product p where p.id = t.productid) as productcategoryid,
    (select p.subcategoryid from product p where p.id = t.productid) as productsubcategoryid,
    (select p.net_amount from product p where p.id = t.productid) as productnetamount 
    from banner_manage t where t.bannerid = '${req.query.id}' ;`
    pool.query(query+query1,(err,result)=>{
      if(err) throw err;
      else if(result[1][0]) res.render('view_all_product',{result:result,login:true})
      else  res.render('not_found',{result,login:true})
    })
  }
  
})



router.get('/myaccount',fetchCartData,(req,res)=>{
  if(req.session.usernumber){
    var query = `select * from category order by id desc;`
    var query1 = `select * from users where usernumber = '${req.session.usernumber}';`
    var query2 = `select * from users where usernumber = '${req.session.usernumber}';`
    var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.usernumber}';`
    var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.usernumber}';`

    pool.query(query+query1+query2+query7+query8,(err,result)=>{
      if(err) throw err;
      else res.render('myaccount',{result:result,login:true,msg:req.query.msg,color:req.query.color,cartData:req.cartData})
    })
  }
  else{
 res.redirect('/login')
  }
  
})







router.post('/myaccount-update', (req, res) => {
  console.log(req.body)
  pool.query(`update users set ? where number = ?`, [req.body, req.body.number], (err, result) => {
      if(err) {
          res.json({
              status:500,
              type : 'error',
              description:err
          })
      }
      else {

  if(req.session.newuser){
    req.session.newuser = null;
        res.redirect('/checkout')
  }
  else {
    res.redirect('/myaccount')

  }


          
      }
  })
})




router.get('/about',fetchCartData,(req,res)=>{
  if(req.session.usernumber) {
    var query = `select * from category order by id desc;`
    var query1 = `select * from website_customize where name = 'about';`
    var query2 = `select * from website_customize where name = 'about';`

    var query6 = `select * from users where usernumber = '${req.session.usernumber}';`
    var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.usernumber}';`
    var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.usernumber}';`
    var query10 = `select * from banner where type='About Video' order by id desc limit 1;`

    pool.query(query+query1+query2+query6+query7+query8+query10,(err,result)=>{
      if(err) throw err;
     
      else res.render('website_customize',{result,login:true,msg:'about',title:'About Us',cartData:req.cartData})
    })
  }
  else{
    var query = `select * from category order by id desc;`
    var query1 = `select * from website_customize where name = 'about' ;`
    var query2 = `select * from website_customize where name = 'about';`

    var query6 = `select * from users where usernumber = '84';`
    var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.ipaddress}';`
    var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.ipaddress}';`
    var query10 = `select * from banner where type='About Video' order by id desc limit 1;`

    pool.query(query+query1+query2+query6+query7+query8+query10,(err,result)=>{
      if(err) throw err;
       else res.render('website_customize',{result,login:false,msg:'about',title:'About Us',cartData:req.cartData})
      // else res.json(result)
    })
  }
})



router.get('/art-elements',(req,res)=>{
  if(req.session.usernumber) {
    var query = `select * from category order by id desc;`
    var query1 = `select * from website_customize where name = 'art_elements';`
    var query2 = `select * from website_customize where name = 'about';`

    var query6 = `select * from users where usernumber = '${req.session.usernumber}';`
    var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.usernumber}';`
    var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.usernumber}';`
    pool.query(query+query1+query2+query6+query7+query8,(err,result)=>{
      if(err) throw err;
     
      else res.render('website_customize',{result,login:true,msg:'art_elements',title:`Leffet's Art Elements`})
    })
  }
  else{
    var query = `select * from category order by id desc;`
    var query1 = `select * from website_customize where name = 'art_elements' ;`

    var query2 = `select * from website_customize where name = 'about';`

    var query6 = `select * from users where id = '84';`
    var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.ipaddress}';`
    var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.ipaddress}';`
    pool.query(query+query1+query2+query6+query7+query8,(err,result)=>{
      if(err) throw err;
      else res.render('website_customize',{result,login:false,msg:'art_elements',title:`Leffet's Art Elements`})
    })
  }
})





router.get('/g',(req,res)=>{
  var query1 = `select * from website_customize where name = '${req.query.msg}';`
  pool.query(query1,(err,result)=>{
    if(err) throw err;
    else res.json(result)
  })
})


router.get('/content',(req,res)=>{
  var query1 = `select * from category where name = '${req.query.msg}';`
  pool.query(query1,(err,result)=>{
    if(err) throw err;
    else res.json(result)
  })
})





router.get('/product-description',(req,res)=>{
  var query1 = `select * from product where id = '${req.query.msg}';`
  var query2 = `select * from product_manage where productid = '${req.query.msg}' && sizeid = '${req.query.size}';`
  pool.query(query1+query2,(err,result)=>{
    if(err) throw err;
    else res.json(result)
  })
})


router.get('/celebrity-description',(req,res)=>{
  var query1 = `select * from photoshot where id = '${req.query.msg}';`
  pool.query(query1,(err,result)=>{
    if(err) throw err;
    else res.json(result)
  })
})



router.get('/privacy-policy',fetchCartData,(req,res)=>{
  if(req.session.usernumber) {
    var query = `select * from category order by id desc;`
    var query1 = `select * from website_customize where name = 'pp';`
    var query2 = `select * from website_customize where name = 'about';`

    var query6 = `select * from users where usernumber = '${req.session.usernumber}';`
    var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.usernumber}';`
    var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.usernumber}';`
    pool.query(query+query1+query2+query6+query7+query8,(err,result)=>{
      if(err) throw err;
     
      else res.render('website_customize',{result,login:true,msg:'pp',title:'Privacy Ploicy',cartData:req.cartData})
    })
  }
  else{
    var query = `select * from category order by id desc;`
    var query1 = `select * from website_customize where name = 'pp' ;`

    var query2 = `select * from website_customize where name = 'about';`

    var query6 = `select * from users where id = '84';`
    var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.ipaddress}';`
    var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.ipaddress}';`
    pool.query(query+query1+query2+query6+query7+query8,(err,result)=>{
      if(err) throw err;
      else res.render('website_customize',{result,login:false,msg:'pp',title:'Privacy Ploicy',cartData:req.cartData})
    })
  }
})




router.get('/terms-and-conditions',fetchCartData,(req,res)=>{
  if(req.session.usernumber) {
    var query = `select * from category order by id desc;`
    var query1 = `select * from website_customize where name = 'tc';`
    var query2 = `select * from website_customize where name = 'about';`

    var query6 = `select * from users where usernumber = '${req.session.usernumber}';`
    var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.usernumber}';`
    var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.usernumber}';`
    pool.query(query+query1+query2+query6+query7+query8,(err,result)=>{
      if(err) throw err;
     
      else res.render('website_customize',{result,login:true,msg:'tc',title:'Terms & Conditions',cartData:req.cartData})
    })
  }
  else{
    var query = `select * from category order by id desc;`
    var query1 = `select * from website_customize where name = 'tc' ;`

    var query2 = `select * from website_customize where name = 'about';`

    var query6 = `select * from users where id = '84';`
    var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.ipaddress}';`
    var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.ipaddress}';`
    pool.query(query+query1+query2+query6+query7+query8,(err,result)=>{
      if(err) throw err;
      else res.render('website_customize',{result,login:false,msg:'tc',title:'Terms & Conditions',cartData:req.cartData})
    })
  }
})








router.get('/refund-policy',fetchCartData,(req,res)=>{
  if(req.session.usernumber) {
    var query = `select * from category order by id desc;`
    var query1 = `select * from website_customize where name = 'rp';`
    var query2 = `select * from website_customize where name = 'about';`

    var query6 = `select * from users where usernumber = '${req.session.usernumber}';`
    var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.usernumber}';`
    var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.usernumber}';`
    pool.query(query+query1+query2+query6+query7+query8,(err,result)=>{
      if(err) throw err;
     
      else res.render('website_customize',{result,login:true,msg:'rp',title:'Shipping & Replacement Policy',cartData:req.cartData})
    })
  }
  else{
    var query = `select * from category order by id desc;`
    var query1 = `select * from website_customize where name = 'rp' ;`

    var query2 = `select * from website_customize where name = 'about';`

    var query6 = `select * from users where id = '84';`
    var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.ipaddress}';`
    var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.ipaddress}';`
    pool.query(query+query1+query2+query6+query7+query8,(err,result)=>{
      if(err) throw err;
      else res.render('website_customize',{result,login:false,msg:'rp',title:'Shipping & Replacement Policy',cartData:req.cartData})
    })
  }
})











router.post('/razorpay-response',(req,res)=>{
  let body = req.body;
  let cartData = req.body
 console.log('reponsebody',req.body)
  res.redirect('/make-order')




})


router.get('/make-order',(req,res)=>{
  // res.json(req.session)

  let body=req.query;
      // Handle cash on delivery
      body['status'] = 'pending';

      const today = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD format
      const orderid = Math.random().toString(36).substr(2, 12); // Random 12-character order ID
      req.session.orderid = orderid;

      body['address'] = `${req.session.address}, ${req.session.city}, ${req.session.pincode}`;
      body['name'] = req.session.first_name;
      body['date'] = today;

      // Fetch cart data and process the order
      pool.query(`SELECT c.* , 
        (select p.name from product p where p.id = c.booking_id) as product_name,
        (select p.sku from product p where p.id = c.booking_id) as product_sku
         FROM cart c WHERE c.usernumber = '${req.session.usernumber}'`, async (err, result) => {
        if (err) throw err;
      console.log('result fetch online',result)
        const data = result.map((item) => ({
          // ...item,
          name: req.session.userfirstname,
          date: today,
          orderid,
          status: 'pending',
          number: req.session.usernumber,
          payment_mode: 'online',
          address: body.address,
          order_date: today,
          time: body.time,
          price: item.price,
          shipping_charges: 0,
          quantity : item.quantity,
          booking_id : item.booking_id,
          product_name:item.product_name,
          product_sku:item.product_sku
        }));


        console.log('data comes',data)

        // Insert booking and update product quantities
        for (const orderItem of data) {
          const { quantity, booking_id } = orderItem;

          // Insert into booking table
          await new Promise((resolve, reject) => {
            pool.query('INSERT INTO booking SET ?', orderItem, (err) => {
              if (err) reject(err);
              resolve();
            });
          });

          // Update product quantities
          await new Promise((resolve, reject) => {
            pool.query(
              `UPDATE product SET quantity = quantity - ${quantity} WHERE id = '${booking_id}'`,
              (err) => {
                if (err) reject(err);
                resolve();
              }
            );
          });
        }

        // Delete cart items
        pool.query(`DELETE FROM cart WHERE usernumber = '${req.session.usernumber}'`, async (err) => {
          if (err) throw err;

          // Create a shipping order via Shiprocket
          try {
            const token = await deliveryApi.shippingAuthLogin();
            console.log('token recieved',token)
            console.log('body recieved',req.body)
            console.log('data recieved',data)

            const shippingOrderDetails = {
              order_id: orderid,
              order_date: today,
              pickup_location: 'store_location',
              billing_customer_name: req.session.userfirstname,
              billing_last_name:'',
              billing_address: req.session.address,
              billing_address_2: '',
              billing_city: req.session.city,
              billing_pincode: req.session.pincode,
              billing_state: req.session.state,
              billing_country: 'India',
              billing_email: req.session.email,
              billing_phone: req.session.usernumber,
              shipping_is_billing: true,
              order_items: data.map((item) => ({
                name: item.product_name,
                sku: item.product_sku || 'SKU-20250402125200046',
                units: item.quantity,
                selling_price: item.price,
              })),
              payment_method: 'Prepaid',
              shipping_charges: 0,
              sub_total: data.reduce((sum, item) => sum + item.price * item.quantity, 0),
              length: 10,
              breadth: 10,
              height: 10,
              weight: 1.0,
            };


            console.log('shippingOrderDetails',shippingOrderDetails)

            const shippingResponse = await deliveryApi.createShippingOrder(shippingOrderDetails, token);
            console.log('Shipping Order Response:', shippingResponse);
             pool.query(`insert into shipping set ?`,shippingResponse,(err,result)=>{
              if(err) throw err;
              else{
                res.redirect('/confirmation');

              }
             })



          } catch (shippingError) {
            console.error('Failed to create shipping order:', shippingError.message);
            res.status(500).json({ success: false, error: shippingError.message });
          }
        });
      });
  
  
})




router.get('/myaddress',fetchCartData,(req,res)=>{
  if(req.session.usernumber){
    var query = `select * from category order by id desc;`
    var query1 = `select * from address where usernumber = '${req.session.usernumber}';`
    var query6 = `select * from users where usernumber = '${req.session.usernumber}';`
    var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.usernumber}';`
    var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.usernumber}';`
    pool.query(query+query1+query6+query7+query8,(err,result)=>{
      if(err) throw err;
      else res.render('myaddress',{result,login:true,cartData:req.cartData})
    })
  }
  else{
res.redirect('/login')
  }
  
  
})









// router.post('/save-address',(req,res)=>{
//   let body = req.body;
//   // body['usernumber'] = req.session.usernumber
//   console.log(req.body)
//   pool.query(`insert into address set ?`,req.body , (err,result)=>{
//   if(err) throw err;
//   else{
//   //  result.insertId;
//    pool.query(`insert into users set ?`,req.body,(err,result)=>{
//     if(err) throw err;
//     else {
//       req.session.usernumber = req.body.usernumber
//       res.redirect(`/shipping?id_address_delivery=${result.insertId}`)

//     }
//    })
//   }
//   // else res.redirect('/address')
//   })
// })



router.post('/save-address', (req, res) => {
  let { firstname, lastname, usernumber, city, pincode, address, email,state } = req.body;

  // Validate required fields
  if (!firstname || !lastname || !usernumber || !city || !pincode || !address || !email) {
    return res.status(400).send('All fields are required.');
  }

  // Prepare data for the address table
  const addressData = {
    firstname,
    lastname,
    usernumber,
    city,
    pincode,
    address,
    state,
    email
  };

  // Prepare data for the users table
  const userData = {
    usernumber,
    email,
    firstname,
    lastname,
    city
  };

  // Insert into the address table
  pool.query(`INSERT INTO address SET ?`, addressData, (err, result) => {
    if (err) {
      console.error('Error inserting into address table:', err);
      return res.status(500).send('Internal server error while saving address.');
    }

    const addressInsertId = result.insertId;
    req.session.addressInsertId = addressInsertId

    // Insert into the users table
    pool.query(`select * from users where usernumber = '${req.body.usernumber}'`,(err,result)=>{
      if(err) throw err;
      else if(result.length>0){
        res.redirect(`/shipping?id_address_delivery=${addressInsertId}`);

      }
      else{
        pool.query(`INSERT INTO users SET ?`, userData, (err, result) => {
          if (err) {
            console.error('Error inserting into users table:', err);
            return res.status(500).send('Internal server error while saving user data.');
          }
    else{
          pool.query(`update cart set usernumber = '${req.body.usernumber}' where usernumber = '${req.session.ipaddress}'`,(err,result)=>{
            if(err) throw err;
            else{
              req.session.usernumber = usernumber;
              req.session.ipaddress = usernumber;
              res.redirect(`/shipping?id_address_delivery=${addressInsertId}`);
    
            }
          })
    
        }
    
          // Set the session usernumber
    
          // Redirect to the shipping page with the new address ID
        });
      }
    })
  
  });
});




// router.post('/save-myaddress',(req,res)=>{
//   let body = req.body;
  
//   pool.query(`insert into address set ?`,req.body , (err,result)=>{
//   if(err) throw err;
//   else{
//   //  result.insertId;
//  res.redirect(`/myaddress`)
//   }
//   // else res.redirect('/address')
//   })
// })


router.get('/delete-address',(req,res)=>{
  pool.query(`delete from address where id = '${req.query.id}'`,(err,result)=>{
    if(err) throw err;
    else res.redirect('/address')
  })
})


router.get('/cancel-orders',(req,res)=>{


  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();
  
  today = mm + '/' + dd + '/' + yyyy;

  pool.query(`select * from booking where id = '${req.query.id}'`,(err,result)=>{
    if(err) throw err;
    else {
        pool.query(`insert into alert(usernumber,status,orderid,date) values ('${result[0].usernumber}' , 'Cancel' , '${result[0].orderid}','${today}')`,(err,result)=>{
            if(err) throw err;
           else{
            pool.query(`update booking set status = 'Cancel' where id = '${req.query.id}'`,(err,result)=>{
              if(err) throw err;
              else res.redirect('/myorder')
            })
           }
        })
    }
})
 
})


router.get('/delete-myaddress',(req,res)=>{
  pool.query(`delete from address where id = '${req.query.id}'`,(err,result)=>{
    if(err) throw err;
    else res.redirect('/myaddress')
  })
})


router.get('/new-address',(req,res)=>{
  if(req.session.usernumber){
  var query = `select * from category order by id desc;`
  var query1 = `select * from users where usernumber = '${req.session.usernumber}';`
  var query6 = `select * from users where usernumber = '${req.session.usernumber}';`
    var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.usernumber}';`
    var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.usernumber}';`
  pool.query(query+query1+query6+query7+query8,(err,result)=>{
    if(err) throw err;
    else  res.render('new-address',{result:result,login:true})
  })
  
  }
  else{
    res.redirect('/login')
  }
})


router.get('/add-new-address',(req,res)=>{
  var query = `select * from category order by id desc;`
  var query1 = `select c.* , 
  (select p.name from product p where p.id = c.booking_id) as bookingname,
  (select p.image from product p where p.id = c.booking_id) as bookingimage,
     (select p.quantity from product_manage p where p.productid = c.booking_id and p.sizeid = c.size) as availablequantity


  
   from cart c where c.usernumber = '${req.session.usernumber}';`
 var query2 = `select sum(price) as totalprice from cart where usernumber = '${req.session.usernumber}';`              
 var query3 = `select sum(quantity) as counter from cart where usernumber = '${req.session.usernumber}';` 
 var query4 = `select * from address where usernumber = '${req.session.usernumber}';` 
 var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.ipaddress}';`
 var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.ipaddress}';`
 pool.query(query+query1+query2+query3+query4+query7+query8,(err,result)=>{
   if(err) throw err;
   else{
    res.render('address',{result:result,login:true})

   }

 })            

})





router.get('/edit-address',(req,res)=>{

  var query = `select * from category order by id desc;`
  var query1 = `select c.* , 
  (select p.name from product p where p.id = c.booking_id) as bookingname,
  (select p.image from product p where p.id = c.booking_id) as bookingimage,
     (select p.quantity from product_manage p where p.productid = c.booking_id and p.sizeid = c.size) as availablequantity


  
   from cart c where c.usernumber = '${req.session.usernumber}';`
 var query2 = `select sum(price) as totalprice from cart where usernumber = '${req.session.usernumber}';`              
 var query3 = `select sum(quantity) as counter from cart where usernumber = '${req.session.usernumber}';` 
 var query4 = `select * from address where usernumber = '${req.session.usernumber}';`
 var query5 = `select * from address where id = '${req.query.id}';` 
 var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.usernumber}';`
 var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.usernumber}';`
  pool.query(query+query1+query2+query3+query4+query5+query7+query8,(err,result)=>{
    if(err) throw err;
    else res.render('edit-address',{result:result,login:true})
  })
  
})




router.get('/update-address',(req,res)=>{
  var query = `select * from category order by id desc;`
  var query1 = `select * from address where id = '${req.query.id}';`
  var query6 = `select * from users where usernumber = '${req.session.usernumber}';`
    var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.usernumber}';`
    var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.usernumber}';`
  pool.query(query+query1+query6+query7+query8,(err,result)=>{
    if(err) throw err;
    else res.render('update-address',{result,login:true})
  })
  
})





router.post('/update-address', (req, res) => {
  console.log('data',req.body)
  pool.query(`update address set ? where id = ?`, [req.body, req.body.id], (err, result) => {
      if(err) {
          res.json({
              status:500,
              type : 'error',
              description:err
          })
      }
      else {
          res.redirect('/address')

          
      }
  })
})


router.post('/update-myaddress', (req, res) => {
  console.log('data',req.body)
  pool.query(`update address set ? where id = ?`, [req.body, req.body.id], (err, result) => {
      if(err) {
          res.json({
              status:500,
              type : 'error',
              description:err
          })
      }
      else {
          res.redirect('/myaddress')

          
      }
  })
})



router.get('/logout',(req,res)=>{
  req.session.usernumber = null;
  res.redirect('/')
})



router.post('/contact-us',(req,res)=>{
  let body = req.body;
  console.log(req.body)
  pool.query(`insert into contact set ?`,body,(err,result)=>{
    if(err) throw err;
    else {
      if(req.session.usernumber){
        var query = `select * from category order by id desc;`
        var query1 = `select * from category;`
        var query5 = `select * from users where usernumber = '${req.session.usernumber}';`
    
        var query6 = `select * from users where usernumber = '${req.session.usernumber}';`
        var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.usernumber}';`
        var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.usernumber}';`
        pool.query(query+query1+query5+query6+query7+query8,(err,result)=>{
          if(err) throw err;
          else  res.render('contact',{login:true,result,msg:'Your message has been successfully sent to our team.'})
        })
      }
      else{
        var query = `select * from category order by id desc;`
        var query1 = `select * from category;`
        pool.query(query+query1,(err,result)=>{
          if(err) throw err;
          else  res.render('contact',{login:false,result,msg:'Your message has been successfully sent to our team.'})
        })
      }
    }
  })
})


router.get('/contactus',(req,res)=>{
  if(req.session.usernumber){
    var query = `select * from category order by id desc;`
    var query1 = `select * from category;`
    var query5 = `select * from users where usernumber = '${req.session.usernumber}';`

    var query6 = `select * from users where usernumber = '${req.session.usernumber}';`
    var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.usernumber}';`
    var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.usernumber}';`
    pool.query(query+query1+query5+query6+query7+query8,(err,result)=>{
      if(err) throw err;
      else  res.render('contact',{login:true,result,msg:''})
    })
  }
  else{
    var query = `select * from category order by id desc;`
    var query1 = `select * from category;`
    var query5 = `select * from users where id = '84';`

    var query6 = `select * from users where id = '84';`
    var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.usernumber}';`
    var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.usernumber}';`
    pool.query(query+query1+query5+query6+query7+query8,(err,result)=>{
      if(err) throw err;
      else  res.render('contact',{login:false,result,msg:''});
    })
  }
 
})



router.get('/faq',(req,res)=>{
  if(req.session.usernumber){
    var query = `select * from category order by id desc;`
    var query1 = `select * from faq where type = 'General Question';`
    var query2 = `select * from faq where type = 'Wallet Question';`
    pool.query(query+query1+query2,(err,result)=>{
      if(err) throw err;
      else  res.render('faq',{login:true,result})
    })
  }
  else{
    var query = `select * from category order by id desc;`
    var query1 = `select * from faq where type = 'General Question';`
    var query2 = `select * from faq where type = 'Wallet Question';`
    pool.query(query+query1+query2,(err,result)=>{
      if(err) throw err;
      else  res.render('faq',{login:false,result})
    })
  }
 
})



router.post('/contactus/submit',(req,res)=>{
  let body = req.body;
  pool.query(`insert into contact set ?`,body,(err,result)=>{
    if(err) throw err;
    else
    {

      if(req.session.usernumber){
        var query = `select * from category order by id desc;`
        var query1 = `select * from category;`
        pool.query(query+query1,(err,result)=>{
          if(err) throw err;
          else  res.render('contact',{login:true,result,msg : 'Our Team Will Contact You Soon'})
        })
      }
      else{
        var query = `select * from category order by id desc;`
        var query1 = `select * from category;`
        pool.query(query+query1,(err,result)=>{
          if(err) throw err;
          else  res.render('contact',{login:false,result,msg : 'Our Team Will Contact You Soon'})
        })
      }

    } 

  })
})



router.post('/quename/submit',(req,res)=>{
  let body = req.body;
  pool.query(`insert into question set ?`,body,(err,result)=>{
    if(err) throw err;
    else res.json(result)
  })
})


// router.get('/invoice',(req,res)=>{
//   if(req.session.usernumber){
//     var query = `select * from category order by id desc;`
//     var query1 = `select c.*,
//     (select p.name from product p where p.id = c.booking_id) as bookingname,
//     (select p.image from product p where p.id = c.booking_id) as bookingimage,
//     (select u.email from users u where u.id = c.usernumber) as usermobilenumber,
//     (select a.address from address a where a.id = c.address ) as useraddress1,
//     (select a.city from address a where a.id = c.address ) as usercity



//     from booking c where c.orderid = '${req.query.orderid}';`
//     var query10= `select sum(price) as totalamount from booking where orderid = '${req.query.orderid}';`


//     var query2 = `select * from category where id = '${req.query.id}';`
//     var query6 = `select * from users where usernumber = '${req.session.usernumber}';`
//       var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.usernumber}';`
//       var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.usernumber}';`
//       var query9 = `select * from wishlist_name where usernumber = '${req.session.usernumber}';`


  
  
//     pool.query(query+query1+query2+query6+query7+query8+query9+query10,(err,result)=>{
//       if(err) throw err;
//        else res.render('invoice',{login:true,result,title:'Invoice'})
//       // else res.json(result)
//     })
//   }
//   else{
//     res.redirect('/login')
//   }
// })



router.get('/invoice',(req,res)=>{
  var query1 = `select c.*,
  (select p.name from product p where p.id = c.booking_id) as bookingname,
  (select p.image from product p where p.id = c.booking_id) as bookingimage,
  (select u.email from users u where u.id = c.usernumber) as usermobilenumber,
  (select a.address from address a where a.id = c.address ) as useraddress1,
  (select a.city from address a where a.id = c.address ) as usercity
  from booking c where c.orderid = '${req.query.orderid}';`
  var query2= `select sum(price) as totalamount from booking where orderid = '${req.query.orderid}';`
  pool.query(query1+query2,(err,result)=>{
    if(err) throw err;
    else res.render('invoice',{result})
  })
})



// router.get('/confirmation',fetchCartData,(req,res)=>{

//   // res.json(req.session)

//   if(req.session.usernumber){
//     var query = `select * from category order by id desc;`
//     var query1 = `select * from booking where number = '${req.session.usernumber}' order by id desc limit 1 ;`
//     var query2 = `select * from category where id = '${req.query.id}';`
//     var query6 = `select * from users where usernumber = '${req.session.usernumber}';`
//       var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.usernumber}';`
//       var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.usernumber}';`
//       var query9 = `select * from wishlist_name where usernumber = '${req.session.usernumber}';`
//       var query10 = `select * from coupon order by id desc limit 1;`
//       var query11 = `select p.* ,
//   (select m.net_amount from product_manage m where m.productid = p.id) as net_amount,
//   (select m.quantity from product_manage m where m.productid = p.id) as quantity

//   from product p order by p.id desc limit 2;`
//     pool.query(query+query1+query2+query6+query7+query8+query9+query10+query11,(err,result)=>{
//       if(err) throw err;
//       else res.render('confirmation',{result,login:true,orderid:req.session.orderid,title:'Confirmation',cartData:req.cartData});
//       // else res.json(result)
//     })
//   }
//   else {
//     res.redirect('/login')
//   }
// })



router.get('/confirmation', fetchCartData, (req, res) => {
  if (!req.session.usernumber) {
      return res.redirect('/login');
  }

  const userNumber = req.session.usernumber;
  const orderId = req.session.orderid;

  // Queries
  const query = `SELECT * FROM category ORDER BY id DESC;`;
  const query1 = `SELECT * FROM booking WHERE number = ? ORDER BY id DESC LIMIT 1;`;
  const query2 = `SELECT * FROM category WHERE id = ?;`;
  const query6 = `SELECT * FROM users WHERE usernumber = ?;`;
  const query7 = `SELECT SUM(quantity) AS counter FROM cart WHERE usernumber = ?;`;
  const query8 = `SELECT COUNT(id) AS counter FROM wishlist WHERE usernumber = ?;`;
  const query9 = `SELECT * FROM wishlist_name WHERE usernumber = ?;`;
  const query10 = `SELECT * FROM coupon ORDER BY id DESC LIMIT 1;`;
  const query11 = `
      SELECT p.*, 
          (SELECT m.net_amount FROM product_manage m WHERE m.productid = p.id) AS net_amount,
          (SELECT m.quantity FROM product_manage m WHERE m.productid = p.id) AS quantity
      FROM product p ORDER BY p.id DESC LIMIT 2;
  `;

  pool.query(query + query1 + query2 + query6 + query7 + query8 + query9 + query10 + query11, 
      [userNumber, req.query.id, userNumber, userNumber, userNumber, userNumber], 
      (err, result) => {
          if (err) throw err;

          // Extract necessary data
          const userData = result[3][0]; // Users table
          const orderData = result[1][0]; // Booking table

          if (!userData || !orderData) {
              return res.render('confirmation', { 
                  result, login: true, orderid: orderId, title: 'Confirmation', cartData: req.cartData 
              });
          }

          const userEmail = userData.email;
          const username = userData.firstname;
          const usernumber = userData.usernumber;
          const adminEmail = "amitali910@gmail.com"; // Change this to the admin's email
          const userSubject = emailTemplates.orderConfirmation.userSubject;
          const adminSubject = emailTemplates.adminOrderConfirmation.adminSubject;

          const userMessage = emailTemplates.orderConfirmation.userMessage(username, orderId, orderData.price);
          const adminMessage = emailTemplates.adminOrderConfirmation.adminMessage(username,orderId, orderData.price,usernumber);

          // Send emails in the background
          setImmediate(async () => {
              try {
                  // Send confirmation email to user
                  await verify.sendUserMail(userEmail, userSubject, userMessage);
                  console.log('Order confirmation email sent to:', userEmail);

                  // Send email to admin
                  await verify.sendUserMail(adminEmail, adminSubject, adminMessage);
                  console.log('Order details sent to admin:', adminEmail);

// admin message send
    const adminSMSSend = await sendFlowSMS({
      authkey: '439478ACHleixac56800ac1eP1',
      template_id: '680f6c76d6fc05238f0d6ac2',
      mobile: '918950094006',
      var1: orderId,
      var2:orderData.price,
      var3: 'info@fikaonline.in'
    });



    // user sms send

    const userSMSSend = await sendFlowSMS({
      authkey: '439478ACHleixac56800ac1eP1',
      template_id: '6806429bd6fc055238538ba2',
      mobile: 91+usernumber,
      var1: orderId,
      var2:orderData.price,
      var3: 'info@fikaonline.in'
    });



              } catch (emailError) {
                  console.error('Error sending order confirmation email:', emailError);
              }
          });

          res.render('confirmation', { 
              result, login: true, orderid: orderId, title: 'Confirmation', cartData: req.cartData 
          });
      }
  );
});









router.post('/add_wishlist',(req,res)=>{
  let body = req.body;
  body['usernumber'] = req.session.usernumber
  console.log(body)
  pool.query(`select * from wishlist where usernumber = '${req.session.usernumber}' and booking_id = '${req.body.booking_id}'`,(err,result)=>{
    
    
    if(err) throw err;
    else if(result[0]){
      res.json({msg:'The product already exists in your wishlist'})
      // pool.query(`update wishlist_name set quantity = quantity-1 where id = '${req.body.booking_id}'`,(err,result)=>{
      //   if(err) throw err;
      //   else res.json({msg:'The product already exists in your wishlist'})
      // })
      // res.json({msg : 'item removed'})
    }

    else{
  pool.query(`insert into wishlist set ?`,body,(err,result)=>{
    if(err) throw err;
    else res.json({msg:'The product was successfully added to your wishlist'})

    //  res.json({msg:'item success'})
  })
    }
  })

})




router.get('/signup',fetchCartData,(req,res)=>{
  var query = `select * from category order by id desc;`
  var query1 = `select * from website_customize where name = 'pp';`
  var query2 = `select * from website_customize where name = 'about';`

  var query6 = `select * from users where id = '84';`
  var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.usernumber}';`
  var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.usernumber}';`
    pool.query(query+query1+query2+query6+query7+query8,(err,result)=>{
        if(err) throw err;
        else res.render('signup',{msg : '' , login:false,result:result,cartData:req.cartData})
        // else res.json(result)
    })
  

})


router.get('/view-wishlist',fetchCartData,(req,res)=>{
console.log('ss',req.session.usernumber)
if(req.session.usernumber){


var query = `select * from category order by id desc;`
  var query1 = `select * from website_customize where name = 'pp';`
  var query2 = `select * from users where usernumber = '${req.session.usernumber}';`

  var query6 = `select * from users where usernumber = '${req.session.usernumber}';`
  var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.usernumber}';`
  var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.usernumber}';`




  var query9=`select w.*,
  (select p.name from product p where p.id = w.booking_id) as productname,
  (select p.image from product p where p.id = w.booking_id) as productimage,
  (select m.net_amount from product_manage m where m.productid = w.booking_id) as productnetamount,
  (select m.quantity from product_manage m where m.productid = w.booking_id) as productquantity,
  (select m.discount from product_manage m where m.productid = w.booking_id) as productdiscount,
  (select m.price from product_manage m where m.productid = w.booking_id) as productprice,

  (select p.categoryid from product p where p.id = w.booking_id) as productcategoryid

  from wishlist w where w.usernumber = '${req.session.usernumber}';`
  var query10 = `select * from wishlist_name where usernumber = '${req.session.usernumber}' and id!= '${req.query.id}';`
  var query11 = `select * from wishlist_name where id = '${req.query.id}';`

    pool.query(query+query1+query2+query6+query7+query8+query9+query10+query11,(err,result)=>{
    if(err) throw err;
    // else res.json(result)
    
    else res.render('view-wishlist',{result:result,login:true,title:'Wishlist',cartData:req.cartData})
 
  })
}
else{
  res.redirect('/login')
}
})










router.get('/contact-report',(req,res)=>{
  pool.query(`select * from contact order by id desc`,(err,result)=>{
    if(err) throw err;
    else res.render('contact-report',{result})
  })
})





router.get('/celebrity',(req,res)=>{
  // console.log(req.session.ipaddress)
  if(req.session.usernumber){
    var query = `select * from category order by id desc;`
    var query1 = `select * from photoshot order by id desc;`
    var query2 = `select * from photoshot;`

    var query6 = `select * from users where usernumber = '${req.session.usernumber}';`
      var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.usernumber}';`
      var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.usernumber}';`
      var query9 = `select * from wishlist_name where usernumber = '${req.session.usernumber}';`
      
  
  
    pool.query(query+query1+query2+query6+query7+query8+query9,(err,result)=>{
      if(err) throw err;
      else if(result[1][0]) res.render('celebrity-list',{result:result,login:true,title:'Celebrity Closet'})
      else  res.render('celebrity-list',{result,login:true,title:'Celebrity Closet'})
    })
  }
  else{
    var query = `select * from category order by id desc;`
        var query1 = `select * from photoshot order by id desc;`
        var query2 = `select * from photoshot;`
       var query6 = `select * from users where id = '84';`
      var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.ipaddress}';`
      var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.ipaddress}';`
      var query9 = `select * from wishlist_name where usernumber = '${req.session.usernumber}';`
  
  
    pool.query(query+query1+query2+query6+query7+query8+query9,(err,result)=>{
       if(err) throw err;
      else if(result[1][0]) res.render('celebrity-list',{result:result,login:false,title:'Celebrity Closet'})
      else  res.render('celebrity-list',{result,login:false,title:'Celebrity Closet'})
    })
  }
  
    
   
  })












  router.get('/celebrity-details',(req,res)=>{
   
      
    
       
    
        if(req.session.usernumber){
          var query = `select * from category order by id desc;`
          var query1 = `select p.* from photoshot p where p.id = '${req.query.id}';`
         var query2 = `select * from photoshot p where p.id!= '${req.query.id}';`
         var query6 = `select * from users where usernumber = '${req.session.usernumber}';`
         var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.usernumber}';`
         var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.usernumber}';`
         var query9 = `select * from wishlist_name where usernumber = '${req.session.usernumber}';`
          pool.query(query+query1+query2+query6+query7+query8+query9,(err,result)=>{
            if(err) throw err;
            else res.render('celebrity-details', { title: 'Express',login:true, result : result,title:result[1][0].name});
          })
          
      
        }
        else{
          var query = `select * from category order by id desc;`
          var query1 = `select p.* from photoshot p where p.id = '${req.query.id}';`
         var query2 = `select * from photoshot p where p.id!= '${req.query.id}';`
         var query6 = `select * from users where id = '84';`
         var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.ipaddress}';`
         var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.ipaddress}';`
         var query9 = `select * from wishlist_name where usernumber = '${req.session.usernumber}';`

    
          pool.query(query+query1+query2+query6+query7+query8+query9,(err,result)=>{
            if(err) throw err;
            else res.render('celebrity-details', { title: 'Express',login:false , result : result,result : result,title:result[1][0].name});
      
          })
      
        }
    
    
    })






    router.get('/blogs',(req,res)=>{
      // console.log(req.session.usernumber)
      if(req.session.usernumber){
        var query = `select * from category order by id desc;`
        var query1 = `select * from blog order by id desc;`
        var query2 = `select * from category where id = '${req.query.id}';`
        var query6 = `select * from users where usernumber = '${req.session.usernumber}';`
          var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.usernumber}';`
          var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.usernumber}';`
          var query9 = `select * from wishlist_name where usernumber = '${req.session.usernumber}';`
      
      
        pool.query(query+query1+query2+query6+query7+query8+query9,(err,result)=>{
          if(err) throw err;
          else if(result[1][0]) res.render('blogs',{result:result,login:true,title:'Editorial'})
          else  res.render('blogs',{result,login:true,title:'Editorial'})
        })
      }
      else{
        var query = `select * from category order by id desc;`
        var query1 = `select * from blog order by id desc;`

        var query2 = `select * from category where id = '${req.query.id}';`
        var query6 = `select * from users where id = '84';`
          var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.ipaddress}';`
          var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.ipaddress}';`
          var query9 = `select * from wishlist_name where usernumber = '${req.session.usernumber}';`
      
      
        pool.query(query+query1+query2+query6+query7+query8+query9,(err,result)=>{
           if(err) throw err;
          else if(result[1][0]) res.render('blogs',{result:result,login:false,title:'Editorial'})
          else  res.render('blogs',{result,login:false,title:'Editorial'})
        })
      }
      
        
       
      })









      router.get('/date-wise-report',(req,res)=>{
        if(req.session.adminid){
            res.render('date-wise-report')
           }
           else{
           res.redirect('/admin')
           }
    })
    


    router.get('/sales/report',(req,res)=>{
      pool.query(`select  b.* , (select p.name from product p where p.id = b.booking_id) as productname,
      (select u.email from users u where u.id = b.usernumber) as usermobilenumber,
      (select a.address from address a where a.id = b.address ) as useraddress1,
  (select a.city from address a where a.id = b.address ) as usercity,
  (select a.postcode from address a where a.id = b.address ) as userpostcode,
  (select a.id_state from address a where a.id = b.address ) as userstate,
  (select a.id_country from address a where a.id = b.address ) as usercountry
      
      from booking b where date between '${req.query.from_date}' and '${req.query.to_date}' order by id desc;`,(err,result)=>{
        if(err) throw err;
        else res.json(result);
      })
    })
    
 













    router.post('/helpdesk/insert',upload.single('helpdesk_attachment'),(req,res)=>{
      let body = req.body


      var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();

today = mm + '/' + dd + '/' + yyyy;


console.log(req.body)

if(req.file){
  body['helpdesk_attachment'] = req.file.filename;
}






        body['status'] = 'Online'
        body['date'] = today;
        console.log('body h',req.body)
      var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        var result = '';
        for ( var i = 0; i < 12; i++ ) {
          result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
      }
     ticket_number = result;
     body['ticket_number'] = ticket_number;
     body['usernumber'] = req.session.usernumber;


        pool.query(`insert into helpdesk set ?`,body,(err,result)=>{
          if(err) {
              console.log(err)
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
    



    router.get('/view-replied',(req,res)=>{
      var query = `select h.* ,
      (select u.firstname from users u where u.id = h.usernumber) as userfirstname,
        (select u.lastname from users u where u.id = h.usernumber) as userlasttname

      from helpdesk h where h.ticket_number = '${req.query.id}';`
      var query1 = `select * from replied where helpdeskid = '${req.query.id}' order by id desc;`
      pool.query(query+query1,(err,result)=>{
        if(err) throw err;
        else {
          res.render('replied_list',{result:result})
        }
      })
    })



    router.get('/view-helpdesk',(req,res)=>{

      var query = `select * from category order by id desc;`
      var query1 = `select * from helpdesk where ticket_number = '${req.query.id}';`
      var query2 = `select * from replied where helpdeskid = '${req.query.id}' order by id desc;`
      var query6 = `select * from users where usernumber = '${req.session.usernumber}';`
        var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.usernumber}';`
        var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.usernumber}';`
        var query9 = `select * from wishlist_name where usernumber = '${req.session.usernumber}';`
    
    
      pool.query(query+query1+query2+query6+query7+query8+query9,(err,result)=>{

        if(err) throw err;
        else {
          res.render('helpdesk_list',{result:result,title:'Helpdesk',login:true})
        }
      })
    })




    router.post('/replied', (req, res) => {
      let body = req.body

      var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();

today = mm + '/' + dd + '/' + yyyy;

body['update_date'] = today;



console.log(req.body)

pool.query(`insert into replied set ?`,body,(err,result)=>{
  if(err) {
    console.log(err)
    throw err;
  }
  else {
    console.log('ss',result)
    pool.query(`update helpdesk set update_date = '${today}' , status = 'Online' where ticket_number = '${req.body.helpdeskid}'`, (err, result) => {
      if(err) {
        console.log(err)
        throw err;
      }
      else {
          res.json({
              status:200,
              type : 'success',
              description:'successfully update'
          })
      }
  })

  }
})

    
                
  })







  router.get('/helpdesk-replied',(req,res)=>{
    var query = `select * from helpdesk where ticket_number = '${req.query.id}';`
    var query1 = `select * from replied where helpdeskid = '${req.query.id}';`
    pool.query(query+query1,(err,result)=>{
      if(err) throw err;
      else {
        
        res.render('helpdesk-list',{result:result})
      
      }
    })
  })






  router.get('/shop/all-collections/filter',(req,res)=>{

    if(req.session.usernumber){
      var query = `select * from category order by id desc;`

 if(req.query.filter == 'high-to-low') {
  var query1 = `select p.* ,
  (select m.net_amount from product_manage m where m.productid = p.id and m.sizeid = 'S') as net_amount,
  (select m.quantity from product_manage m where m.productid = p.id and m.sizeid = 'S') as quantity

  from product p where (select m.net_amount from product_manage m where m.productid = p.id and m.sizeid = 'S') is not null
  order by (select m.net_amount from product_manage m where m.productid = p.id and m.sizeid = 'S') 
  ;`
  
 }
 else if(req.query.filter=='low-to-high'){

  var query1 = `select p.* ,
  (select m.net_amount from product_manage m where m.productid = p.id and m.sizeid = 'S') as net_amount,
  (select m.quantity from product_manage m where m.productid = p.id and m.sizeid = 'S') as quantity

  from product p where (select m.net_amount from product_manage m where m.productid = p.id and m.sizeid = 'S') is not null
  order by (select m.net_amount from product_manage m where m.productid = p.id and m.sizeid = 'S') desc
  ;`


 }
 else if(req.query.filter=='z-to-a'){
  var query1 = `select p.* ,
  (select m.net_amount from product_manage m where m.productid = p.id and m.sizeid = 'S') as net_amount,
  (select m.quantity from product_manage m where m.productid = p.id and m.sizeid = 'S') as quantity

  from product p where (select m.net_amount from product_manage m where m.productid = p.id and m.sizeid = 'S') is not null
  order by name 
  ;`
}
else if(req.query.filter=='a-to-z'){
  var query1 = `select p.* ,
  (select m.net_amount from product_manage m where m.productid = p.id and m.sizeid = 'S') as net_amount,
  (select m.quantity from product_manage m where m.productid = p.id and m.sizeid = 'S') as quantity

  from product p where (select m.net_amount from product_manage m where m.productid = p.id and m.sizeid = 'S') is not null
  order by name desc
  ;`
}
else if(req.query.filter=='Best Sellers'){
  var query1 = `select p.* ,
  (select m.net_amount from product_manage m where m.productid = p.id and m.sizeid = 'S') as net_amount,
  (select m.quantity from product_manage m where m.productid = p.id and m.sizeid = 'S') as quantity

  from product p where (select m.net_amount from product_manage m where m.productid = p.id and m.sizeid = 'S') is not null
  and type='Best Sellers'

  ;`
}


   
     
      var query2 = `select * from category where id = '${req.query.id}';`
      var query6 = `select * from users where usernumber = '${req.session.usernumber}';`
      var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.usernumber}';`
      var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.usernumber}';`
      var query9 = `select * from wishlist_name where usernumber = '${req.session.usernumber}';`
  
    
      pool.query(query+query1+query2+query6+query7+query8+query9,(err,result)=>{
        if(err) throw err;
        else if(result[1][0]) res.render('all-shop',{result:result,login:true,title:'All Collections'})
        else  res.render('all-shop',{result,login:true,title:'All Collections'})
      })
    }
    else{
      var query = `select * from category order by id desc;`
      var query1 = `select p.* ,
      (select m.net_amount from product_manage m where m.productid = p.id and m.sizeid = 'S') as net_amount,
      (select m.quantity from product_manage m where m.productid = p.id and m.sizeid = 'S') as quantity
    
      from product p where (select m.net_amount from product_manage m where m.productid = p.id and m.sizeid = 'S') is not null;`
      
      var query2 = `select * from category where id = '${req.query.id}';`
      var query6 = `select * from users where id = '84';`
      var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.ipaddress}';`
      var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.ipaddress}';`
      var query9 = `select * from wishlist_name where usernumber = '${req.session.usernumber}';`
  
  
      pool.query(query+query1+query2+query6+query7+query8+query9,(err,result)=>{
         if(err) throw err;
        else if(result[1][0]) res.render('all-shop',{result:result,login:false,title:'All Collections'})
        else  res.render('all-shop',{result,login:false,title:'All Collections'})
      })
    }
    
      
     
    })





    router.get('/support/update', (req, res) => {
      console.log(req.body)
    
                  pool.query(`update helpdesk set ? where id = ?`, [req.query, req.query.id], (err, result) => {
                      if(err) throw err;
                      else {
                          res.redirect('/admin/support')
                      }
                  })
          
  }) 





router.get('/password-recovery',(req,res)=>{
  var query = `select * from category order by id desc;`
  var query1 = `select p.* ,
  (select m.net_amount from product_manage m where m.productid = p.id and m.sizeid = 'S') as net_amount,
  (select m.quantity from product_manage m where m.productid = p.id and m.sizeid = 'S') as quantity

  from product p where p.categoryid = '${req.query.id}' and (select m.net_amount from product_manage m where m.productid = p.id and m.sizeid = 'S') is not null;`
  var query2 = `select * from category where id = '${req.query.id}';`
  var query6 = `select * from users where id = '84';`
    var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.ipaddress}';`
    var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.ipaddress}';`
    var query9 = `select * from wishlist_name where usernumber = '${req.session.usernumber}';`


  pool.query(query+query1+query2+query6+query7+query8+query9,(err,result)=>{
    if(err) throw err;
    else {
      res.render('recovery',{result:result,login:false,title:'Recovery Password',msg:'',type:''})
    }
})

})




router.post('/password-recovery',(req,res)=>{
  let body = req.body;
  console.log(req.body)
  pool.query(`select * from users where email = '${req.body.email}'`,(err,result)=>{
    if(err) throw err;
    else if(result[0]){

      req.session.forgotemail = req.body.email;

      var salt = bcrypt.genSaltSync(10);
      var hash = bcrypt.hashSync(`${req.body.email}/\/`, salt);
      var reset_token = bcrypt.hashSync(`${hash}/\/`, salt);
          
      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'leffetbysm@gmail.com',
          pass: 'leffet20'
        }
      });
      
      var mailOptions = {
        from: 'leffetbysm@gmail.com',
        to: req.body.email,
        subject: `Password Change Request`,
        text: `You Have requested to reset your leffet login details Please note that this will change your current Password

        In order to confirm this action, kindly click on the following link.

        http://demo4.in/new-password?token=${hash}&email=${req.body.email}&reset_token=${reset_token}


        `
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          


          var query = `select * from category order by id desc;`
          var query1 = `select p.* ,
          (select m.net_amount from product_manage m where m.productid = p.id and m.sizeid = 'S') as net_amount,
          (select m.quantity from product_manage m where m.productid = p.id and m.sizeid = 'S') as quantity
        
          from product p where p.categoryid = '${req.query.id}' and (select m.net_amount from product_manage m where m.productid = p.id and m.sizeid = 'S') is not null;`
          var query2 = `select * from category where id = '${req.query.id}';`
          var query6 = `select * from users where id = '84';`
            var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.ipaddress}';`
            var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.ipaddress}';`
            var query9 = `select * from wishlist_name where usernumber = '${req.session.usernumber}';`
        
        
          pool.query(query+query1+query2+query6+query7+query8+query9,(err,result)=>{
            if(err) throw err;
            else {
              res.render('recovery',{result:result,login:false,title:'Recovery Password',msg:req.body.email,type:'success'})
            }
        })


        } else {


          var query = `select * from category order by id desc;`
  var query1 = `select p.* ,
  (select m.net_amount from product_manage m where m.productid = p.id and m.sizeid = 'S') as net_amount,
  (select m.quantity from product_manage m where m.productid = p.id and m.sizeid = 'S') as quantity

  from product p where p.categoryid = '${req.query.id}' and (select m.net_amount from product_manage m where m.productid = p.id and m.sizeid = 'S') is not null;`
  var query2 = `select * from category where id = '${req.query.id}';`
  var query6 = `select * from users where id = '84';`
    var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.ipaddress}';`
    var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.ipaddress}';`
    var query9 = `select * from wishlist_name where usernumber = '${req.session.usernumber}';`


  pool.query(query+query1+query2+query6+query7+query8+query9,(err,result)=>{
    if(err) throw err;
    else {
      res.render('recovery',{result:result,login:false,title:'Recovery Password',msg:req.body.email,type:'success'})
    }
})
         
        }
      });


    }
    else{
      var query = `select * from category order by id desc;`
  var query1 = `select p.* ,
  (select m.net_amount from product_manage m where m.productid = p.id and m.sizeid = 'S') as net_amount,
  (select m.quantity from product_manage m where m.productid = p.id and m.sizeid = 'S') as quantity

  from product p where p.categoryid = '${req.query.id}' and (select m.net_amount from product_manage m where m.productid = p.id and m.sizeid = 'S') is not null;`
  var query2 = `select * from category where id = '${req.query.id}';`
  var query6 = `select * from users where id = '84';`
    var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.ipaddress}';`
    var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.ipaddress}';`
    var query9 = `select * from wishlist_name where usernumber = '${req.session.usernumber}';`


  pool.query(query+query1+query2+query6+query7+query8+query9,(err,result)=>{
    if(err) throw err;
    else {
      res.render('recovery',{result:result,login:false,title:'Recovery Password',msg:'Email ID Not Exists',type:''})
    }
})
    }
  })
})



router.get('/new-password',(req,res)=>{
 
  // var salt = bcrypt.genSaltSync(10);
 
  // var hash = bcrypt.hashSync(`${req.session.forgotemail}/\/`, req.query.token);

  // var a = bcrypt.compareSync(`${req.session.forgotemail}/\/`, hash); // true
// var b = bcrypt.compareSync(a, hash); // false

// console.log(a)
// res.json(a)
// console.log(b)


// if(a == true && b == true){
  var query = `select * from category order by id desc;`
  var query1 = `select p.* ,
  (select m.net_amount from product_manage m where m.productid = p.id and m.sizeid = 'S') as net_amount,
  (select m.quantity from product_manage m where m.productid = p.id and m.sizeid = 'S') as quantity

  from product p where p.categoryid = '${req.query.id}' and (select m.net_amount from product_manage m where m.productid = p.id and m.sizeid = 'S') is not null;`
  var query2 = `select * from category where id = '${req.query.id}';`
  var query6 = `select * from users where id = '84';`
    var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.ipaddress}';`
    var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.ipaddress}';`
    var query9 = `select * from wishlist_name where usernumber = '${req.session.usernumber}';`


  pool.query(query+query1+query2+query6+query7+query8+query9,(err,result)=>{
    if(err) throw err;
    else {
      res.render('password',{result:result,login:false,title:'New Password',msg:req.session.forgotemail,type:''})
    }
})
// }
// else{
    

//   var query = `select * from category order by id desc;`
//   var query1 = `select p.* ,
//   (select m.net_amount from product_manage m where m.productid = p.id and m.sizeid = 'S') as net_amount,
//   (select m.quantity from product_manage m where m.productid = p.id and m.sizeid = 'S') as quantity

//   from product p where p.categoryid = '${req.query.id}' and (select m.net_amount from product_manage m where m.productid = p.id and m.sizeid = 'S') is not null;`
//   var query2 = `select * from category where id = '${req.query.id}';`
//   var query6 = `select * from users where id = '84';`
//     var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.ipaddress}';`
//     var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.ipaddress}';`
//     var query9 = `select * from wishlist_name where usernumber = '${req.session.usernumber}';`


//   pool.query(query+query1+query2+query6+query7+query8+query9,(err,result)=>{
//     if(err) throw err;
//     else {
//       res.render('recovery',{result:result,login:false,title:'Recovery Password',msg:'Token Expired',type:''})
//     }
// })


// }

  

})


router.post('/change-password',(req,res)=>{
  let body = req.body;
  pool.query(`update users set password = '${req.body.password}' where email = '${req.session.forgotemail}'`,(err,result)=>{
    if(err) throw err;
    else {
      
      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'leffetbysm@gmail.com',
          pass: 'leffet20'
        }
      });
      
      var mailOptions = {
        from: 'leffetbysm@gmail.com',
        to: req.session.forgotemail,
        subject: 'Your password has been successfully updated.',
        text: `
        Hii ${req.session.forgotemail}
      
      
        Your password has been successfully updated.
        `
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          res.redirect('/login')

        } else {
          res.redirect('/login')
        }
      });
    
    }

  })

})



router.post('/update-password',(req,res)=>{
  pool.query(`select * from users where usernumber = '${req.session.usernumber}' and password = '${req.body.password}'`,(err,result)=>{
    if(err) throw err;
    else if(result.length>0){
      pool.query(`update users set password = '${req.body.new_password}' where usernumber = '${req.session.usernumber}'`,(err,result)=>{
        if(err) throw err;
        else {
          res.redirect(`/myaccount?msg=Password Successfully Updated&color=green`)
        }
      })
    }
    else{
      res.redirect('/myaccount?msg=Password Not Match&color=red')
    }
  })
})



router.post('/save-myaddress',(req,res)=>{
  let body = req.body;
  body["usernumber"] = req.session.usernumber;
  pool.query(`insert into address set ?`,body,(err,result)=>{
    if(err) throw err;
    else res.redirect('/myaddress?msg=Saved Successfully')
  })
})






// Submit Replacement Request
router.post("/submit-replacement", upload.single("video"), (req, res) => {
  const { orderId, issue, productId } = req.body;
  const videoPath = req.file ? req.file.path : null;

  if (!videoPath) {
    return res.status(400).json({ message: "Video is required" });
  }

  // Check if replacement request already exists
  const checkQuery = `SELECT * FROM replacements WHERE order_id = ? AND product_id = ?`;

  pool.query(checkQuery, [orderId, productId], (err, results) => {
    if (err) {
      console.error("Error checking existing replacement:", err);
      return res.status(500).json({ message: "Error checking replacement request" });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: "Replacement request already exists" });
    }

    // Insert replacement request into the database
    const insertQuery = `INSERT INTO replacements (order_id, video, issue, status, product_id) VALUES (?, ?, ?, ?, ?)`;
    const updateQuery = `UPDATE booking SET status = 'replacement' WHERE id = ? AND booking_id = ?`;

    pool.query(insertQuery, [orderId, videoPath, issue, "Pending", productId], (err, result) => {
      if (err) {
        console.error("Error inserting replacement:", err);
        return res.status(500).json({ message: "Error submitting replacement" });
      }

      // If insertion is successful, update booking status
      pool.query(updateQuery, [orderId, productId], (err) => {
        if (err) {
          console.error("Error updating booking status:", err);
          return res.status(500).json({ message: "Error updating booking status" });
        }

        res.json({ message: "Replacement request submitted successfully" });
      });
    });
  });
});

// Submit Review
router.post("/submit-review", (req, res) => {
  const { orderId, rating, review, productId } = req.body;

  // Check if review already exists
  const checkQuery = `SELECT * FROM reviews WHERE order_id = ? AND product_id = ?`;

  pool.query(checkQuery, [orderId, productId], (err, results) => {
    if (err) {
      console.error("Error checking existing review:", err);
      return res.status(500).json({ message: "Error checking review" });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: "Review already exists" });
    }

    // Insert new review
    const insertQuery = `INSERT INTO reviews (order_id, rating, review, product_id) VALUES (?, ?, ?, ?)`;

    pool.query(insertQuery, [orderId, rating, review, productId], (err) => {
      if (err) {
        console.error("Error inserting review:", err);
        return res.status(500).json({ message: "Error submitting review" });
      }

      res.json({ message: "Review submitted successfully" });
    });
  });
});





router.post("/accept-replacement", async (req, res) => {
  const { orderId, productId } = req.body;
  console.log(req.body);

  try {
    // Update status in replacements table
    await queryAsync(
      `UPDATE replacements SET status = 'Accepted' WHERE order_id = ? AND product_id = ?`,
      [orderId, productId]
    );

    // Update status in booking table
    await queryAsync(
      `UPDATE booking SET status = 'replacement accept' WHERE id = ? AND booking_id = ?`,
      [orderId, productId]
    );

    // Fetch booking details based on orderId and payment method 'prepaid'
    const bookingResult = await queryAsync(
      `SELECT b.*, 
      (select p.name from product p where p.id = b.booking_id) as productname,
      (select p.sku from product p where p.id = b.booking_id) as product_sku

      FROM booking b WHERE id = ?`,
      [orderId]
    );

    console.log("bookingResult", bookingResult);

    if (!bookingResult.length) {
      return res.status(404).json({ message: "No booking found with prepaid payment mode" });
    }

    const bookingData = bookingResult[0]; // Fetch first matching record

    const fullAddress = bookingData.address || "";
    const addressParts = fullAddress.split(",");
    
    // Extract pincode (last element)
    const billing_pincode = addressParts.length > 0 ? addressParts[addressParts.length - 1].trim() : "";
    
    // Extract state (second-last element)
    const billing_state = addressParts.length > 1 ? addressParts[addressParts.length - 2].trim() : "";
    
    // Extract city (third-last element)
    const billing_city = addressParts.length > 2 ? addressParts[addressParts.length - 3].trim() : "";
    
    // Remaining part is the main address
    const billing_address = addressParts.slice(0, addressParts.length - 3).join(",").trim();

    // Construct shippingOrderDetails using bookingData
    const shippingOrderDetails = {
      exchange_order_id: 'EXC'+bookingData.orderid,
      order_date: bookingData.order_date,
      seller_pickup_location_id: "4313057",
      seller_shipping_location_id:"4313057",
      return_order_id:'RTN'+bookingData.orderid,
      buyer_shipping_first_name: bookingData.name,
      buyer_shipping_last_name: "",
      buyer_shipping_address: billing_address,
      buyer_shipping_address_2: "",
      buyer_shipping_city: billing_city,
      buyer_shipping_pincode: billing_pincode,
      buyer_shipping_state: billing_state,
      buyer_shipping_country: "India",
      buyer_shipping_email: bookingData.email || "",
      buyer_shipping_phone: bookingData.number,



      buyer_pickup_first_name: bookingData.name,
      buyer_pickup_last_name: "",
      buyer_pickup_address: billing_address,
      buyer_pickup_address_2: "",
      buyer_pickup_city: billing_city,
      buyer_pickup_pincode: billing_pincode,
      buyer_pickup_state: billing_state,
      buyer_pickup_country: "India",
      buyer_pickup_email: bookingData.email || "",
      buyer_pickup_phone: bookingData.number,


      // shipping_is_billing: true,
      order_items: [
        {
          name: bookingData.productname || "Unknown",
          sku: bookingData.product_sku || "SKU-20250402125200046",
          units: bookingData.quantity,
          selling_price: bookingData.price,
          hsn:bookingData.hsn || "123654789",
          exchange_item_name:bookingData.productname || "Unknown",
          exchange_item_sku: bookingData.product_sku || "SKU-20250402125200046",

        },
      ],
      payment_method: "Prepaid",
      shipping_charges: 0,
      sub_total: bookingData.price * bookingData.quantity,
      return_length: 10,
      return_breadth: 10,
      return_height: 10,
      return_weight: 1.0,
      exchange_length: 10,
      exchange_breadth: 10,
      exchange_height: 10,
      exchange_weight: 1.0,
      return_reason:'29',
      channel_id:"3296358"
    };

    console.log("shippingOrderDetails", shippingOrderDetails);

    // Create shipping order
    const token = await deliveryApi.shippingAuthLogin();
    const shippingResponse = await deliveryApi.createReplacementOrder(shippingOrderDetails, token);
    console.log("Shipping Order Response:", shippingResponse);

    res.json({ message: "Replacement request accepted successfully!" });
  } catch (error) {
    console.error("Error processing replacement request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});



router.post("/reject-replacement", (req, res) => {
  const { orderId, productId } = req.body;

  console.log(req.body)

  pool.query(
    `UPDATE replacements SET status = 'Rejected' WHERE order_id = ? AND product_id = ?`,
    [orderId, productId],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Error updating status" });

      pool.query(
        `UPDATE booking SET status = 'replacement reject' WHERE id = ? AND booking_id = ?`,
        [orderId, productId],
        (err, result) => {
          if (err) return res.status(500).json({ message: "Error updating booking status" });
          res.json({ message: "Replacement request rejected successfully!" });
        }
      );
    }
  );
});



// Payment Gateway Pages



router.get("/api/search", async (req, res) => {
  const query = req.query.query;
  if (!query) return res.status(400).json({ message: "Query is required" });

  try {
    const results = await queryAsync(
      "SELECT * FROM product WHERE name LIKE ? OR description LIKE ?",
      [`%${query}%`, `%${query}%`]
    );
    res.json(results[0]); // Send the results
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});



module.exports = router;
