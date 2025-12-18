var express = require('express');
var router = express.Router();

const nodemailer = require('nodemailer');




// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
    host: 'smtpout.secureserver.net', // GoDaddy's SMTP server
    port: 465, // Secure port for SSL
    secure: true, // Use SSL
    auth: {
      user: 'info@fikaonline.in', // Your GoDaddy email address
      pass: 'Fika@1234', // Your GoDaddy email password
    },
  });
  




// Test email sending
// transporter.verify((error, success) => {
//     if (error) {
//         console.error('SMTP Connection Error:', error);
//     } else {
//         console.log('SMTP Server is Ready to Send Emails');
//     }
// });



// sendUserMail('jnaman345@gmail.com','done','hi')
  


    async function sendUserMail(email,subject,message) {
        try {
          console.log('Data Recieve',email); 
          console.log('Data Recieve',subject); 
          console.log('Data Recieve',message); 
    
          // Fetch recipients from an API (replace 'api_url' with your API endpoint)
          const recipients = email; // Assuming the API returns an array of recipients
      
          // Loop through recipients and send emails
       
      
              // console.log('recipients',recipients)
              try {
                const mailOptions = {
                  from: 'info@fikaonline.in',
                  to: email,
                  subject: subject,
                  html: `
                  <html>
                    <head>
                      <style>
                        body {
                          style="font-family: Georgia;
                          color: black;
                        }
                        strong {
                          font-weight: bold;
                        }
                      </style>
                    </head>
                    <body style="font-family: Georgia;color:'black'">
                      ${message}
                    </body>
                  </html>
                `,
              
                };
      
                // Send the email
                const info = await transporter.sendMail(mailOptions);
                console.log('information',info)
                console.log(`Email sent to ${email}: ${info.response}`);
              } catch (emailError) {
                console.error(`Error sending email to ${email}:`, emailError);
              }
            
          
        } catch (fetchError) {
          console.error('Error fetching recipients or sending emails:', fetchError);
        }
      }



      const https = require('https');

async function sendSMS(mobileNumber, var1, var2) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      template_id: '67ffa546d6fc054b9b61d3d2',
      short_url: 1, // 1 = On, 0 = Off
      short_url_expiry: 3600, // Optional
      realTimeResponse: 1, // Optional
      recipients: [
        {
          mobiles: mobileNumber,
          VAR1: var1,
          VAR2: var2
        }
      ]
    });

    const options = {
      method: 'POST',
      hostname: 'control.msg91.com',
      port: null,
      path: '/api/v5/flow',
      headers: {
        authkey: '439478ACHleixac56800ac1eP1',
        accept: 'application/json',
        'content-type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      const chunks = [];

      res.on('data', (chunk) => {
        chunks.push(chunk);
      });

      res.on('end', () => {
        const body = Buffer.concat(chunks).toString();
        try {
          const parsed = JSON.parse(body);
          console.log(`SMS Sent to ${mobileNumber}:`, parsed);
          resolve(parsed);
        } catch (e) {
          reject(`Error parsing response: ${body}`);
        }
      });
    });

    req.on('error', (e) => {
      console.error(`Request error: ${e.message}`);
      reject(e);
    });

    req.write(data);
    req.end();
  });
}




const axios = require('axios').default;

async function sendOTP({ mobile, template_id, authkey, params = {}, expiry = '', realTimeResponse = '' }) {
  try {
    const queryParams = {
      otp_expiry: expiry,
      template_id,
      mobile,
      authkey,
      realTimeResponse,
    };

    const payload = {
      ...params // Example: { "Param1": "value1", "Param2": "value2" }
    };

    const response = await axios({
      method: 'POST',
      url: 'https://control.msg91.com/api/v5/otp',
      params: queryParams,
      headers: {
        'Content-Type': 'application/json'
      },
      data: payload
    });

    console.log(`OTP sent to ${mobile}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error sending OTP to ${mobile}:`, error.response?.data || error.message);
    throw error;
  }
}


