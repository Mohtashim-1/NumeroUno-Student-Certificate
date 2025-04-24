frappe.pages['student-certificate'].on_page_load = function(wrapper) {
    let page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Student Certificate',
        single_column: true
    });

    // Filter inputs + table placeholder
    const filter_section = `
        <div class="mb-3">
            <div class="row">
                <div class="col-md-3"><input type="text" id="filter-certificate" class="form-control" placeholder="Filter by Certificate #"></div>
                <div class="col-md-3"><input type="text" id="filter-program" class="form-control" placeholder="Filter by Program"></div>
                <div class="col-md-3"><input type="text" id="filter-student" class="form-control" placeholder="Filter by Student"></div>
                <div class="col-md-3"><input type="text" id="filter-customer" class="form-control" placeholder="Filter by Customer"></div>
            </div>
        </div>
        <div id="certificate-table"></div>
    `;

    $(wrapper).find('.layout-main-section').html(filter_section);

    function get_filter_values() {
        return {
            student: $('#filter-student').val(),
            program: $('#filter-program').val(),
            customer: $('#filter-customer').val(),
            name: $('#filter-certificate').val()
        };
    }

    function fetch_certificates() {
        frappe.call({
            method: 'student_certificates.student_certificates.page.student_certificate.student_certificate.get_certificates',
            args: { filters: get_filter_values() },
            callback: function(r) {
                if (r.message && r.message.length) {
                    const table_html = `
                        <table class="table table-bordered">
                            <thead>
                                <tr>
                                    <th>Certificate #</th>
                                    <th>Program</th>
                                    <th>Student</th>
                                    <th>Customer</th>
                                    <th>Total</th>
                                    <th>Score</th>
                                    <th>Grade</th>
                                    <th>Certificate</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${r.message.map(row => `
                                    <tr>
                                        <td>${row.name}</td>
                                        <td>${row.program}</td>
                                        <td>${row.student || '-'}</td>
                                        <td>${row.custom_customer || '-'}</td>
                                        <td>${row.maximum_score}</td>
                                        <td>${row.total_score}</td>
                                        <td>${row.grade}</td>
                                        <td>
                                            <a href="/api/method/frappe.utils.print_format.download_pdf?doctype=Assessment%20Result&name=${row.name}&format=Assessment%20Certificate&no_letterhead=0&letterhead=Letter%20Head%20New&_lang=en" 
                                               target="_blank" 
                                               class="btn btn-primary btn-sm">
                                               Download PDF
                                            </a>
                                        </td>
                                    </tr>`).join('')}
                            </tbody>
                        </table>`;
                    $('#certificate-table').html(table_html);
                } else {
                    $('#certificate-table').html('<p>No certificate results found.</p>');
                }
            }
        });
    }

    // Initial load
    fetch_certificates();

    // Real-time filtering
    $('#filter-student, #filter-program, #filter-customer, #filter-certificate').on('keyup', function() {
        fetch_certificates();
    });
};
