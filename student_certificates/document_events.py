import frappe

def set_customer_name_from_student(doc, method):
    """
    Automatically populate customer_name in Assessment Result from Student.customer_name
    if customer_name is not set in Assessment Result
    """
    # Check if this is an Assessment Result document
    if doc.doctype != "Assessment Result":
        return
    
    # Only proceed if customer_name is empty or not set
    if not doc.get("customer_name") and doc.get("student"):
        try:
            # Get customer_name from Student doctype
            student_customer_name = frappe.db.get_value("Student", doc.student, "customer_name")
            
            if student_customer_name:
                doc.customer_name = student_customer_name
        except Exception as e:
            # Log error but don't break the save process
            frappe.log_error(
                f"Error setting customer_name from student for Assessment Result {doc.name}: {str(e)}",
                "Assessment Result: Set Customer Name"
            )

