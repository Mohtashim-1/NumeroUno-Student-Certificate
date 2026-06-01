import frappe
from frappe import _
from frappe.model.document import Document


ASSESSMENT_FIELDS = (
	"ois_01",
	"ois_02_l01_l02",
	"ois_02_l03",
	"ois_03_l01",
	"ois_03_l03",
	"ois_03_l04",
	"ois_03_l02_l05",
	"ois_04_l01_l02",
	"ois_04_l03_l04",
)

ASSESSOR_DETAIL_ROWS = (
	("OIS 01", "SI"),
	("OIS 02 L01 & L02", "HSE Theory"),
	("OIS 02 L03", "HSE Practical"),
	("OIS 03 L01", "SS Theory"),
	("OIS 03 L03", "LB Practical"),
	("OIS 03 L04", "SS Practical"),
	("OIS 03 L02 & L05", "FA"),
	("OIS 04 L01 & L02", "FF & SR Theory"),
	("OIS 04 L03 & L04", "FF & SR Practical"),
)

LEARNING_OUTCOME_ROWS = (
	("OIS-01", "Understand", "", "Typical offshore oil and gas activities", ""),
	("OIS-01", "Understand", "", "The main offshore hazards", ""),
	("OIS-02", "Understand", "", "Helicopter Travel", ""),
	("OIS-02", "Perform", "", "Helicopter Emergencies", ""),
	("OIS-03", "Understand", "", "Evacuation Methods and Procedures", ""),
	("OIS-04", "Understand", "", "Common causes of offshore fires", ""),
)


class BOSIETEBSAssessorChecklist(Document):
	def before_insert(self):
		self.set_default_assessor_details()
		self.set_default_learning_outcomes()

	def validate(self):
		self.set_checklist_no()
		self.set_row_numbers()
		self.set_candidate_results()
		self.set_final_result()

	def set_checklist_no(self):
		if self.name and not self.name.startswith("new-"):
			self.checklist_no = self.name

	def set_default_assessor_details(self):
		if self.assessor_details:
			return

		for index, (module, description) in enumerate(ASSESSOR_DETAIL_ROWS, start=1):
			self.append(
				"assessor_details",
				{
					"sr_no": index,
					"module": module,
					"description": description,
				},
			)

	def set_default_learning_outcomes(self):
		if self.learning_outcomes:
			return

		for unit, section_type, outcome_no, description, reference_code in LEARNING_OUTCOME_ROWS:
			self.append(
				"learning_outcomes",
				{
					"unit": unit,
					"section_type": section_type,
					"outcome_no": outcome_no,
					"description": description,
					"reference_code": reference_code,
				},
			)

	def set_row_numbers(self):
		for index, row in enumerate(self.candidate_assessment, start=1):
			row.sr_no = index

		for index, row in enumerate(self.assessor_details, start=1):
			row.sr_no = index

	def set_candidate_results(self):
		for row in self.candidate_assessment:
			row.final_result = get_candidate_final_result(row)

	def set_final_result(self):
		results = [row.final_result for row in self.candidate_assessment if row.final_result]

		if any(result == "NYC" for result in results):
			self.final_result = "NYC"
		elif results and len(results) == len(self.candidate_assessment):
			self.final_result = "C"
		else:
			self.final_result = ""


def get_candidate_final_result(row):
	values = [row.get(fieldname) for fieldname in ASSESSMENT_FIELDS]

	if any(value == "NYC" for value in values):
		return "NYC"

	if all(value in ("C", "NA") for value in values):
		return "C"

	return ""


@frappe.whitelist()
def get_candidates(batch_no=None, course=None):
	if not batch_no:
		frappe.throw(_("Batch No is required."))

	enrollments = frappe.get_all(
		"Program Enrollment",
		filters={"student_batch_name": batch_no},
		fields=["name", "student", "student_name"],
		order_by="student_name asc",
	)

	if course and enrollments:
		enrollment_names = [enrollment.name for enrollment in enrollments]
		student_names = frappe.get_all(
			"Course Enrollment",
			filters={
				"program_enrollment": ["in", enrollment_names],
				"course": course,
			},
			pluck="student",
		)
		allowed_students = set(student_names)
		enrollments = [enrollment for enrollment in enrollments if enrollment.student in allowed_students]

	return [
		{
			"sr_no": index,
			"candidate_id": enrollment.student,
			"candidate_name": enrollment.student_name
			or frappe.db.get_value("Student", enrollment.student, "student_name"),
		}
		for index, enrollment in enumerate(enrollments[:16], start=1)
	]
