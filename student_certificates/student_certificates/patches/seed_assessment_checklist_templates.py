import frappe


TEMPLATES = [
	{
		"template_name": "BASIC H2S Assessor Check List",
		"document_no": "NUTC-P14-F01.00",
		"course_code": "BASIC-H2S",
		"course_name": "BASIC H2S",
		"checklist_type": "BASIC H2S",
		"criteria": [
			("GD", "1", "OIS-91", "BASIC H2S", "Learning Outcome 1"),
			("DO", "2.1", "OIS-91", "BASIC H2S", "Learning Outcome 2.1"),
			("DO", "2.2", "OIS-91", "BASIC H2S", "Learning Outcome 2.2"),
			("DO", "2.3", "OIS-91", "BASIC H2S", "Learning Outcome 2.3"),
			("DO", "2.4", "OIS-91", "BASIC H2S", "Learning Outcome 2.4"),
			("DO", "2.5", "OIS-91", "BASIC H2S", "Learning Outcome 2.5"),
			("DO", "2.6", "OIS-91", "BASIC H2S", "Learning Outcome 2.6"),
		],
	},
	{
		"template_name": "BOSIET EBS Assessor Check List",
		"document_no": "NUTC-P14-F01.01",
		"course_code": "BOSIET-EBS",
		"course_name": "BOSIET EBS",
		"checklist_type": "BOSIET EBS",
		"criteria": [
			("GD", "1", "OIS-01", "SI", "Typical offshore oil and gas activities"),
			("GD", "1-2", "OIS-02", "HSE Theory", "Helicopter travel and safety"),
			("DO", "3", "OIS-02", "HSE Practical", "Helicopter emergencies"),
			("GD", "1", "OIS-03", "SS Theory", "Sea survival theory"),
			("DO", "3", "OIS-03", "LB Practical", "Lifeboat practical"),
			("DO", "4", "OIS-03", "SS Practical", "Sea survival practical"),
			("DO", "2,5", "OIS-03", "FA", "First aid"),
			("GD", "1-2", "OIS-04", "FF & SR Theory", "Firefighting and self rescue theory"),
			("DO", "3-4", "OIS-04", "FF & SR Practical", "Firefighting and self rescue practical"),
		],
	},
	{
		"template_name": "T-BOSIET Assessor Check List",
		"document_no": "NUTC-P14-F01.02",
		"course_code": "T-BOSIET",
		"course_name": "T-BOSIET",
		"checklist_type": "T-BOSIET",
		"criteria": [
			("GD", "1", "OIS-01", "SI", "Tropical offshore introduction"),
			("GD", "1-2", "OIS-02", "HSE Theory", "Helicopter safety theory"),
			("DO", "3", "OIS-02", "HSE Practical", "Helicopter safety practical"),
			("DO", "1-5", "OIS-03", "SS Practical", "Sea survival assessment"),
			("DO", "1-4", "OIS-04", "FF & SR Practical", "Firefighting and self rescue assessment"),
		],
	},
	{
		"template_name": "FOET Assessor Check List",
		"document_no": "NUTC-P14-F01.03",
		"course_code": "FOET",
		"course_name": "FOET",
		"checklist_type": "FOET",
		"criteria": [
			("GD", "1", "OIS-02", "HSE Theory", "Helicopter safety refresh"),
			("DO", "2", "OIS-02", "HSE Practical", "Helicopter emergency refresh"),
			("DO", "1", "OIS-03", "SS Practical", "Sea survival refresh"),
			("DO", "1", "OIS-04", "FF & SR Practical", "Firefighting and self rescue refresh"),
		],
	},
	{
		"template_name": "T-FOET Assessor Check List",
		"document_no": "NUTC-P14-F01.04",
		"course_code": "T-FOET",
		"course_name": "T-FOET",
		"checklist_type": "T-FOET",
		"criteria": [
			("GD", "1", "OIS-02", "HSE Theory", "Tropical helicopter safety refresh"),
			("DO", "2", "OIS-02", "HSE Practical", "Tropical helicopter emergency refresh"),
			("DO", "1", "OIS-03", "SS Practical", "Tropical sea survival refresh"),
			("DO", "1", "OIS-04", "FF & SR Practical", "Firefighting and self rescue refresh"),
		],
	},
	{
		"template_name": "HUET Assessor Check List",
		"document_no": "NUTC-P14-F01.05",
		"course_code": "HUET",
		"course_name": "HUET",
		"checklist_type": "HUET",
		"criteria": [
			("GD", "1", "OIS-02", "HUET Theory", "Helicopter safety theory"),
			("DO", "2", "OIS-02", "HUET Practical", "Helicopter underwater escape practical"),
		],
	},
	{
		"template_name": "T-HUET Assessor Check List",
		"document_no": "NUTC-P14-F01.06",
		"course_code": "T-HUET",
		"course_name": "T-HUET",
		"checklist_type": "T-HUET",
		"criteria": [
			("GD", "1", "OIS-02", "T-HUET Theory", "Tropical helicopter safety theory"),
			("DO", "2", "OIS-02", "T-HUET Practical", "Tropical helicopter underwater escape practical"),
		],
	},
	{
		"template_name": "Gas Monitor Assessor Check List",
		"document_no": "NUTC-P14-F01.08",
		"course_code": "9241",
		"course_name": "Gas Monitor",
		"checklist_type": "Gas Monitor",
		"criteria": [("WA", "1", "OIS-105", "Gas Monitor", "Learning Outcome 1")],
	},
	{
		"template_name": "AGT Assessor Check List",
		"document_no": "NUTC-P14-F01.09",
		"course_code": "9240",
		"course_name": "AGT",
		"checklist_type": "AGT",
		"criteria": [
			("WA", "1", "OIS-102", "AGT", "Learning Outcome 1"),
			("WA", "2", "OIS-102", "AGT", "Learning Outcome 2"),
			("WA", "3", "OIS-102", "AGT", "Learning Outcome 3"),
			("WA", "1", "OIS-103", "AGT", "Learning Outcome 1"),
			("WA", "1", "OIS-104", "AGT", "Learning Outcome 1"),
			("WA", "1", "OIS-105", "AGT", "Learning Outcome 1"),
		],
	},
	{
		"template_name": "TSbB Initial Training Assessor Check List",
		"document_no": "NUTC-P14-F01.10",
		"course_code": "TSBB-INITIAL",
		"course_name": "TSbB Initial Training",
		"checklist_type": "TSbB Initial",
		"criteria": [
			("GD", "1", "OIS-351", "TSbB Initial", "Learning Outcome 1"),
			("GD", "2", "OIS-351", "TSbB Initial", "Learning Outcome 2"),
			("DO", "3.1", "OIS-351", "TSbB Initial", "Learning Outcome 3.1"),
			("DO", "3.2", "OIS-351", "TSbB Initial", "Learning Outcome 3.2"),
			("DO", "3.3", "OIS-351", "TSbB Initial", "Learning Outcome 3.3"),
			("DO", "3.4", "OIS-351", "TSbB Initial", "Learning Outcome 3.4"),
			("DO", "4.1", "OIS-351", "TSbB Initial", "Learning Outcome 4.1"),
			("DO", "5.1", "OIS-351", "TSbB Initial", "Learning Outcome 5.1"),
			("DO", "5.2", "OIS-351", "TSbB Initial", "Learning Outcome 5.2"),
			("DO", "5.3", "OIS-351", "TSbB Initial", "Learning Outcome 5.3"),
			("DO", "6.1", "OIS-351", "TSbB Initial", "Learning Outcome 6.1"),
		],
	},
	{
		"template_name": "TSbB Further Assessor Checklist",
		"document_no": "NUTC-P14-F01.11",
		"course_code": "TSBB-FURTHER",
		"course_name": "TSbB Further",
		"checklist_type": "TSbB Further",
		"criteria": [
			("GD", "1", "OIS-350", "TSbB Further", "Learning Outcome 1"),
			("GD", "2", "OIS-350", "TSbB Further", "Learning Outcome 2"),
			("DO", "3", "OIS-350", "TSbB Further", "Learning Outcome 3"),
			("DO", "4.1", "OIS-350", "TSbB Further", "Learning Outcome 4.1"),
			("DO", "4.2", "OIS-350", "TSbB Further", "Learning Outcome 4.2"),
			("DO", "4.3", "OIS-350", "TSbB Further", "Learning Outcome 4.3"),
			("DO", "4.4", "OIS-350", "TSbB Further", "Learning Outcome 4.4"),
			("DO", "4.5", "OIS-350", "TSbB Further", "Learning Outcome 4.5"),
			("DO", "5.1", "OIS-350", "TSbB Further", "Learning Outcome 5.1"),
			("DO", "5.2", "OIS-350", "TSbB Further", "Learning Outcome 5.2"),
		],
	},
]


