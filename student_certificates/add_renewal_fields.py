#!/usr/bin/env python3
import frappe

def add_renewal_fields():
    """Add renewal fields to Assessment Result doctype"""
    
    # Add custom fields to Assessment Result
    fields_to_add = [
        {
            "fieldname": "custom_renewal_status",
            "label": "Renewal Status",
            "fieldtype": "Select",
            "options": "Not Renewed\nPending Payment\nRenewed",
            "default": "Not Renewed",
            "insert_after": "custom_customer"
        },
        {
            "fieldname": "custom_renewal_date",
            "label": "Renewal Date",
            "fieldtype": "Date",
            "insert_after": "custom_renewal_status"
        },
        {
            "fieldname": "custom_renewal_payment_id",
            "label": "Renewal Payment ID",
            "fieldtype": "Data",
            "insert_after": "custom_renewal_date"
        },
        {
            "fieldname": "custom_renewal_amount",
            "label": "Renewal Amount",
            "fieldtype": "Currency",
            "default": "0",
            "insert_after": "custom_renewal_payment_id"
        }
    ]
    
    for field in fields_to_add:
        if not frappe.db.exists("Custom Field", f"Assessment Result-{field['fieldname']}"):
            custom_field = frappe.get_doc({
                "doctype": "Custom Field",
                "dt": "Assessment Result",
                "fieldname": field["fieldname"],
                "label": field["label"],
                "fieldtype": field["fieldtype"],
                "insert_after": field["insert_after"]
            })
            
            if "options" in field:
                custom_field.options = field["options"]
            if "default" in field:
                custom_field.default = field["default"]
                
            custom_field.insert()
            print(f"Added field: {field['fieldname']}")
        else:
            print(f"Field already exists: {field['fieldname']}")
    
    # Add custom fields to Payment Entry
    payment_fields = [
        {
            "fieldname": "custom_certificate_renewal",
            "label": "Certificate Renewal Payment",
            "fieldtype": "Check",
            "default": "0",
            "insert_after": "reference_no"
        },
        {
            "fieldname": "custom_certificate_name",
            "label": "Certificate Name",
            "fieldtype": "Link",
            "options": "Assessment Result",
            "insert_after": "custom_certificate_renewal"
        }
    ]
    
    for field in payment_fields:
        if not frappe.db.exists("Custom Field", f"Payment Entry-{field['fieldname']}"):
            custom_field = frappe.get_doc({
                "doctype": "Custom Field",
                "dt": "Payment Entry",
                "fieldname": field["fieldname"],
                "label": field["label"],
                "fieldtype": field["fieldtype"],
                "insert_after": field["insert_after"]
            })
            
            if "options" in field:
                custom_field.options = field["options"]
            if "default" in field:
                custom_field.default = field["default"]
                
            custom_field.insert()
            print(f"Added Payment Entry field: {field['fieldname']}")
        else:
            print(f"Payment Entry field already exists: {field['fieldname']}")
    
    frappe.db.commit()
    print("All fields added successfully!")

if __name__ == "__main__":
    add_renewal_fields() 