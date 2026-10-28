import frappe
from frappe.utils import now_datetime


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


def track_portal_certificate_access(doc, method):
	"""Stamp when a certificate is enabled for client portal access.

	Portal visibility / digest emails also require instructor confirmation
	(``custom_trainer_confirmed``). Enabling Show on Portal alone is not enough.
	"""
	if doc.doctype != "Assessment Result":
		return

	from student_certificates.student_certificates.notifications.portal_certificate_digest import (
		ensure_portal_digest_fields,
	)

	ensure_portal_digest_fields()

	from numerouno.numerouno.utils.trainer_confirmation import requires_trainer_confirmation_for_portal

	prev = doc.get_doc_before_save()
	was_enabled = bool(prev and prev.get("custom_show_on_portal"))
	is_enabled = bool(doc.get("custom_show_on_portal"))
	was_confirmed = bool(prev and prev.get("custom_trainer_confirmed"))
	is_confirmed = bool(doc.get("custom_trainer_confirmed"))
	needs_confirm = requires_trainer_confirmation_for_portal(doc)

	# Legacy (before 26 Oct 2026): Show on Portal alone is enough.
	# From 26 Oct 2026: instructor confirmation is also required.
	was_ready = was_enabled and (was_confirmed or not needs_confirm)
	is_ready = is_enabled and (is_confirmed or not needs_confirm)

	if is_ready and not was_ready:
		doc.custom_portal_enabled_on = now_datetime()
		doc.custom_portal_digest_sent = 0
	elif not is_ready and was_ready:
		doc.custom_portal_enabled_on = None
		doc.custom_portal_digest_sent = 0

