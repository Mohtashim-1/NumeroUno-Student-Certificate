const assessment_fields = [
	"ois_01",
	"ois_02_l01_l02",
	"ois_02_l03",
	"ois_03_l01",
	"ois_03_l03",
	"ois_03_l04",
	"ois_03_l02_l05",
	"ois_04_l01_l02",
	"ois_04_l03_l04",
];

frappe.ui.form.on("BOSIET EBS Assessor Checklist", {
	refresh(frm) {
		frm.add_custom_button(__("Fetch Candidates"), () => frm.events.fetch_candidates(frm));
	},

	batch_no(frm) {
		if (!frm.doc.__islocal || !frm.doc.batch_no) {
			return;
		}

		frm.events.fetch_candidates(frm);
	},

	course(frm) {
		if (!frm.doc.__islocal || !frm.doc.batch_no) {
			return;
		}

		frm.events.fetch_candidates(frm);
	},

	fetch_candidates(frm) {
		if (!frm.doc.batch_no) {
			frappe.msgprint(__("Please select Batch No first."));
			return;
		}

		frappe.call({
			method: "student_certificates.student_certificates.doctype.bosiet_ebs_assessor_checklist.bosiet_ebs_assessor_checklist.get_candidates",
			args: {
				batch_no: frm.doc.batch_no,
				course: frm.doc.course,
			},
			callback(r) {
				if (!r.message) {
					return;
				}

				frm.clear_table("candidate_assessment");
				r.message.forEach((candidate) => {
					const row = frm.add_child("candidate_assessment");
					row.sr_no = candidate.sr_no;
					row.candidate_name = candidate.candidate_name;
					row.candidate_id = candidate.candidate_id;
				});

				frm.refresh_field("candidate_assessment");
				set_parent_final_result(frm);
			},
		});
	},
});

frappe.ui.form.on("BOSIET Candidate Assessment Row", {
	ois_01: update_results,
	ois_02_l01_l02: update_results,
	ois_02_l03: update_results,
	ois_03_l01: update_results,
	ois_03_l03: update_results,
	ois_03_l04: update_results,
	ois_03_l02_l05: update_results,
	ois_04_l01_l02: update_results,
	ois_04_l03_l04: update_results,
});

function update_results(frm, cdt, cdn) {
	const row = locals[cdt][cdn];
	row.final_result = get_candidate_final_result(row);
	frm.refresh_field("candidate_assessment");
	set_parent_final_result(frm);
}

function get_candidate_final_result(row) {
	const values = assessment_fields.map((fieldname) => row[fieldname]);

	if (values.includes("NYC")) {
		return "NYC";
	}

	if (values.every((value) => ["C", "NA"].includes(value))) {
		return "C";
	}

	return "";
}

function set_parent_final_result(frm) {
	const rows = frm.doc.candidate_assessment || [];
	const results = rows.map((row) => row.final_result).filter(Boolean);

	if (results.includes("NYC")) {
		frm.set_value("final_result", "NYC");
	} else if (results.length && results.length === rows.length) {
		frm.set_value("final_result", "C");
	} else {
		frm.set_value("final_result", "");
	}
}
