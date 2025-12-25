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
        from frappe.utils import getdate, add_days, get_datetime
        
        certificate = frappe.get_doc("Assessment Result", certificate_name)
        current_date = getdate()
        
        # Certificate download expires 365 days from creation date
        # Every certificate has this rule, so we always calculate expiry
        creation_date = None
        if certificate.creation:
            creation_date = getdate(certificate.creation)
        elif certificate.get("creation"):
            creation_date = getdate(certificate.get("creation"))
        else:
            # Fallback: use modified date if creation doesn't exist (shouldn't happen normally)
            creation_date = getdate(certificate.modified) if certificate.modified else current_date
        
        # Always calculate expiry: 365 days from creation
        download_expiry_date = add_days(creation_date, 365)
        is_download_expired = current_date > download_expiry_date
        days_until_download_expiry = (download_expiry_date - current_date).days
        
        # Certificate download needs renewal if expired or within 30 days of expiry
        needs_download_renewal = is_download_expired or days_until_download_expiry <= 30
        
        # For download expiry, use the 365-day rule (primary and only rule)
        # Download is expired if 365 days have passed since creation
        is_expired = is_download_expired
        needs_renewal = needs_download_renewal
        
        # days_until_expiry is always calculated from the 365-day rule
        days_until_expiry = days_until_download_expiry
        expiry_date = download_expiry_date
        
        return {
            "is_expired": is_expired,
            "expiry_date": expiry_date,
            "days_until_expiry": days_until_expiry,
            "needs_renewal": needs_renewal
        }
        
    except Exception as e:
        frappe.log_error(f"Failed to check certificate expiry: {str(e)}")
        # Even on error, try to calculate expiry from creation date as fallback
        try:
            from frappe.utils import getdate, add_days
            certificate = frappe.get_doc("Assessment Result", certificate_name)
            current_date = getdate()
            creation_date = getdate(certificate.creation) if certificate.creation else getdate(certificate.modified) if certificate.modified else current_date
            download_expiry_date = add_days(creation_date, 365)
            days_until_expiry = (download_expiry_date - current_date).days
            is_expired = current_date > download_expiry_date
            needs_renewal = is_expired or days_until_expiry <= 30
            return {
                "is_expired": is_expired,
                "needs_renewal": needs_renewal,
                "days_until_expiry": days_until_expiry,
                "expiry_date": download_expiry_date
            }
        except:
            # Last resort: return a default that shows as expired (should never reach here)
            return {
                "is_expired": True,
                "needs_renewal": True,
                "days_until_expiry": -1,
                "expiry_date": None
            }

