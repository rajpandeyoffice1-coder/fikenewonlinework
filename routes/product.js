var express = require('express');
var router = express.Router();
var upload = require('./multer');
var pool = require('./pool')
var table = 'product';


router.get('/',(req,res)=>{
    if(req.session.adminid){
    res.render('product')
    }
    else{
        res.render('admin_login',{msg:'Please Login First'})
    }
})


// router.post('/insert',upload.fields([{ name: 'image', maxCount: 1 }, { name: 'image1', maxCount: 1 },{ name: 'image2', maxCount: 1 },{ name: 'image3', maxCount: 1 }]) ,(req,res)=>{
// 	let body = req.body
//     if(req.files.image){
//         body['image'] = req.files.image[0].filename
      
//       }
      
        
//       if(req.files.image1){
//           body['image1'] = req.files.image1[0].filename
//         }
      
        
//       if(req.files.image2){
//           body['image2'] = req.files.image2[0].filename
//         }

//         if(req.files.image3){
//             body['image3'] = req.files.image3[0].filename
//           }
      

//     // console.log('files data',req.files)
//     let price = ''

//     // console.log('dta',req.body)
    



      

// console.log('body hai',req.body)



// pool.query(`select * from ${table} where name = '${req.body.name}'`,(err,result)=>{
//     if(err) throw err;
//     else if(result[0]){
//    res.json({
//        status : 300,
//        type:'exists',
//        description:'Category Already Exists'
//    })
//     }
//     else{
//         pool.query(`insert into ${table} set ?`,body,(err,result)=>{
//             if(err) {
//                 console.log('eroor',err)
//                 res.json({
//                     status:500,
//                     type : 'error',
//                     description:err
//                 })
//             }
//             else {
//                 res.json({
//                     status:200,
//                     type : 'success',
//                     description:'successfully added'
//                 })
//             }
//         })

//     }

// })
   

// })




router.post(
    '/insert',
    upload.fields([{ name: 'image', maxCount: 1 }, { name: 'image1', maxCount: 20 }]), 
    (req, res) => {
      let body = req.body;
  
      // Handle single image upload for 'image'
      if (req.files.image) {
        body['image'] = req.files.image[0].filename;
      }
  
      // Debug log the received data
      console.log('body data:', body);
      console.log('files data:', req.files);
  
      // Check if the category already exists
      pool.query(`SELECT * FROM ${table} WHERE name = ?`, [req.body.name], (err, result) => {
        if (err) {
          console.error('Database error:', err);
          res.json({
            status: 500,
            type: 'error',
            description: err.message,
          });
          return;
        }
  
        if (result[0]) {
          res.json({
            status: 300,
            type: 'exists',
            description: 'Category Already Exists',
          });
          return;
        }
  
        // Insert the product data
        pool.query(`INSERT INTO ${table} SET ?`, body, (err, productResult) => {
          if (err) {
            console.error('Insert error:', err);
            res.json({
              status: 500,
              type: 'error',
              description: err.message,
            });
            return;
          }
  
          const productId = productResult.insertId; // Get the ID of the inserted product
          console.log('Inserted product ID:', productId);
  
          // Insert multiple images into 'productimages' table
          if (req.files.image1) {
            const productImages = req.files.image1.map((file) => [productId, file.filename]);

            pool.query(
              `INSERT INTO productimages (productid, image) VALUES ?`,
              [productImages],
              (err) => {
                if (err) {
                  console.error('Error inserting product images:', err);
                  res.json({
                    status: 500,
                    type: 'error',
                    description: 'Error inserting product images',
                  });
                  return;
                }
  
                res.json({
                  status: 200,
                  type: 'success',
                  description: 'Product and images added successfully',
                });
              }
            );
          } else {
            res.json({
              status: 200,
              type: 'success',
              description: 'Product added successfully (no images provided)',
            });
          }
        });
      });
    }
  );
  



router.get('/all',(req,res)=>{
	pool.query(`select s.* , 
    (select c.name from category c where c.id = s.categoryid) as categoryname
   
     from ${table} s `,(err,result)=>{
		if(err) throw err;
        else res.json(result)
	})
})



