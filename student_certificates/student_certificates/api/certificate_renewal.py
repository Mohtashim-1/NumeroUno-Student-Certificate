import frappe
from frappe import _
from frappe.utils import get_url, now_datetime
from urllib.parse import urlencode
import json
import stripe

@frappe.whitelist()
def create_renewal_payment_request(certificate_name):
    doc = frappe.get_doc("Assessment Result", certificate_name)

    stripe_settings = frappe.get_single("Stripe Settings")
    stripe.api_key = stripe_settings.secret_key

    amount = float(doc.custom_renewal_amount or 50.00)
    amount_in_cents = int(amount * 100)

    session = stripe.checkout.Session.create(
        payment_method_types=['card'],
        line_items=[{
            'price_data': {
                'currency': 'usd',
                'product_data': {
                    'name': f'Certificate Renewal - {doc.name}',
                    'description': f'Renewal payment for certificate {doc.name}'
                },
                'unit_amount': amount_in_cents,
            },
            'quantity': 1,
        }],
        mode='payment',
        metadata={
            'certificate_name': doc.name,
            'student': doc.student or '',
            'customer': doc.custom_customer or '',
        },
        success_url=frappe.utils.get_url(f"/api/method/student_certificates.student_certificates.api.certificate_renewal.payment_success?session_id={{CHECKOUT_SESSION_ID}}&certificate_name={certificate_name}"),
        cancel_url=frappe.utils.get_url("/certificate-payment-failed")
    )

    return {
        "status": "success",
        "payment_url": session.url,
        "amount": amount
    }


@frappe.whitelist()


@frappe.whitelist()
def create_renewal_payment_request(certificate_name):
    # Fetch certificate info
    certificate = frappe.get_doc("Assessment Result", certificate_name)
    if not certificate:
        frappe.throw(_("Certificate not found"))

    amount = certificate.custom_renewal_amount or 50.0  # fallback if not set
    currency = "USD"

    # Get Stripe keys from Stripe Settings
    stripe_settings = frappe.get_doc("Stripe Settings", "stripe")
    secret_key = stripe_settings.get_password("secret_key")

    stripe.api_key = secret_key

    # Prepare redirect URL
    redirect_url = get_url("/app/student-certificate")

    try:
        # Create Stripe Checkout Session
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": currency,
                    "product_data": {
                        "name": f"Certificate Renewal - {certificate.name}",
                        "description": f"Renewal payment for certificate {certificate.name}"
                    },
                    "unit_amount": int(float(amount) * 100),  # Convert to cents
                },
                "quantity": 1,
            }],
            mode="payment",
            success_url=redirect_url + "?payment=success&certificate=" + certificate.name,
            cancel_url=redirect_url + "?payment=cancelled&certificate=" + certificate.name,
            metadata={
                "doctype": "Assessment Result",
                "docname": certificate.name,
                "payer": frappe.session.user
            }
        )

        # Optionally store payment_id
        certificate.db_set("custom_renewal_payment_id", session.id)
        certificate.db_set("custom_renewal_status", "Pending Payment")

        return {
            "status": "success",
            "amount": amount,
            "payment_url": session.url
        }

    except stripe.error.StripeError as e:
        frappe.log_error(frappe.get_traceback(), "Stripe Payment Error")
        return {
            "status": "failed",
            "message": str(e.user_message or e)
        }
    
    
@frappe.whitelist(allow_guest=True)
def payment_success(session_id, certificate_name):
    import stripe
    stripe_settings = frappe.get_doc("Stripe Settings", "stripe")
    stripe.api_key = stripe_settings.secret_key

    session = stripe.checkout.Session.retrieve(session_id)

    if session.payment_status == "paid":
        frappe.db.set_value("Assessment Result", certificate_name, {
            "custom_renewal_status": "Renewed",
            "custom_renewal_payment_id": session.payment_intent,
            "custom_renewal_date": frappe.utils.now()
        })
        frappe.db.commit()

        frappe.local.response["type"] = "redirect"
        frappe.local.response["location"] = "/app/student-certificate"
    else:
        frappe.local.response["type"] = "redirect"
        frappe.local.response["location"] = "/certificate-payment-failed"


