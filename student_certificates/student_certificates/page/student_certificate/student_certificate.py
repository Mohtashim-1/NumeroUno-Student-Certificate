
import frappe

@frappe.whitelist()
def get_certificates(filters=None):
    import json
    if isinstance(filters, str):
        filters = json.loads(filters)

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

    return frappe.get_all(
        "Assessment Result",
        filters=base_filters,
        fields=["name", "program", "maximum_score", "total_score", "grade", "student", "custom_customer"],
        order_by="modified desc"
    )
