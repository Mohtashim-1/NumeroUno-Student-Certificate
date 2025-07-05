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
            base_filters["custom_customer"] = ["like", f"%{filters['customer']}%"]
        if filters.get("name"):
            base_filters["name"] = ["like", f"%{filters['name']}%"]

    # Check if user is System Manager
    is_sys_manager = "System Manager" in frappe.get_roles(user)

    # If not System Manager, apply ownership/customer filter
    if not is_sys_manager:
        custom_customer_id = frappe.db.get_value("Customer", {"owner": user}, "custom_customer_id")
        if custom_customer_id:
            base_filters["custom_customer"] = custom_customer_id
        else:
            base_filters["owner"] = user

    # Get basic certificate data with pagination
    certificates = frappe.get_all(
        "Assessment Result",
        filters=base_filters,
        fields=[
            "name", "program", "maximum_score", "total_score", "grade", 
            "student", "custom_customer"
        ],
        order_by="modified desc",
        start=start,
        page_length=page_length
    )
    
    # Add renewal status for each certificate (handle missing custom fields)
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
        except:
            # If custom fields don't exist, set defaults
            cert["custom_renewal_status"] = "Not Renewed"
            cert["custom_renewal_date"] = None
            cert["custom_renewal_amount"] = None
            cert["custom_renewal_payment_id"] = None
    
    return certificates
