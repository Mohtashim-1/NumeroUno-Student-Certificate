import frappe
from frappe import _

def get_renewal_settings():
    """Get certificate renewal settings"""
    try:
        # Try to get from system settings first
        renewal_settings = frappe.get_doc("System Settings")
        
        # Default settings
        settings = {
            "default_renewal_fee": 50.00,
            "renewal_currency": "USD",
            "renewal_validity_days": 365,  # 1 year
            "early_renewal_days": 30,  # Days before expiry to allow renewal
            "payment_gateway": "Stripe-Stripe Settings",
            "auto_renewal_enabled": True,
            "renewal_notification_days": [90, 60, 30, 7]  # Days before expiry to send notifications
        }
        
        # Override with custom settings if available
        if hasattr(renewal_settings, 'custom_certificate_renewal_fee'):
            settings["default_renewal_fee"] = renewal_settings.custom_certificate_renewal_fee or 50.00
            
        if hasattr(renewal_settings, 'custom_certificate_renewal_currency'):
            settings["renewal_currency"] = renewal_settings.custom_certificate_renewal_currency or "USD"
            
        if hasattr(renewal_settings, 'custom_certificate_renewal_validity'):
            settings["renewal_validity_days"] = renewal_settings.custom_certificate_renewal_validity or 365
            
        return settings
        
    except Exception as e:
        frappe.log_error(f"Failed to get renewal settings: {str(e)}")
        # Return default settings
        return {
            "default_renewal_fee": 50.00,
            "renewal_currency": "USD",
            "renewal_validity_days": 365,
            "early_renewal_days": 30,
            "payment_gateway": "Stripe-Stripe Settings",
            "auto_renewal_enabled": True,
            "renewal_notification_days": [90, 60, 30, 7]
        }

def calculate_renewal_fee(certificate_name):
    """Calculate renewal fee for a specific certificate"""
    try:
        certificate = frappe.get_doc("Assessment Result", certificate_name)
        settings = get_renewal_settings()
        
        # Base fee
        base_fee = settings["default_renewal_fee"]
        
        # You can add custom logic here based on certificate type, program, etc.
        # For example:
        # if certificate.program == "Advanced Course":
        #     base_fee *= 1.5
        
        return base_fee
        
    except Exception as e:
        frappe.log_error(f"Failed to calculate renewal fee: {str(e)}")
        return get_renewal_settings()["default_renewal_fee"]

def is_certificate_eligible_for_renewal(certificate_name):
    """Check if certificate is eligible for renewal"""
    try:
        certificate = frappe.get_doc("Assessment Result", certificate_name)
        
        # Check if already renewed
        if certificate.custom_renewal_status == "Renewed":
            return False, "Certificate is already renewed"
        
        # Check if certificate has validity period
        if not certificate.validity_period or certificate.validity_period == "NA":
            return False, "Certificate has no expiry date"
        
        # Check if certificate is expired or near expiry
        from frappe.utils import getdate, add_days
        from datetime import datetime
        
        if certificate.course_start_date:
            expiry_date = add_days(certificate.course_start_date, int(certificate.validity_period))
            current_date = getdate()
            settings = get_renewal_settings()
            
            # Check if expired or within early renewal period
            if current_date > expiry_date:
                return True, "Certificate is expired"
            elif (expiry_date - current_date).days <= settings["early_renewal_days"]:
                return True, f"Certificate expires in {(expiry_date - current_date).days} days"
            else:
                return False, f"Certificate is valid for {(expiry_date - current_date).days} more days"
        
        return False, "Unable to determine certificate validity"
        
    except Exception as e:
        frappe.log_error(f"Failed to check renewal eligibility: {str(e)}")
        return False, f"Error checking eligibility: {str(e)}"

def get_renewal_message(certificate_name):
    """Get appropriate renewal message for certificate"""
    try:
        certificate = frappe.get_doc("Assessment Result", certificate_name)
        is_eligible, reason = is_certificate_eligible_for_renewal(certificate_name)
        
        if not is_eligible:
            return {
                "can_renew": False,
                "message": reason,
                "type": "info"
            }
        
        fee = calculate_renewal_fee(certificate_name)
        settings = get_renewal_settings()
        
        return {
            "can_renew": True,
            "message": f"Renewal fee: {settings['renewal_currency']} {fee:.2f}",
            "fee": fee,
            "currency": settings["renewal_currency"],
            "type": "success"
        }
        
    except Exception as e:
        frappe.log_error(f"Failed to get renewal message: {str(e)}")
        return {
            "can_renew": False,
            "message": "Unable to determine renewal status",
            "type": "error"
        } 