const express = require('express');
const router = express.Router();
const upload = require('./multer');
const pool = require('./pool');
const fs = require("fs");
const axios = require('axios');


// Define the data for authentication
const authData = JSON.stringify({
  email: "amitali910+dotpeapi@gmail.com",
  password: "SGJRMphYGSE#@#3"
});

// Function to authenticate and retrieve the token
async function shippingAuthLogin() {
    const config = {
      method: 'post',
      url: 'https://apiv2.shiprocket.in/v1/external/auth/login',
      headers: { 'Content-Type': 'application/json' },
      data: authData,
    };
  
    try {
      const response = await axios(config);
      return response.data.token; // Return the authentication token
    } catch (error) {
      console.error("Error during authentication:", error.message);
      throw error;
    }
  }

// Function to create an order
async function createShippingOrder(orderDetails, token) {
    const config = {
      method: 'post',
      url: 'https://apiv2.shiprocket.in/v1/external/orders/create/adhoc',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      data: JSON.stringify(orderDetails),
    };
  
    try {
      const response = await axios(config);
      console.error("Shipping order Response Return:", response.data);
      return response.data; // Return the Shiprocket order response
    } catch (error) {
      console.error("Error creating shipping order:", error.response.data);
      throw error;
    }
  }



  async function createReplacementOrder(orderDetails, token) {
    const config = {
      method: 'post',
      url: 'https://apiv2.shiprocket.in/v1/external/orders/create/exchange',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      data: JSON.stringify(orderDetails),
    };
  
    try {
      const response = await axios(config);
      console.error("Replacement order Response Return:", response.data);
      return response.data; // Return the Shiprocket order response
    } catch (error) {
      console.error("Error creating shipping order:", error.response.data);
      throw error;
    }
  }



  async function cancelOrders(token, orderIds) {
    try {
      const response = await axios.post(
        'https://apiv2.shiprocket.in/v1/external/orders/cancel',
        { ids: orderIds },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          maxBodyLength: Infinity,
        }
      );
  
      return response.data; // Return API response
    } catch (error) {
      console.error('Error canceling orders:', error.response ? error.response.data : error.message);
      throw error; // Throw error for handling in caller function
    }
  }
  


  module.exports =
   { createShippingOrder,
    shippingAuthLogin,
    cancelOrders ,
    createReplacementOrder
    }
