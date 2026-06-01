import frappe
from frappe.utils import pdf  # 👈 updated import

@frappe.whitelist()
def download_certificate(name):
    doc = frappe.get_doc("Assessment Result", name)

    # Optional: control access to PDF download
    if not doc.custom_show_on_portal:
        frappe.throw("Certificate not available for download.")

    # Use 'doc' as the key for the template context
    html = frappe.render_template("student_certificates/templates/certificate.html", {"doc": doc})

    # Generate PDF from the rendered HTML
    pdf = frappe.utils.pdf.get_pdf(html)

    # Return file as downloadable response
    frappe.local.response.filename = f"Certificate-{doc.name}.pdf"
    frappe.local.response.filecontent = pdf
    frappe.local.response.type = "download"