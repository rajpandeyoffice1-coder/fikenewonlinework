var express = require('express');
var router = express.Router();
var pool =  require('./pool');
const emailTemplates = require('./emailTemplates'); // Email templates
const verify = require('./verify'); 
const util = require("util");
const fetchCartData = require('./fetchCartData');


queryAsync = util.promisify(pool.query).bind(pool);





const generateRandomPassword = () => {
  return Math.random().toString(36).slice(-8); // Generates an 8-character random password
};



router.post('/forgot', async (req, res) => {
  const email = req.body.email;

  console.log('email:', email);

  if (!email) {
      return res.render('forgot', { msg: 'Please enter your email' });
  }

  try {
      // Check if the email exists in the database
      const user = await queryAsync(`SELECT * FROM users WHERE email = ? LIMIT 1`, [email]);

      if (!user) {
          return res.render('forgot', { msg: 'Email does not exist' });
      }

      const username = user.firstname; // Get user’s name
      const newPassword = generateRandomPassword(); // Generate random password

      // Update the user's password in the database (store in plain text as per your request)
      await queryAsync(`UPDATE users SET password = ? WHERE email = ?`, [newPassword, email]);

      // Send immediate response to the user (fast response)
      res.render('forgot', { msg: 'A new password has been sent to your email' });

      // Run email sending in the background
      setImmediate(async () => {
          try {
              // Get email template
              const userSubject = emailTemplates.forgotPassword.userSubject;
              const userMessage = emailTemplates.forgotPassword.userMessage(username, newPassword);

              // Send email
              await verify.sendUserMail(email, userSubject, userMessage);

              const fogotSMSSend = await sendFlowSMS({
                authkey: '439478ACHleixac56800ac1eP1',
                template_id: '680f6c76d6fc05238f0d6ac2',
                mobile: 91+user.usernumber,
                var1: username,
                var2:newPassword,
                var3: 'info@fikaonline.in'
              });


              console.log('Forgot password email sent to:', email);
          } catch (emailError) {
              console.error('Error sending forgot password email:', emailError);
          }
      });

  } catch (error) {
      console.error('Error in forgot password route:', error);
      return res.render('forgot', { msg: 'Something went wrong, please try again later' });
  }
});




router.get('/',fetchCartData,(req,res)=>{
  if(req.session.usernumber) {
    var query = `select * from category order by id desc;`
    var query1 = `select * from website_customize where name = 'pp';`
    var query2 = `select * from website_customize where name = 'about';`

    var query6 = `select * from users where usernumber = '${req.session.usernumber}';`
    var query7 = `select sum(quantity) as counter from cart where usernumber = '${req.session.usernumber}';`
    var query8 = `select count(id) as counter from wishlist where usernumber = '${req.session.usernumber}';`
    pool.query(query+query1+query2+query6+query7+query8,(err,result)=>{
      if(err) throw err;
     
      else res.render('login',{result,login:true,msg:'',title:'Privacy Ploicy',cartData:req.cartData})
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
      else res.render('login',{result,login:false,msg:'',title:'Privacy Ploicy',cartData:req.cartData})
    })
  }
})





router.get('/forgot',(req,res)=>{
  res.render('forgot',{msg : ''})
})





router.post('/verification',(req,res)=>{
    let body = req.body
    // body['number'] = 91+req.body.number
    req.session.numberverify = 91+req.body.number
    var otp =   Math.floor(100000 + Math.random() * 9000);
    req.session.reqotp = otp;
    res.render('otp',{msg : otp , anothermsg:''  })
    //   console.log(req.body)


    
   })




// router.post('/new-user',(req,res)=>{
//   let body = req.body;
//   if(req.body.otp == req.session.reqotp){
//     body['number'] = req.session.numberverify


//     var today = new Date();
// var dd = String(today.getDate()).padStart(2, '0');
// var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
// var yyyy = today.getFullYear();

