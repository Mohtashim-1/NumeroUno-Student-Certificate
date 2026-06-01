import frappe
from datetime import datetime, timedelta
from email.utils import formataddr
from zoneinfo import ZoneInfo

from frappe import _
from frappe.utils import formatdate, get_datetime, get_url


PORTAL_PAGE_ROUTE = "/app/student-certificate"
PORTAL_DIGEST_EMAIL_ACCOUNT = "NUTC Certificate"
PORTAL_DIGEST_TIMEZONE = "Asia/Dubai"  # UAE (GST, UTC+4)
PORTAL_DIGEST_HOUR_UAE = 20  # 8:00 PM UAE
# Server OS is Asia/Karachi (UTC+5); 21:00 PKT = 20:00 UAE — see hooks.py cron.
PORTAL_DIGEST_CRON_SERVER = "0 21 * * *"


def get_uae_now():
	return datetime.now(ZoneInfo(PORTAL_DIGEST_TIMEZONE))


def get_digest_since_datetime():
	"""Last 24 hours window, evaluated in UAE time."""
	return get_uae_now().replace(tzinfo=None) - timedelta(days=1)


def send_daily_portal_certificate_digests_scheduled():
	"""Scheduler entry: only send at 8:00 PM UAE, regardless of server OS timezone."""
	now_uae = get_uae_now()
	if now_uae.hour != PORTAL_DIGEST_HOUR_UAE:
		frappe.logger().info(
			f"Portal certificate digest skipped (UAE time {now_uae:%Y-%m-%d %H:%M}, "
			f"waiting for {PORTAL_DIGEST_HOUR_UAE}:00 {PORTAL_DIGEST_TIMEZONE})."
		)
		return {
			"skipped": True,
			"uae_time": now_uae.strftime("%Y-%m-%d %H:%M:%S %Z"),
			"expected_hour_uae": PORTAL_DIGEST_HOUR_UAE,
		}

	return send_daily_portal_certificate_digests()


def _should_send_emails():
	try:
		from numerouno.numerouno.notifications.notification_config import NotificationConfig

		return NotificationConfig.should_send_emails()
	except Exception:
		return True


def ensure_portal_digest_fields():
	"""Create tracking fields on Assessment Result if missing."""
	fields = [
		{
			"fieldname": "custom_portal_enabled_on",
			"label": "Portal Enabled On",
			"fieldtype": "Datetime",
			"insert_after": "custom_show_on_portal",
			"read_only": 1,
			"no_copy": 1,
		},
		{
			"fieldname": "custom_portal_digest_sent",
			"label": "Portal Digest Sent",
			"fieldtype": "Check",
			"insert_after": "custom_portal_enabled_on",
			"default": "0",
			"hidden": 1,
			"no_copy": 1,
		},
	]

	for field in fields:
		if frappe.db.exists("Custom Field", {"dt": "Assessment Result", "fieldname": field["fieldname"]}):
			continue

		custom_field = frappe.get_doc(
			{
				"doctype": "Custom Field",
				"dt": "Assessment Result",
				**field,
			}
		)
		custom_field.insert(ignore_permissions=True)

	frappe.clear_cache(doctype="Assessment Result")


def resolve_customer_docname(customer_name_value):
	if not customer_name_value:
		return None

	if frappe.db.exists("Customer", customer_name_value):
		return customer_name_value

	return frappe.db.get_value("Customer", {"customer_name": customer_name_value}, "name")


def get_client_emails(customer_name):
	customer = resolve_customer_docname(customer_name)
	if not customer:
		return []

	emails = []
	customer_doc = frappe.get_doc("Customer", customer)

	if customer_doc.get("email_id"):
		emails.append(customer_doc.email_id)

	try:
		from numerouno.numerouno.doctype.bulk_soa_generator.bulk_soa_generator import get_customer_emails

		for email in get_customer_emails(customer_doc):
			if email and email not in emails:
				emails.append(email)
	except Exception:
		contacts = frappe.get_all(
			"Dynamic Link",
			filters={"link_doctype": "Customer", "link_name": customer, "parenttype": "Contact"},
			fields=["parent"],
		)
		for row in contacts:
			contact = frappe.get_doc("Contact", row.parent)
			for email_row in contact.get("email_ids") or []:
				if email_row.email_id and email_row.email_id not in emails:
					emails.append(email_row.email_id)

	return emails


