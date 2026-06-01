frappe.pages['student-attendance1'].on_page_load = function (wrapper) {
	const page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Pending Attendance Signatures',
		single_column: true
	});

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
					<!-- Rows will be rendered here -->
				</tbody>
			</table>
		</div>
	`).appendTo(page.body);

	load_pending_attendance();

	function load_pending_attendance() {
		frappe.call({
			method: "student_certificates.student_certificates.page.student_attendance1.student_attendance1.get_trainer_pending_attendance",
			callback: function (r) {
				const tableBody = $("#attendance-table-body").empty();
				r.message.forEach(doc => {
					const isUnsigned = !doc.custom_student_signature;

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

					const row = `
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

				init_canvas_and_buttons(r.message);
			}
		});
	}

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

				$(`.clear-btn[data-name="${doc.name}"]`).click(function () {
					ctx.clearRect(0, 0, canvas.width, canvas.height);
				});
			}
		});

		// Click handler for "Sign & Submit"
		$('.inline-sign-btn').off('click').on('click', function () {
			const name = $(this).data('name');
			const canvas = document.getElementById(`sign-${name}`);
			if (!canvas) return frappe.msgprint("Signature area not found!");

			// ✅ Validate if canvas is actually blank
			const isCanvasBlank = (canvas) => {
				const ctx = canvas.getContext('2d');
				const pixelBuffer = new Uint32Array(
					ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer
				);
				return !pixelBuffer.some(color => color !== 0);
			};

			if (isCanvasBlank(canvas)) {
				frappe.msgprint("Please draw your signature before submitting.");
				return;
			}

			const signature = canvas.toDataURL();

			// Step 1: Save the signature
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
					// Step 2: Fetch full doc and submit
					frappe.call({
						method: "frappe.client.get",
						args: {
							doctype: "Student Attendance",
							name: name
						},
						callback: function (res) {
							const full_doc = res.message;

							frappe.call({
								method: "frappe.client.submit",
								args: {
									doc: full_doc
								},
								callback: function () {
									frappe.msgprint("Signed and submitted successfully!");
									load_pending_attendance();
								},
								error: function (err) {
									frappe.msgprint("Failed to submit the document. Please try again.");
									console.error(err);
								}
							});
						}
					});
				}
			});
		});
	}
};