@frappe.whitelist()
def debug_certificate_access(certificate_name=None, user_email=None):
    """Debug function to check why a certificate is not showing"""
    user = user_email or frappe.session.user
    debug_info = {
        "user": user,
        "is_system_manager": "System Manager" in frappe.get_roles(user),
        "user_email": frappe.db.get_value("User", user, "email"),
    }
    
    # Check Customer by owner
    customer_by_owner = frappe.db.get_value("Customer", {"owner": user}, ["name", "customer_name"], as_dict=True)
    debug_info["customer_by_owner"] = customer_by_owner
    
    # Check Contact by email
    user_email_val = debug_info["user_email"]
    if user_email_val:
        # Check Customer.email_id field directly
        customers_by_email = frappe.get_all(
            "Customer",
            filters={"email_id": user_email_val},
            fields=["name", "customer_name"],
            as_dict=True
        )
        debug_info["customers_by_email_id"] = customers_by_email
        
        # Check Contact Email table (newer structure)
        contact_emails = frappe.get_all(
            "Contact Email",
            filters={"email_id": user_email_val},
            fields=["parent"],
            as_dict=True
        )
        contact_names = [ce["parent"] for ce in contact_emails]
        
        # Also check old Contact.email_id field
        old_contact = frappe.db.get_value("Contact", {"email_id": user_email_val}, ["name"], as_dict=True)
        if old_contact:
            contact_names.append(old_contact["name"])
        
        debug_info["contacts_by_email"] = contact_names
        
        if contact_names:
            customer_links = frappe.get_all(
                "Dynamic Link",
                filters={
                    "link_doctype": "Customer",
                    "parenttype": "Contact",
                    "parent": ["in", contact_names]
                },
                fields=["link_name"]
            )
            # Get customer_name for each linked customer
            linked_customers = []
            for link in customer_links:
                cust_name = frappe.db.get_value("Customer", link["link_name"], "customer_name")
                linked_customers.append({
                    "customer": link["link_name"],
                    "customer_name": cust_name
                })
            debug_info["customers_via_contact"] = linked_customers
    
    # If certificate_name provided, check that specific certificate
    if certificate_name:
        cert = frappe.db.get_value(
            "Assessment Result",
            certificate_name,
            ["name", "customer_name", "owner", "docstatus", "custom_show_on_portal", "grade"],
            as_dict=True
        )
        debug_info["certificate"] = cert
        if cert:
            # Check if customer matches
            if customer_by_owner:
                debug_info["customer_match"] = cert.get("customer_name") == customer_by_owner.get("customer_name")
            if debug_info.get("customers_via_contact"):
                debug_info["customer_match_via_contact"] = cert.get("customer_name") in debug_info["customers_via_contact"]
    
    return debug_info

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
        if filters.get("student_group"):
            base_filters["student_group"] = ["like", f"%{filters['student_group']}%"]
        if filters.get("name"):
            base_filters["name"] = ["like", f"%{filters['name']}%"]

    # Check if user is System Manager
    is_sys_manager = "System Manager" in frappe.get_roles(user)

    # If not System Manager, apply ownership/customer filter
    if not is_sys_manager:
        customer_names = []
        
        # First, try to find Customer where owner = user
        customer_name = frappe.db.get_value("Customer", {"owner": user}, "customer_name")
        if customer_name:
            customer_names.append(customer_name)
        
        # Get user's email
        user_email = frappe.db.get_value("User", user, "email")
        if user_email:
            # Method 1: Find Customer records where email_id field matches user email
            customers_by_email = frappe.get_all(
                "Customer",
                filters={"email_id": user_email},
                fields=["customer_name"]
            )
            for cust in customers_by_email:
                if cust.get("customer_name") and cust["customer_name"] not in customer_names:
                    customer_names.append(cust["customer_name"])
            
            # Method 2: Find Contact with matching email, then get linked customers
            # Check Contact Email table (newer structure)
            contact_emails = frappe.get_all(
                "Contact Email",
                filters={"email_id": user_email},
                fields=["parent"]
            )
            contact_names = [ce["parent"] for ce in contact_emails]
            
            # Also check old Contact.email_id field (if exists)
            old_contact = frappe.db.get_value("Contact", {"email_id": user_email}, "name")
            if old_contact and old_contact not in contact_names:
                contact_names.append(old_contact)
            
            # Get all customers linked to these contacts
            if contact_names:
                customer_links = frappe.get_all(
                    "Dynamic Link",
                    filters={
                        "link_doctype": "Customer",
                        "parenttype": "Contact",
                        "parent": ["in", contact_names]
                    },
                    fields=["link_name"]
                )
                for link in customer_links:
                    # Get customer_name from Customer record
                    link_customer_name = frappe.db.get_value("Customer", link["link_name"], "customer_name")
                    if link_customer_name and link_customer_name not in customer_names:
                        customer_names.append(link_customer_name)
        
        # Apply customer filter if we found any customers
        if customer_names:
            if len(customer_names) == 1:
                # Single customer - use direct match
                base_filters["customer_name"] = customer_names[0]
            else:
                # Multiple customers - use IN operator
                base_filters["customer_name"] = ["in", customer_names]
        else:
            # Fallback: show certificates where user is the owner
            base_filters["owner"] = user

    # Get basic certificate data with pagination
    certificates = frappe.get_all(
        "Assessment Result",
        filters=base_filters,
        fields=[
            "name", "program", "maximum_score", "total_score", "grade", 
            "student", "customer_name", "student_group"
        ],
        order_by="modified desc",
        start=start,
        page_length=page_length
    )
    
    # Add renewal status and expiry information for each certificate
    for cert in certificates:
        # Fallback: If customer_name is empty, fetch from student.customer_name
        if not cert.get("customer_name") and cert.get("student"):
            student_customer_name = frappe.db.get_value("Student", cert["student"], "customer_name")
            if student_customer_name:
                cert["customer_name"] = student_customer_name
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