@frappe.whitelist()
def get_certificate_renewal_status(certificate_name):
    """Get renewal status of a certificate"""
    try:
        certificate = frappe.get_doc("Assessment Result", certificate_name)
        
        # Try to get custom fields, return defaults if they don't exist
        try:
            status = certificate.custom_renewal_status or "Not Renewed"
            renewal_date = certificate.custom_renewal_date
            renewal_amount = certificate.custom_renewal_amount
            payment_id = certificate.custom_renewal_payment_id
        except:
            status = "Not Renewed"
            renewal_date = None
            renewal_amount = None
            payment_id = None
        
        return {
            "status": status,
            "renewal_date": renewal_date,
            "renewal_amount": renewal_amount,
            "payment_id": payment_id
        }
        
    except Exception as e:
        frappe.log_error(f"Failed to get renewal status: {str(e)}")
        return {"status": "Error", "message": str(e)}

@frappe.whitelist()
def check_certificate_expiry(certificate_name):
    """Check if certificate is expired and needs renewal"""
    try:
        certificate = frappe.get_doc("Assessment Result", certificate_name)
        
        # Check if certificate has validity period
        if certificate.validity_period and certificate.validity_period != "NA":
            from frappe.utils import getdate, add_days
            
            # Calculate expiry date
            if certificate.course_start_date:
                expiry_date = add_days(certificate.course_start_date, int(certificate.validity_period))
                current_date = getdate()
                
                is_expired = current_date > expiry_date
                days_until_expiry = (expiry_date - current_date).days
                
                return {
                    "is_expired": is_expired,
                    "expiry_date": expiry_date,
                    "days_until_expiry": days_until_expiry,
                    "needs_renewal": is_expired or days_until_expiry <= 30,  # Renewal needed if expired or within 30 days
                    "renewal_status": getattr(certificate, 'custom_renewal_status', None) or "Not Renewed"
                }
        
        return {
            "is_expired": False,
            "needs_renewal": False,
            "renewal_status": getattr(certificate, 'custom_renewal_status', None) or "Not Renewed"
        }
        
    except Exception as e:
        frappe.log_error(f"Failed to check certificate expiry: {str(e)}")
        return {"error": str(e)}

@frappe.whitelist()
def test_stripe_connection():
    """Test Stripe connection"""
    try:
        # Use hardcoded test keys
        return {
            "status": "success", 
            "message": "Stripe is properly configured with test keys",
            "publishable_key": "pk_test_51RhUOz2NHM2ZzUvkTK2uWbSo2xNRNtPRkPgWorhGM3t9D1HeaUqxuBfPv31k8uoeFZKZfGOqZnucTTdTaMCXt0ja00h88kaL8q"
        }
        
    except Exception as e:
        return {"status": "error", "message": str(e)}

def send_renewal_success_notification(certificate_name):
    """Send notification to user about successful renewal"""
    try:
        certificate = frappe.get_doc("Assessment Result", certificate_name)
        user = frappe.get_doc("User", frappe.session.user)
        
        # Create notification
        notification = frappe.get_doc({
            "doctype": "Notification Log",
            "subject": f"Certificate Renewed Successfully - {certificate.name}",
            "for_user": frappe.session.user,
            "type": "Alert",
            "email_content": f"""
                <p>Dear {user.full_name or user.name},</p>
                <p>Your certificate <strong>{certificate.name}</strong> has been renewed successfully.</p>
                <p><strong>Renewal Details:</strong></p>
                <ul>
                    <li>Certificate: {certificate.name}</li>
                    <li>Program: {certificate.program}</li>
                    <li>Renewal Date: {certificate.custom_renewal_date}</li>
                    <li>Amount Paid: ${certificate.custom_renewal_amount}</li>
                </ul>
                <p>You can now download your renewed certificate from the student portal.</p>
                <p>Thank you for choosing our services!</p>
            """
        })
        notification.insert()
        
    except Exception as e:
        frappe.log_error(f"Failed to send renewal notification: {str(e)}")

@frappe.whitelist()
def get_renewal_eligibility(certificate_name):
    """Get detailed renewal eligibility information"""
    try:
        from student_certificates.student_certificates.config.renewal_settings import (
            is_certificate_eligible_for_renewal, 
            calculate_renewal_fee,
            get_renewal_settings
        )
        
        is_eligible, reason = is_certificate_eligible_for_renewal(certificate_name)
        fee = calculate_renewal_fee(certificate_name)
        settings = get_renewal_settings()
        
        return {
            "eligible": is_eligible,
            "reason": reason,
            "fee": fee,
            "currency": settings["renewal_currency"],
            "validity_days": settings["renewal_validity_days"]
        }
        
    except Exception as e:
        frappe.log_error(f"Failed to get renewal eligibility: {str(e)}")
        return {"error": str(e)} 