# Copyright (c) 2024, Student Certificates and Contributors
# License: MIT. See LICENSE
import frappe
from frappe import _

no_cache = 1

def get_context(context):
	context.no_cache = 1
	
	# Get parameters from URL
	context.amount = frappe.form_dict.get("amount", "50.00")
	context.payer_name = frappe.form_dict.get("payer_name", "")
	context.payer_email = frappe.form_dict.get("payer_email", "")
	context.reference_docname = frappe.form_dict.get("reference_docname", "")
	context.redirect_to = frappe.form_dict.get("redirect_to", "/app/student-certificate") 