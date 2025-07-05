import frappe
from frappe import _
import json
import stripe
from frappe.utils import now_datetime

@frappe.whitelist(allow_guest=True)
def stripe_webhook():
    """Handle Stripe webhook for payment success"""
    try:
        # Get the webhook payload
        payload = frappe.request.get_data()
        sig_header = frappe.request.headers.get('stripe-signature')
        
        # Use hardcoded test keys for now
        secret_key = "sk_test_51RhUOz2NHM2ZzUvkLUNKOywCWbfUw9TGqgsqfdzh2CmOkyH0NWjcpNoN44sWHTmggJwNRb86BkKUyoM7qO6TKfAm00NrE0w3UL"
        endpoint_secret = None  # We'll handle webhook verification differently for now
        
        # Verify webhook signature (skip for now in development)
        try:
            if endpoint_secret:
                event = stripe.Webhook.construct_event(
                    payload, sig_header, endpoint_secret
                )
            else:
                # For development, just parse the JSON
                import json
                event = json.loads(payload.decode('utf-8'))
        except ValueError as e:
            frappe.log_error(f"Invalid payload: {str(e)}")
            return {"status": "error", "message": "Invalid payload"}
        except stripe.error.SignatureVerificationError as e:
            frappe.log_error(f"Invalid signature: {str(e)}")
            return {"status": "error", "message": "Invalid signature"}
        
        # Handle the event
        if event['type'] == 'payment_intent.succeeded':
            payment_intent = event['data']['object']
            handle_payment_success(payment_intent)
        elif event['type'] == 'payment_intent.payment_failed':
            payment_intent = event['data']['object']
            handle_payment_failure(payment_intent)
        else:
            frappe.log_error(f"Unhandled event type: {event['type']}")
        
        return {"status": "success"}
        
    except Exception as e:
        frappe.log_error(f"Stripe webhook error: {str(e)}")
        return {"status": "error", "message": str(e)}

def handle_payment_success(payment_intent):
    """Handle successful payment"""
    try:
        # Get metadata from payment intent
        metadata = payment_intent.get('metadata', {})
        reference_doctype = metadata.get('reference_doctype')
        reference_docname = metadata.get('reference_docname')
        
        if reference_doctype == "Assessment Result":
            # Process certificate renewal
            frappe.call({
                "method": "student_certificates.student_certificates.api.certificate_renewal.process_renewal_payment_success",
                "args": {
                    "certificate_name": reference_docname,
                    "payment_id": payment_intent['id'],
                    "amount": payment_intent['amount'] / 100  # Convert from cents
                }
            })
            
            frappe.log_error(f"Certificate renewal processed successfully for {reference_docname}")
        
    except Exception as e:
        frappe.log_error(f"Failed to process payment success: {str(e)}")

def handle_payment_failure(payment_intent):
    """Handle failed payment"""
    try:
        metadata = payment_intent.get('metadata', {})
        reference_doctype = metadata.get('reference_doctype')
        reference_docname = metadata.get('reference_docname')
        
        if reference_doctype == "Assessment Result":
            # Update certificate status to failed
            certificate = frappe.get_doc("Assessment Result", reference_docname)
            certificate.custom_renewal_status = "Not Renewed"
            certificate.save()
            
            frappe.log_error(f"Certificate renewal payment failed for {reference_docname}")
        
    except Exception as e:
        frappe.log_error(f"Failed to process payment failure: {str(e)}")

@frappe.whitelist()
def test_webhook():
    """Test webhook endpoint"""
    return {"status": "success", "message": "Webhook endpoint is working"} 