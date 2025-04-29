frappe.pages['student-attendance1'].on_page_load = function (wrapper) {
	const page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Pending Attendance Signatures',
		single_column: true
	});

	// HTML Table
	$(`
		<div class="mt-3">
			<h4>Pending Attendance Records</h4>
			<table class="table table-bordered">
				<thead>
					<tr>
						<th>Attendance ID</th>
						<th>Student</th>
						<th>Student Name</th>
						<th>Date</th>
						<th>Status</th>
						<th>Signature</th>
						<th>Action</th>
					</tr>
				</thead>
				<tbody id="attendance-table-body">
					<!-- Rows will be added here -->
				</tbody>
			</table>
		</div>
	`).appendTo(page.body);

	load_pending_attendance();

	// Main function to load data
	function load_pending_attendance() {
		frappe.call({
			method: "frappe.client.get_list",
			args: {
				doctype: "Student Attendance",
				fields: ["name", "student", "student_name", "date", "status", "custom_student_signature", "docstatus"],
				filters: {
					docstatus: 0
				},
				limit_page_length: 100
			},
			callback: function (r) {
				let tableBody = $("#attendance-table-body").empty();
				r.message.forEach(doc => {
					let isUnsigned = !doc.custom_student_signature;

					let signatureCell = '';
					let actionCell = '';

					if (isUnsigned) {
						signatureCell = `
							<canvas id="sign-${doc.name}" width="250" height="100" style="border:1px solid #ccc;"></canvas>
							<br>
							<button class="btn btn-sm btn-secondary clear-btn" data-name="${doc.name}">Clear</button>
						`;
						actionCell = `
							<button class="btn btn-sm btn-success inline-sign-btn" data-name="${doc.name}">Sign & Submit</button>
						`;
					} else {
						signatureCell = `<img src="${doc.custom_student_signature}" style="height: 40px;">`;
						actionCell = `<span class="badge bg-success">Submitted</span>`;
					}

					let row = `
						<tr>
							<td>${doc.name}</td>
							<td>${doc.student}</td>
							<td>${doc.student_name}</td>
							<td>${doc.date}</td>
							<td>${doc.status}</td>
							<td>${signatureCell}</td>
							<td>${actionCell}</td>
						</tr>`;
					tableBody.append(row);
				});

				// Bind canvas and buttons
				init_canvas_and_buttons(r.message);
			}
		});
	}

	// Draw signature + handle button events
	function init_canvas_and_buttons(records) {
		records.forEach(doc => {
			if (!doc.custom_student_signature) {
				const canvas = document.getElementById(`sign-${doc.name}`);
				if (!canvas) return;

				const ctx = canvas.getContext('2d');
				let drawing = false;

				canvas.addEventListener('mousedown', function (e) {
					drawing = true;
					ctx.beginPath();
					ctx.moveTo(e.offsetX, e.offsetY);
				});
				canvas.addEventListener('mousemove', function (e) {
					if (drawing) {
						ctx.lineTo(e.offsetX, e.offsetY);
						ctx.stroke();
					}
				});
				canvas.addEventListener('mouseup', () => drawing = false);
				canvas.addEventListener('mouseleave', () => drawing = false);

				// Clear button
				$(`.clear-btn[data-name="${doc.name}"]`).click(function () {
					ctx.clearRect(0, 0, canvas.width, canvas.height);
				});
			}
		});

		// Submit signature
		$('.inline-sign-btn').off('click').on('click', function () {
			const name = $(this).data('name');
			const canvas = document.getElementById(`sign-${name}`);
			if (!canvas) return frappe.msgprint("Canvas not found!");

			const signature = canvas.toDataURL();

			// 1. Save signature
			frappe.call({
				method: "frappe.client.set_value",
				args: {
					doctype: "Student Attendance",
					name: name,
					fieldname: {
						"custom_student_signature": signature
					}
				},
				callback: function () {
					// 2. Submit doc
					frappe.call({
						method: "frappe.client.submit",
						args: {
							doc: {
								doctype: "Student Attendance",
								name: name
							}
						},
						callback: function () {
							frappe.msgprint("Signed and Submitted!");
							load_pending_attendance(); // reload
						}
					});
				}
			});
		});
	}
};
