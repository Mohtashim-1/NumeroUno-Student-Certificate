frappe.ui.form.on("Course Assessor Checklist", {
	refresh(frm) {
		frm.add_custom_button(__("Fetch Candidates"), () => fetch_candidates(frm));
		frm.add_custom_button(__("Load Assessment Rows"), () => load_assessment_rows(frm));
	},

	template(frm) {
		if (!frm.doc.template) {
			return;
		}

		frappe.db.get_value(
			"Assessment Checklist Template",
			frm.doc.template,
			["document_no", "course_code", "course_name"],
			(values) => {
				frm.set_value("document_no", values.document_no);
				frm.set_value("course_code", values.course_code);
				frm.set_value("course_name", values.course_name);
			}
		);
	},
});

frappe.ui.form.on("Course Assessment Result", {
	result(frm) {
		set_candidate_results(frm);
	},
});

function fetch_candidates(frm) {
	if (!frm.doc.student_group) {
		frappe.msgprint(__("Please select Student Group first."));
		return;
	}

	frappe.call({
		method: "student_certificates.student_certificates.doctype.course_assessor_checklist.course_assessor_checklist.get_candidates",
		args: {
			student_group: frm.doc.student_group,
		},
		callback(r) {
			if (!r.message) {
				return;
			}

			frm.clear_table("candidates");
			r.message.forEach((candidate) => {
				const row = frm.add_child("candidates");
				row.candidate = candidate.candidate;
				row.candidate_id = candidate.candidate_id;
				row.candidate_name = candidate.candidate_name;
			});
			frm.refresh_field("candidates");
			set_candidate_results(frm);
		},
	});
}

function load_assessment_rows(frm) {
	if (!frm.doc.template) {
		frappe.msgprint(__("Please select Template first."));
		return;
	}

	if (!(frm.doc.candidates || []).length) {
		frappe.msgprint(__("Please add candidates first."));
		return;
	}

	frappe.db.get_doc("Assessment Checklist Template", frm.doc.template).then((template) => {
		frm.clear_table("assessment_results");
		(frm.doc.candidates || []).forEach((candidate) => {
			(template.criteria || []).forEach((criteria) => {
				const row = frm.add_child("assessment_results");
				row.candidate = candidate.candidate;
				row.candidate_name = candidate.candidate_name;
				row.unit_code = criteria.unit_code;
				row.module_name = criteria.module_name;
				row.learning_outcome = criteria.learning_outcome;
				row.source_of_evidence = criteria.source_of_evidence;
				row.required = criteria.required;
			});
		});

		frm.clear_table("assessor_signatures");
		(template.modules || []).forEach((module) => {
			if (!module.signature_required) {
				return;
			}

			const row = frm.add_child("assessor_signatures");
			row.unit_code = module.unit_code;
			row.module_name = module.module_name;
			row.assessor_name = frm.doc.assessor;
			row.assessment_date = frm.doc.course_date;
		});

		frm.refresh_field("assessment_results");
		frm.refresh_field("assessor_signatures");
		set_candidate_results(frm);
	});
}

function set_candidate_results(frm) {
	const results_by_candidate = {};

	(frm.doc.assessment_results || []).forEach((row) => {
		if (!row.candidate || !row.required) {
			return;
		}

		if (!results_by_candidate[row.candidate]) {
			results_by_candidate[row.candidate] = [];
		}
		results_by_candidate[row.candidate].push(row.result);
	});

	(frm.doc.candidates || []).forEach((candidate) => {
		const values = results_by_candidate[candidate.candidate] || [];
		candidate.final_result = get_final_result(values);
	});

	frm.refresh_field("candidates");
}

function get_final_result(values) {
	if (!values.length) {
		return "";
	}

	if (values.includes("NYC")) {
		return "NYC";
	}

	if (values.every((value) => ["C", "NA"].includes(value))) {
		return "C";
	}

	return "";
}