def get_portal_digest_sender():
	"""Outgoing mail via Email Account: NUTC Certificate."""
	if not frappe.db.exists("Email Account", PORTAL_DIGEST_EMAIL_ACCOUNT):
		frappe.throw(
			_("Email Account {0} is not configured.").format(PORTAL_DIGEST_EMAIL_ACCOUNT),
			title=_("Certificate Digest Email"),
		)

	account = frappe.get_doc("Email Account", PORTAL_DIGEST_EMAIL_ACCOUNT)
	if not account.enable_outgoing:
		frappe.throw(
			_("Email Account {0} does not have outgoing email enabled.").format(
				PORTAL_DIGEST_EMAIL_ACCOUNT
			),
			title=_("Certificate Digest Email"),
		)

	display_name = account.get("name") or "Numero Uno Certification"
	sender = formataddr((display_name, account.email_id))
	return sender, account.email_id


def send_portal_digest_email(recipients, subject, message):
	sender, reply_to = get_portal_digest_sender()
	frappe.sendmail(
		recipients=recipients,
		sender=sender,
		reply_to=reply_to,
		subject=subject,
		message=message,
		now=True,
	)


def get_student_group_display(row):
	return (row.get("student_group") or "").strip() or "-"


def get_candidate_name_display(row):
	return (row.get("student_name") or "").strip() or "-"


def get_training_name(row):
	return row.get("course") or row.get("program") or row.get("assessment_plan") or "-"


def get_training_date(row):
	training_date = row.get("date") or row.get("course_start_date")
	if not training_date:
		return "-"
	try:
		return formatdate(training_date)
	except Exception:
		return str(training_date)


def get_pending_digest_certificates(since_datetime):
	ensure_portal_digest_fields()

	filters = {
		"docstatus": 1,
		"custom_show_on_portal": 1,
		"custom_portal_digest_sent": 0,
		"customer_name": ["is", "set"],
	}

	certificates = frappe.get_all(
		"Assessment Result",
		filters=filters,
		fields=[
			"name",
			"student_name",
			"student_group",
			"course",
			"program",
			"assessment_plan",
			"date",
			"course_start_date",
			"customer_name",
			"custom_portal_enabled_on",
			"modified",
		],
		order_by="customer_name asc, student_name asc",
	)

	pending = []
	since = get_datetime(since_datetime)

	for row in certificates:
		# Only notify when portal access was explicitly enabled (not legacy records).
		enabled_on = row.get("custom_portal_enabled_on")
		if not enabled_on:
			continue
		if get_datetime(enabled_on) >= since:
			pending.append(row)

	return pending


def build_digest_email_html(customer_name, certificates):
	rows_html = ""
	for cert in certificates:
		rows_html += f"""
		<tr>
			<td style="padding: 8px; border-bottom: 1px solid #ddd;">{frappe.utils.escape_html(get_student_group_display(cert))}</td>
			<td style="padding: 8px; border-bottom: 1px solid #ddd;">{frappe.utils.escape_html(get_candidate_name_display(cert))}</td>
			<td style="padding: 8px; border-bottom: 1px solid #ddd;">{frappe.utils.escape_html(get_training_name(cert))}</td>
			<td style="padding: 8px; border-bottom: 1px solid #ddd;">{frappe.utils.escape_html(get_training_date(cert))}</td>
		</tr>
		"""

	portal_url = get_url(PORTAL_PAGE_ROUTE)

	return f"""
	<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
		<p>Dear Client,</p>
		<p>The below certificate(s) are ready to download in the portal.</p>
		<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
			<thead>
				<tr style="background-color: #f8f9fa;">
					<th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Student Group</th>
					<th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Name of Candidate</th>
					<th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Name of Training</th>
					<th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Date of Training</th>
				</tr>
			</thead>
			<tbody>
				{rows_html}
			</tbody>
		</table>
		<p>
			<a href="{portal_url}" style="display: inline-block; padding: 10px 16px; background-color: #e74c3c; color: #fff; text-decoration: none; border-radius: 4px;">
				Open Certificate Portal
			</a>
		</p>
		<p style="color: #666; font-size: 12px;">Client: {frappe.utils.escape_html(customer_name)}</p>
		<p>Best regards,<br><strong>Numero Uno Certification</strong></p>
	</div>
	"""