// (async () => {
//   try {
//     const result = await sendOTP({
//       mobile: '918877152035',
//       template_id: '67e2a1ead6fc057e796b6e56',
//       authkey: '439478ACHleixac56800ac1eP1',
//       expiry: '600', // Optional: seconds
//       realTimeResponse: '1', // Optional
     
//     });

//     console.log('OTP Response:', result);
//   } catch (err) {
//     console.error('Failed to send OTP:', err);
//   }
// })();



async function verifyOTP({ mobile, otp, authkey }) {
  try {
    const response = await axios({
      method: 'GET',
      url: 'https://control.msg91.com/api/v5/otp/verify',
      params: {
        otp,
        mobile
      },
      headers: {
        authkey
      }
    });

    console.log(`OTP verification result for ${mobile}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error verifying OTP for ${mobile}:`, error.response?.data || error.message);
    throw error;
  }
}


// (async () => {
//   try {
//     const result = await verifyOTP({
//       mobile: '918877152035',
//       otp: '2274',
//       authkey: '439478ACHleixac56800ac1eP1'
//     });

//     console.log('Verification Response:', result);
//   } catch (err) {
//     console.error('OTP Verification Failed:', err);
//   }
// })();




async function sendFlowSMS({
  authkey,
  template_id,
  mobile,
  var1,
  var2,
  var3,
  short_url = '1',              // 1 = On, 0 = Off (Optional)
  short_url_expiry = '',        // Expiry in seconds (Optional)
  realTimeResponse = '1'        // 1 = Enable response tracking (Optional)
}) {
  try {
    const response = await axios({
      method: 'POST',
      url: 'https://control.msg91.com/api/v5/flow',
      headers: {
        authkey,
        accept: 'application/json',
        'content-type': 'application/json'
      },
      data: {
        template_id,
        short_url,
        short_url_expiry,
        realTimeResponse,
        recipients: [
          {
            mobiles: mobile,
            var: var1,
            var1: var2,
            var2: var3

          }
        ]
      }
    });

    console.log(`SMS sent to ${mobile}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error sending SMS to ${mobile}:`, error.response?.data || error.message);
    throw error;
  }
}

// Final_Customer_Order_Delivery

// (async () => {
//   try {
//     const result = await sendFlowSMS({
//       authkey: '439478ACHleixac56800ac1eP1',
//       template_id: '6806429bd6fc055238538ba2',
//       mobile: '918877152035',
//       var1: 'JOJO',
//       var2:'ORDER45',
//       var3: 'info@fikaonline.in'
//     });

//     console.log('MSG91 Response:', result);
//   } catch (err) {
//     console.error('Failed to send SMS:', err);
//   }
// })();



// FIKA_ADMIN_ORDER_ALERT

// (async () => {
//   try {
//     const result = await sendFlowSMS({
//       authkey: '439478ACHleixac56800ac1eP1',
//       template_id: '680f6c76d6fc05238f0d6ac2',
//       mobile: '918319339945',
//       var1: 'ORder45',
//       var2:'500',
//       var3: 'info@fikaonline.in'
//     });

//     console.log('MSG91 Response:', result);
//   } catch (err) {
//     console.error('Failed to send SMS:', err);
//   }
// })();



// FIKA_WELCOME_USER

// (async () => {
//   try {
//     const result = await sendFlowSMS({
//       authkey: '439478ACHleixac56800ac1eP1',
//       template_id: '67ffa12ed6fc050c8023b355',
//       mobile: '918319339945',
//       var1: 'ORder45',
//       var2:'500',
//       var3: 'info@fikaonline.in'
//     });

//     console.log('MSG91 Response:', result);
//   } catch (err) {
//     console.error('Failed to send SMS:', err);
//   }
// })();


    module.exports = {
        sendUserMail,
        sendOTP,
        verifyOTP
    }