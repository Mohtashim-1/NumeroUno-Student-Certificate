import frappe


def execute():
	"""Avoid retroactive digest emails for certificates already on the portal."""
	ensure_fields_exist()

	frappe.db.sql(
		"""
		UPDATE `tabAssessment Result`
		SET custom_portal_digest_sent = 1
		WHERE custom_show_on_portal = 1
			AND IFNULL(custom_portal_digest_sent, 0) = 0
			AND custom_portal_enabled_on IS NULL
		"""
	)
	frappe.db.commit()


def ensure_fields_exist():
	from student_certificates.student_certificates.notifications.portal_certificate_digest import (
		ensure_portal_digest_fields,
	)

	ensure_portal_digest_fields()