// today = mm + '/' + dd + '/' + yyyy;

//     body['date'] = today;
  

// pool.query(`select * from users where number = '${req.session.numberverify}'`,(err,result)=>{
//   if(err) throw err;
//   else if(result[0]) {


//     if(req.session.page){
//   pool.query(`update cart set usernumber = '${req.session.numberverify}' where usernumber = '${req.session.ipaddress}'`,(err,result)=>{
//     if(err) throw err;
//     else {
//       req.session.usernumber = req.session.numberverify;
//       res.redirect('/checkout')
//     }
//   })
//     }
//     else {
//       req.session.usernumber = req.session.numberverify;
//       res.redirect('/')
//     }


//   }
//   else {

//     pool.query(`insert into users set ?`,body,(err,result)=>{
//       if(err) throw err;
//       else {
       





//         if(req.session.page){
//           pool.query(`update cart set usernumber = '${req.session.numberverify}' where usernumber = '${req.session.ipaddress}'`,(err,result)=>{
//             if(err) throw err;
//             else {
//               req.session.usernumber = req.session.numberverify;
//               res.redirect('/checkout')
//             }
//           })
//             } 
//             else {
//               req.session.usernumber = req.session.numberverify;
//               res.redirect('/')
//             }



//       }
//     })
//   }
// })



//   }
//   else{

//   res.render('otp',{msg : '' , anothermsg : 'Invalid Otp'})
    
//   }
// })



router.post('/new-user', (req, res) => {
  let body = req.body;
  // Get today's date
 

  pool.query(`SELECT * FROM users WHERE usernumber = ?`, [req.body.usernumber], (err, result) => {
      if (err) throw err;

      if (result.length > 0) {
        req.session.usernumber = body.usernumber
          
          if (req.session.page) {
              pool.query(`UPDATE cart SET usernumber = ? WHERE usernumber = ?`, 
                  [req.session.numberverify, req.session.ipaddress], 
                  (err) => {
                      if (err) throw err;
                      return res.redirect('/checkout');
                  }
              );
          } else {
              return res.redirect('/');
          }
      } else {
          // Insert new user
          pool.query(`INSERT INTO users SET ?`, body, (err) => {
            if (err) {
                console.error("Database Insertion Error:", err);
                return;
            }
        
            console.log("User inserted successfully, calling setImmediate...");
            req.session.usernumber = req.session.numberverify;
        
            // Send email in the background
            setImmediate(async () => {
                try {
                    console.log("Inside setImmediate - sending email...");
                    const userEmail = req.body.email;
                    const username = req.body.firstname;
        
                    if (!userEmail) {
                        console.error("Email is missing in request body.");
                        return;
                    }
        
                    console.log(`Sending email to: ${userEmail}`);
        
                    const userSubject = emailTemplates.newUser.userSubject;
                    const userMessage = emailTemplates.newUser.userMessage(username);
        
                    let mailResponse = await verify.sendUserMail(userEmail, userSubject, userMessage);



                    
// admin message send
    const newUserSMSSend = await sendFlowSMS({
        authkey: '439478ACHleixac56800ac1eP1',
        template_id: '680f6c76d6fc05238f0d6ac2',
        mobile: req.session.usernumber,
        var1: username,
        var2:userEmail,
        var3: 'info@fikaonline.in'
      });
  

                    console.log('New user email sent successfully:', mailResponse);
                } catch (emailError) {
                    console.error('Error sending new user email:', emailError);
                }
            });
        
            if (req.session.page) {
                pool.query(
                    `UPDATE cart SET usernumber = ? WHERE usernumber = ?`,
                    [req.session.numberverify, req.session.ipaddress],
                    (err) => {
                        if (err) throw err;
                        return res.redirect('/checkout');
                    }
                );
            } else {
              req.session.usernumber = body.usernumber
                return res.redirect('/');
            }
        });
        
      }
  });
});



module.exports = router;