def execute():
	for template_data in TEMPLATES:
		create_template(template_data)


def create_template(template_data):
	if frappe.db.exists("Assessment Checklist Template", template_data["template_name"]):
		return

	doc = frappe.new_doc("Assessment Checklist Template")
	doc.template_name = template_data["template_name"]
	doc.document_no = template_data["document_no"]
	doc.course_code = template_data["course_code"]
	doc.course_name = template_data["course_name"]
	doc.checklist_type = template_data["checklist_type"]
	doc.is_active = 1

	for index, (source, outcome, unit_code, module_name, description) in enumerate(
		template_data["criteria"], start=1
	):
		doc.append(
			"criteria",
			{
				"sequence": index,
				"source_of_evidence": source,
				"learning_outcome": outcome,
				"unit_code": unit_code,
				"module_name": module_name,
				"description": description,
				"required": 1,
			},
		)

	for index, (unit_code, module_name) in enumerate(get_modules(template_data["criteria"]), start=1):
		doc.append(
			"modules",
			{
				"sequence": index,
				"unit_code": unit_code,
				"module_name": module_name,
				"assessor_required": 1,
				"signature_required": 1,
			},
		)

	doc.insert(ignore_permissions=True)


def get_modules(criteria):
	seen = set()
	modules = []
	for _source, _outcome, unit_code, module_name, _description in criteria:
		key = (unit_code, module_name)
		if key in seen:
			continue

		seen.add(key)
		modules.append(key)

	return modules
