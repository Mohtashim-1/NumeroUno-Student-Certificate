import frappe
from frappe import _
from frappe.model.document import Document


class CourseAssessorChecklist(Document):
	def validate(self):
		self.set_row_numbers()
		self.set_candidate_results()

	def set_row_numbers(self):
		pass

	def set_candidate_results(self):
		results_by_candidate = {}
		for row in self.assessment_results:
			if not row.candidate:
				continue

			results_by_candidate.setdefault(row.candidate, []).append(row)

		for candidate in self.candidates:
			rows = [row for row in results_by_candidate.get(candidate.candidate, []) if row.required]
			candidate.final_result = get_final_result(rows)


def get_final_result(rows):
	if not rows:
		return ""

	values = [row.result for row in rows]
	if any(value == "NYC" for value in values):
		return "NYC"

	if all(value in ("C", "NA") for value in values):
		return "C"

	return ""


@frappe.whitelist()
def get_candidates(student_group=None):
	if not student_group:
		frappe.throw(_("Student Group is required."))

	group = frappe.get_doc("Student Group", student_group)
	students = [row for row in group.students if row.active]

	return [
		{
			"candidate": row.student,
			"candidate_id": row.student,
			"candidate_name": row.student_name
			or frappe.db.get_value("Student", row.student, "student_name"),
		}
		for row in students
	]
