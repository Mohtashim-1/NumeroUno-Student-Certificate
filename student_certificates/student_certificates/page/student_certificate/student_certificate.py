import frappe
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
            'customer': doc.customer_name or '',
        },
        success_url=frappe.utils.get_url(f"/api/method/student_certificates.student_certificates.api.certificate_renewal.payment_success?session_id={{CHECKOUT_SESSION_ID}}&certificate_name={certificate_name}"),
        cancel_url=frappe.utils.get_url("/certificate-payment-failed")
    )

    return {
        "status": "success",
        "payment_url": session.url,
        "amount": amount
    }


@frappe.whitelist(allow_guest=True)
def payment_success(session_id, certificate_name):
    import stripe
    stripe_settings = frappe.get_single("Stripe Settings")
    stripe.api_key = stripe_settings.secret_key

    session = stripe.checkout.Session.retrieve(session_id)
    payment_intent = stripe.PaymentIntent.retrieve(session.payment_intent)

    if session.payment_status == 'paid':
        frappe.db.set_value("Assessment Result", certificate_name, {
            "custom_renewal_status": "Renewed",
            "custom_renewal_payment_id": session.payment_intent,
            "custom_renewal_date": frappe.utils.now()
        })
        frappe.db.commit()

        # Optionally show a nice redirect page
        frappe.local.response["type"] = "redirect"
        frappe.local.response["location"] = "/certificate-renewed"
    else:
        frappe.local.response["type"] = "redirect"
        frappe.local.response["location"] = "/certificate-payment-failed"



@frappe.whitelist()
def check_certificate_expiry(certificate_name):
    """Check if certificate is expired and needs renewal"""
    try:
        certificate = frappe.get_doc("Assessment Result", certificate_name)
        
        # Check if certificate has validity period
        if certificate.validity_period and certificate.validity_period != "NA":
            from frappe.utils import getdate, add_days
            
            # Calculate expiry date based on course start date
            if certificate.course_start_date:
                expiry_date = add_days(certificate.course_start_date, int(certificate.validity_period))
                current_date = getdate()
                
                is_expired = current_date > expiry_date
                days_until_expiry = (expiry_date - current_date).days
                
                # Certificate needs renewal if expired or within 30 days of expiry
                needs_renewal = is_expired or days_until_expiry <= 30
                
                return {
                    "is_expired": is_expired,
                    "expiry_date": expiry_date,
                    "days_until_expiry": days_until_expiry,
                    "needs_renewal": needs_renewal
                }
        
        return {
            "is_expired": False,
            "needs_renewal": False,
            "days_until_expiry": None
        }
        
    except Exception as e:
        frappe.log_error(f"Failed to check certificate expiry: {str(e)}")
        return {
            "is_expired": False,
            "needs_renewal": False,
            "days_until_expiry": None
        }

@frappe.whitelist()
def get_certificates(filters=None, start=0, page_length=20):
    import json
    if isinstance(filters, str):
        filters = json.loads(filters)
    start = int(start) if start else 0
    page_length = int(page_length) if page_length else 20

    user = frappe.session.user
    base_filters = {
        "docstatus": 1,
        "custom_show_on_portal": 1
    }

    # Apply search filters
    if filters:
        if filters.get("student"):
            base_filters["student"] = ["like", f"%{filters['student']}%"]
        if filters.get("program"):
            base_filters["program"] = ["like", f"%{filters['program']}%"]
        if filters.get("customer"):
            base_filters["customer_name"] = ["like", f"%{filters['customer']}%"]
        if filters.get("name"):
            base_filters["name"] = ["like", f"%{filters['name']}%"]

    # Check if user is System Manager
    is_sys_manager = "System Manager" in frappe.get_roles(user)

    # If not System Manager, apply ownership/customer filter
    if not is_sys_manager:
        customer_name = frappe.db.get_value("Customer", {"owner": user}, "customer_name")
        if customer_name:
            base_filters["customer_name"] = customer_name
        else:
            base_filters["owner"] = user

    # Get basic certificate data with pagination
    certificates = frappe.get_all(
        "Assessment Result",
        filters=base_filters,
        fields=[
            "name", "program", "maximum_score", "total_score", "grade", 
            "student", "customer_name"
        ],
        order_by="modified desc",
        start=start,
        page_length=page_length
    )
    
    # Add renewal status and expiry information for each certificate
    for cert in certificates:
        try:
            # Try to get custom renewal fields
            renewal_data = frappe.db.get_value(
                "Assessment Result", 
                cert["name"], 
                ["custom_renewal_status", "custom_renewal_date", "custom_renewal_amount", "custom_renewal_payment_id"]
            )
            if renewal_data:
                cert["custom_renewal_status"] = renewal_data[0] or "Not Renewed"
                cert["custom_renewal_date"] = renewal_data[1]
                cert["custom_renewal_amount"] = renewal_data[2]
                cert["custom_renewal_payment_id"] = renewal_data[3]
            else:
                cert["custom_renewal_status"] = "Not Renewed"
                cert["custom_renewal_date"] = None
                cert["custom_renewal_amount"] = None
                cert["custom_renewal_payment_id"] = None
            
            # Add expiry information
            expiry_info = check_certificate_expiry(cert["name"])
            cert.update(expiry_info)
            
        except Exception as e:
            # If custom fields don't exist, set defaults
            cert["custom_renewal_status"] = "Not Renewed"
            cert["custom_renewal_date"] = None
            cert["custom_renewal_amount"] = None
            cert["custom_renewal_payment_id"] = None
            cert["is_expired"] = False
            cert["needs_renewal"] = False
            cert["days_until_expiry"] = None
    
    return certificates