def mark_certificates_digest_sent(certificate_names):
	if not certificate_names:
		return

	frappe.db.set_value(
		"Assessment Result",
		{"name": ["in", certificate_names]},
		"custom_portal_digest_sent",
		1,
		update_modified=False,
	)


def send_daily_portal_certificate_digests():
	"""Send one digest email per client for certificates enabled on the portal in the last day."""
	if not _should_send_emails():
		frappe.logger().info("Skipping portal certificate digest emails (emails disabled).")
		return

	ensure_portal_digest_fields()

	since_datetime = get_digest_since_datetime()
	certificates = get_pending_digest_certificates(since_datetime)

	if not certificates:
		frappe.logger().info("No new portal certificates to include in daily digest.")
		return {"sent": 0, "clients": 0}

	by_customer = {}
	for cert in certificates:
		customer_name = cert.get("customer_name")
		by_customer.setdefault(customer_name, []).append(cert)

	sent_count = 0
	skipped_clients = []

	for customer_name, customer_certs in by_customer.items():
		recipients = get_client_emails(customer_name)
		if not recipients:
			skipped_clients.append(customer_name)
			frappe.logger().warning(
				f"No email found for client '{customer_name}' ({len(customer_certs)} certificate(s) skipped)."
			)
			continue

		subject = _("Certificates ready to download - {0}").format(customer_name)
		message = build_digest_email_html(customer_name, customer_certs)

		try:
			send_portal_digest_email(recipients, subject, message)
			mark_certificates_digest_sent([row.name for row in customer_certs])
			sent_count += 1
			frappe.logger().info(
				f"Portal certificate digest sent to {customer_name} ({len(customer_certs)} certificate(s))."
			)
		except Exception:
			frappe.log_error(
				title="Portal Certificate Digest Email Failed",
				message=frappe.get_traceback(),
			)

	frappe.db.commit()

	return {
		"sent": sent_count,
		"clients": len(by_customer),
		"certificates": len(certificates),
		"skipped_clients": skipped_clients,
	}


@frappe.whitelist()
def send_daily_portal_certificate_digests_now():
	"""Manual trigger for testing."""
	frappe.only_for(("System Manager", "Administrator"))
	return send_daily_portal_certificate_digests()


@frappe.whitelist()
def send_test_portal_certificate_digest(recipient=None, sample_count=3):
	"""Send a preview digest email without marking certificates as notified."""
	frappe.only_for(("System Manager", "Administrator"))

	recipient = (recipient or "").strip()
	if not recipient:
		frappe.throw(_("Recipient email is required."))

	sample_count = max(1, min(int(sample_count or 3), 10))

	samples = frappe.get_all(
		"Assessment Result",
		filters={
			"docstatus": 1,
			"custom_show_on_portal": 1,
			"customer_name": ["is", "set"],
		},
		fields=[
			"name",
			"student_name",
			"student_group",
			"course",
			"program",
			"assessment_plan",
			"date",
			"course_start_date",
			"customer_name",
		],
		order_by="modified desc",
		limit=sample_count,
	)

	if not samples:
		samples = [
			{
				"student_name": "Sample Candidate One",
				"student_group": "STD-GRP-2026-00001",
				"course": "ADNOC Defensive Driving for Light Vehicle (Q2123)",
				"date": "2026-06-01",
				"customer_name": "Sample Client LLC",
			},
			{
				"student_name": "Sample Candidate Two",
				"student_group": "STD-GRP-2026-00002",
				"course": "Travel Safety by Boat – Initial (TSbB Initial)",
				"course_start_date": "2026-05-25",
				"customer_name": "Sample Client LLC",
			},
		]

	customer_name = samples[0].get("customer_name") or "Sample Client"
	message = build_digest_email_html(customer_name, samples)
	message += (
		'<p style="color:#888;font-size:12px;margin-top:24px;">'
		"<em>This is a test preview of the daily portal certificate digest. "
		"No certificates were marked as notified.</em></p>"
	)

	send_portal_digest_email(
		[recipient],
		_("[TEST] Certificates ready to download - {0}").format(customer_name),
		message,
	)

	return {"status": "success", "recipient": recipient, "certificates_in_email": len(samples)}
