import frappe
from frappe.utils import add_days, getdate

def execute():
    """Setup certificate expiry for existing certificates"""
    
    # Get all Assessment Results that don't have certificate_validity_date set
    certificates = frappe.get_all(
        "Assessment Result",
        filters={
            "certificate_validity_date": ["is", "null"]
        },
        fields=["name", "course_start_date", "validity_period"]
    )
    
    for cert in certificates:
        try:
            # Calculate expiry date based on course start date and validity period
            if cert.course_start_date and cert.validity_period and cert.validity_period != "NA":
                expiry_date = add_days(cert.course_start_date, int(cert.validity_period))
                
                # Update the certificate with expiry date
                frappe.db.set_value(
                    "Assessment Result",
                    cert.name,
                    "certificate_validity_date",
                    expiry_date
                )
                
                print(f"Updated certificate {cert.name} with expiry date: {expiry_date}")
            else:
                # If no validity period, set to 1 year from course start date
                if cert.course_start_date:
                    expiry_date = add_days(cert.course_start_date, 365)
                    frappe.db.set_value(
                        "Assessment Result",
                        cert.name,
                        "certificate_validity_date",
                        expiry_date
                    )
                    print(f"Updated certificate {cert.name} with default expiry date: {expiry_date}")
                    
        except Exception as e:
            print(f"Error updating certificate {cert.name}: {str(e)}")
    
    # Commit all changes
    frappe.db.commit()
    print("Certificate expiry setup completed!") 