router.get('/delete', (req, res) => {
    const { id } = req.query
    pool.query(`delete from ${table} where id = ${id}`, (err, result) => {
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

let body = req.body



    console.log('data',req.body)


    
    pool.query(`select * from ${table} where name='${req.body.name}'`,(err,result)=>{
        if(err) throw err;
        else if(result[0]){
            if(result[0].id != req.body.id){
                res.json({
                    status : 300,
                    type:'exists',
                    description:'Product Already Exists'
                })
            }
            else {
                pool.query(`update ${table} set ? where id = ?`, [req.body, req.body.id], (err, result) => {
                    if(err) throw err;
                    else {
                        res.json({
                            status:200,
                            type : 'success',
                            description:'successfully update'
                        })
                    }
                })
            }
           
        }
        else {
            pool.query(`update ${table} set ? where id = ?`, [req.body, req.body.id], (err, result) => {
                if(err) throw err;
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



router.post('/update_image',upload.fields([{ name: 'image', maxCount: 1 }, { name: 'image1', maxCount: 1 },{ name: 'image2', maxCount: 1 },{ name: 'image3', maxCount: 1 }]), (req, res) => {
    let body = req.body



    
 console.log('files data',req.files)

if(req.files.image){
    body['image'] = req.files.image[0].filename
  
  }
  
    
  if(req.files.image1){
      body['image1'] = req.files.image1[0].filename
    }
  
    
  if(req.files.image2){
      body['image2'] = req.files.image2[0].filename
    }


    if(req.files.image3){
        body['image3'] = req.files.image3[0].filename
      }
  

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
            res.redirect('/purchase-product')
        }
    })
})





// menu management


router.get('/manage',(req,res)=>{
    if(req.session.adminid){
    res.render('menu_manage')
    }
    else {
        res.render('admin_login',{msg:'Please Login First'})
    }
})



router.post('/menu/insert',(req,res)=>{
	let body = req.body
    
    if(req.body.discount == 0) {
        price = 0
      }
      else {
        price = ((req.body.price)*(req.body.discount))/100;

      }
      
        let net_price = (req.body.price)-price
        body['net_amount'] = Math.round(net_price);

console.log('ddghjg',req.body)

    pool.query(`select * from product_manage where productid = '${req.body.productid}' and sizeid = '${req.body.sizeid}'`,(err,result)=>{
        if(err) throw err;
        else if(result[0]){
            res.json({
                status : 300,
                type:'exists',
                description:'Product Size Already Exists'
            })
        }
        else{
            pool.query(`insert into product_manage set ?`,body,(err,result)=>{
                if(err) {
                    console.log('hidj',err)
                    res.json({
                        status:500,
                        type : 'error',
                        description:err
                    })
                }
                else {
                    console.log('hidj',result)
                    res.json({
                        status:200,
                        type : 'success',
                        description:'successfully added'
                    })
                }
            })
        }
    })


})



router.get('/menu/all',(req,res)=>{
	pool.query(`select s.* , 
    (select c.name from product c where c.id = s.productid) as productname,
    (select sub.name from size sub where sub.id = s.sizeid) as sizename
    from product_manage s order by id desc `,(err,result)=>{
		if(err) throw err;
        else res.json(result)
	})
})







router.get('/menu/delete', (req, res) => {
    const { id } = req.query
    pool.query(`delete from product_manage where id = ${id}`, (err, result) => {
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


router.post('/menu/update', (req, res) => {
    let body = req.body
    console.log(req.body)
    if(req.body.discount == 0) {
        price = 0
      }
      else {
        price = ((req.body.price)*(req.body.discount))/100;
      }
      
        let net_price = (req.body.price)-price
        body['net_amount'] = Math.round(net_price);
   //  body['net_amount'] = net_amount
    pool.query(`update product_manage set ? where id = ?`, [req.body, req.body.id], (err, result) => {
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
                description:'successfully update'
            })
        }
    })
})



router.get('/view-images',(req,res)=>{
    pool.query(`select * from productimages where productid = '${req.query.id}'`,(err,result)=>{
        if(err) throw err;
        else res.render('view_images',{result,id:req.query.id})
    })
})



router.post('/update-other-image', upload.single('image'), (req, res) => {
    const { id } = req.body; // Get the ID from the request body
    const image = req.file.filename; // Get the uploaded file's filename
  
    if (!id || !image) {
      return res.status(400).json({ message: 'Invalid request. ID and image are required.' });
    }
  
    // Update the database with the new image
    pool.query(
      'UPDATE productimages SET image = ? WHERE id = ?',
      [image, id],
      (err, result) => {
        if (err) {
          console.error('Error updating image:', err);
          return res.status(500).json({ message: 'Database error' });
        }
  
        res.json({ message: 'Image updated successfully', updatedImage: image });
      }
    );
  });



  router.post('/add-new-image', upload.fields([{ name: 'image', maxCount: 20 }]), async (req, res) => {
    let { productid } = req.body; // Get product ID from request

    console.log('body', req.body);
    console.log('files', req.files);

    // If productid is an array, take the first value
    if (Array.isArray(productid)) {
        productid = productid[0]; 
    }

    if (!req.files || !req.files.image || req.files.image.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
    }

    if (!productid) {
        return res.status(400).json({ error: 'Product ID is required' });
    }

    try {
        const mediaPaths = req.files.image.map(file => file.filename); // Extract filenames

        // Insert each image into the database
        for (const mediaPath of mediaPaths) {
            console.log('Inserting - Product ID:', productid, 'Image:', mediaPath);
            await pool.query('INSERT INTO productimages (productid, image) VALUES (?, ?)', [productid, mediaPath]);
        }

        res.json({ message: 'Upload successful', paths: mediaPaths });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Database error' });
    }
});



module.exports = router;