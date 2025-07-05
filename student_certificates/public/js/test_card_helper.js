// Test Card Helper for Development
// This script adds test card information to Stripe checkout pages

(function() {
    'use strict';
    
    // Check if we're in development mode
    function isDevelopment() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' || 
               window.location.hostname.indexOf('local') !== -1;
    }
    
    // Add test card information to the page
    function addTestCardInfo() {
        // Wait for the page to load
        setTimeout(function() {
            var paymentForm = document.getElementById('payment-form');
            if (paymentForm) {
                // Create test card info div
                var testCardDiv = document.createElement('div');
                testCardDiv.className = 'alert alert-info';
                testCardDiv.style.cssText = 'background-color: #d1ecf1; border-color: #bee5eb; color: #0c5460; padding: 12px; border-radius: 4px; margin-bottom: 20px;';
                testCardDiv.innerHTML = '<strong>Test Card Details:</strong><br>' +
                                      'Card Number: <code>4242 4242 4242 4242</code><br>' +
                                      'Expiry: <code>12/34</code><br>' +
                                      'CVC: <code>123</code>';
                
                // Insert before the form
                paymentForm.parentNode.insertBefore(testCardDiv, paymentForm);
            }
        }, 1000);
    }
    
    // Run only in development mode
    if (isDevelopment()) {
        // Add test card info when page loads
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', addTestCardInfo);
        } else {
            addTestCardInfo();
        }
    }
})(); 