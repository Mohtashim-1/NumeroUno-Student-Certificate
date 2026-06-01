# Copyright (c) 2024, Student Certificates and Contributors
# License: MIT. See LICENSE
import frappe
from frappe import _
from frappe.utils import get_url

no_cache = 1

def get_context(context):
	context.no_cache = 1
	
	# Get parameters from URL
	expected_keys = (
		"amount",
		"title", 
		"description",
		"reference_doctype",
		"reference_docname",
		"payer_name",
		"payer_email",
		"currency",
		"payment_gateway",
		"redirect_to"
	)
	
	if not (set(expected_keys) - set(list(frappe.form_dict))):
		for key in expected_keys:
			context[key] = frappe.form_dict[key]
		
		# Use hardcoded test keys for now
		context.publishable_key = "pk_test_51RhUOz2NHM2ZzUvkTK2uWbSo2xNRNtPRkPgWorhGM3t9D1HeaUqxuBfPv31k8uoeFZKZfGOqZnucTTdTaMCXt0ja00h88kaL8q"
		context.image = None  # No header image for now
		
		# Format amount
		context["amount"] = frappe.utils.fmt_money(
			amount=context["amount"], 
			currency=context["currency"]
		)
	else:
		frappe.redirect_to_message(
			_("Some information is missing"),
			_("Looks like someone sent you to an incomplete URL. Please ask them to look into it."),
		)
		frappe.local.flags.redirect_location = frappe.local.response.location
		raise frappe.Redirect 