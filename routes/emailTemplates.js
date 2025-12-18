const emailTemplates = {
    newUser: {
        userSubject: 'Welcome to FIKA, 🎉 Your Shopping Journey Begins Now',
        userMessage: (username) => `
            <p>Hi ${username},</p>
            <p>Welcome to <strong>FIKA</strong> – your one-stop destination for quality products and an amazing shopping experience! 🛍️</p>
            <p>We are thrilled to have you on board. Here’s what you can look forward to:</p>
            <ul>
                <li>🌟 <strong>Exclusive Offers:</strong> Get access to amazing discounts and deals.</li>
                <li>🚀 <strong>Fast Delivery:</strong> Your orders reach you quickly and hassle-free.</li>
                <li>💳 <strong>Secure Payments:</strong> Safe and seamless payment options.</li>
            </ul>
            <p>Start exploring our collection now and enjoy shopping like never before!</p>
            <p>If you have any questions, feel free to reach out to our support team at <a href="mailto:info@fikaonline.in">info@fikaonline.in</a> or call us at <strong>+91-819-895-8764</strong>.</p>
            <p>Happy Shopping! 🛒</p>
            <p>Best Regards,</p>
            <p><strong>The FIKA Team</strong></p>
            <p><a href="https://fikaonline.in">https://fikaonline.in</a></p>
        `,
    },

    orderConfirmation: {
        userSubject: 'Order Confirmed! 🎉 Thank You for Shopping with FIKA',
        userMessage: (username, orderId, totalAmount) => `
            <p>Hi ${username},</p>
            <p>We’re excited to let you know that your order <strong>#${orderId}</strong> has been successfully placed! 🎊</p>
            <p><strong>Order Summary:</strong></p>
            <ul>
                <li>🛍️ <strong>Order ID:</strong> ${orderId}</li>
                <li>💰 <strong>Total Amount:</strong> Rs.${totalAmount}</li>
            </ul>
            <p>We will notify you once your order is shipped. You can track your order in your account.</p>
            <p>For any queries, contact us at <a href="mailto:info@fikaonline.in">info@fikaonline.in</a> or call <strong>+91-819-895-8764</strong>.</p>
            <p>Thank you for choosing FIKA! ❤️</p>
            <p>Best Regards,</p>
            <p><strong>The FIKA Team</strong></p>
            <p><a href="https://fikaonline.in">https://fikaonline.in</a></p>
        `,
    },

    orderDelivered: {
        userSubject: 'Your FIKA Order is Delivered! 🎁',
        userMessage: (username, orderId) => `
            <p>Hi ${username},</p>
            <p>Good news! Your order <strong>#${orderId}</strong> has been successfully delivered. 🎉</p>
            <p>We hope you love your purchase! If you have any feedback or issues, let us know.</p>
            <p>Need help? Contact our support at <a href="mailto:info@fikaonline.in">info@fikaonline.in</a> or call <strong>+91-819-895-8764</strong>.</p>
            <p>Enjoy your new purchase and shop again soon! 🛍️</p>
            <p>Best Regards,</p>
            <p><strong>The FIKA Team</strong></p>
            <p><a href="https://fikaonline.in">https://fikaonline.in</a></p>
        `,
    },

    forgotPassword: {
        userSubject: 'Reset Your Password – FIKA',
        userMessage: (username, newPassword) => `
            <p>Hi ${username},</p>
            <p>We received a request to reset your password. Here’s your new temporary password:</p>
            <p><strong>${newPassword}</strong></p>
            <p>Please log in and change your password for security reasons.</p>
            <p>If you didn’t request this, please contact our support immediately.</p>
            <p>Best Regards,</p>
            <p><strong>The FIKA Team</strong></p>
            <p><a href="https://fikaonline.in">https://fikaonline.in</a></p>
            <p><a href="mailto:info@fikaonline.in">info@fikaonline.in</a></p>
        `,
    },

    adminOrderConfirmation: {
        adminSubject: 'New Order Received',
        adminMessage: (username, orderId, totalAmount, customerNumber) => `
            <p>Hi Team,</p>
            <p>A new order has been placed on FIKA. Here are the details:</p>
            <ul>
                <li>👤 <strong>Customer Name:</strong> ${username}</li>
                <li>📦 <strong>Order ID:</strong> ${orderId}</li>
                <li>💰 <strong>Total Amount:</strong> Rs.${totalAmount}</li>
                <li>📞 <strong>Contact:</strong> ${customerNumber}</li>
            </ul>
            <p>Please process this order at the earliest.</p>
            <p>Best Regards,</p>
            <p><strong>The FIKA Team</strong></p>
            <p><a href="https://fikaonline.in">https://fikaonline.in</a></p>
        `,
    },
};

module.exports = emailTemplates;
