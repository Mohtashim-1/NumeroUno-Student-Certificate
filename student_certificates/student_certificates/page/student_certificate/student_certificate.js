frappe.pages['student-certificate'].on_page_load = function(wrapper) {
    let page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Student Certificate',
        single_column: true
    });

    // Filter inputs + buttons + table container
    const filter_section = `
        <div class="mb-3">
            <div class="row">
                <div class="col-md-2"><input type="text" id="filter-certificate" class="form-control" placeholder="Filter by Certificate #"></div>
                <div class="col-md-2"><input type="text" id="filter-program" class="form-control" placeholder="Filter by Program"></div>
                <div class="col-md-2"><input type="text" id="filter-student" class="form-control" placeholder="Filter by Student"></div>
                <div class="col-md-2"><input type="text" id="filter-customer" class="form-control" placeholder="Filter by Customer"></div>
                <div class="col-md-2"><input type="text" id="filter-student-group" class="form-control" placeholder="Filter by Student Group"></div>
            </div>
            <div class="row mt-2">
                <div class="col-md-12 text-right">
                    <button class="btn btn-success btn-sm" id="download-selected">Download Selected PDFs</button>
                </div>
            </div>
        </div>
        <div id="certificate-table"></div>
    `;

    $(wrapper).find('.layout-main-section').html(filter_section);

    // Get filter values from inputs
    function get_filter_values() {
        return {
            student: $('#filter-student').val(),
            program: $('#filter-program').val(),
            customer: $('#filter-customer').val(),
            student_group: $('#filter-student-group').val(),
            name: $('#filter-certificate').val()
        };
    }

    let currentPage = 0;
    const pageLength = 20;

    // Fetch and render certificates
    function fetch_certificates(page = 0) {
        currentPage = page;
        frappe.call({
            method: 'student_certificates.student_certificates.page.student_certificate.student_certificate.get_certificates',
            args: {
                filters: get_filter_values(),
                start: page * pageLength,
                page_length: pageLength
            },
            callback: function(r) {
                if (r.message && r.message.length) {
                    const table_html = `
                        <table class="table table-bordered">
                            <thead>
                                <tr>
                                    <th><input type="checkbox" id="select-all"></th>
                                    <th>Certificate #</th>
                                    <th>Program</th>
                                    <th>Student</th>
                                    <th>Customer</th>
                                    <th>Student Group</th>
                                    <th>Total</th>
                                    <th>Score</th>
                                    <th>Grade</th>
                                    <th>Expiry Status</th>
                                    <th>Renewal Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${r.message.filter(row => row.grade === 'PASS').map(row => `
                                    <tr>
                                        <td><input type="checkbox" class="select-cert" value="${row.name}"></td>
                                        <td>${row.name}</td>
                                        <td>${row.program}</td>
                                        <td>${row.student || '-'}</td>
                                        <td>${row.customer_name || '-'}</td>
                                        <td>${row.student_group || '-'}</td>
                                        <td>${row.maximum_score}</td>
                                        <td>${row.total_score}</td>
                                        <td>${row.grade}</td>
                                        <td>
                                            ${get_expiry_status_badge(row)}
                                        </td>
                                        <td>
                                            <span class="badge badge-${get_renewal_status_badge(row.custom_renewal_status)}">
                                                ${row.custom_renewal_status || 'Not Renewed'}
                                            </span>
                                        </td>
                                        <td>
                                            <div class="btn-group" role="group">
                                                ${get_download_button(row)}
                                                ${get_renewal_button(row)}
                                            </div>
                                        </td>
                                    </tr>`).join('')}
                            </tbody>
                        </table>`;
                    const pagination_html = `
                        <div class="d-flex justify-content-between align-items-center mt-2">
                            <button class="btn btn-secondary btn-sm" id="prev-page" ${currentPage === 0 ? 'disabled' : ''}>Previous</button>
                            <span>Page ${currentPage + 1}</span>
                            <button class="btn btn-secondary btn-sm" id="next-page" ${r.message.length < pageLength ? 'disabled' : ''}>Next</button>
                        </div>`;
                    $('#certificate-table').html(table_html + pagination_html);
                    // Pagination events
                    $('#prev-page').off('click').on('click', function() {
                        if (currentPage > 0) fetch_certificates(currentPage - 1);
                    });
                    $('#next-page').off('click').on('click', function() {
                        if (r.message.length === pageLength) fetch_certificates(currentPage + 1);
                    });
                } else {
                    $('#certificate-table').html('<p>No certificate results found.</p>');
                }
                
                // Check if there are results but none are PASS
                if (r.message && r.message.length > 0 && r.message.filter(row => row.grade === 'PASS').length === 0) {
                    $('#certificate-table').html('<p>No certificates available. Only PASS grades are shown.</p>');
                }
            }
        });
    }

    // Get expiry status badge
    function get_expiry_status_badge(row) {
        const isExpired = row.is_expired || false;
        const needsRenewal = row.needs_renewal || false;
        const daysUntilExpiry = row.days_until_expiry;
        const status = row.custom_renewal_status || 'Not Renewed';
        
        if (status === 'Renewed') {
            return '<span class="badge badge-success">Valid (Renewed)</span>';
        } else if (isExpired) {
            return '<span class="badge badge-danger">Expired</span>';
        } else if (needsRenewal && daysUntilExpiry > 0) {
            return `<span class="badge badge-warning">Expires in ${daysUntilExpiry} days</span>`;
        } else if (daysUntilExpiry && daysUntilExpiry > 30) {
            return `<span class="badge badge-success">Valid (${daysUntilExpiry} days)</span>`;
        } else {
            return '<span class="badge badge-secondary">No Expiry</span>';
        }
    }

    // Get renewal status badge class
    function get_renewal_status_badge(status) {
        switch(status) {
            case 'Renewed':
                return 'success';
            case 'Pending Payment':
                return 'warning';
            default:
                return 'secondary';
        }
    }

    // Get renewal button based on status and expiry
    function get_renewal_button(row) {
        const status = row.custom_renewal_status || 'Not Renewed';
        const isExpired = row.is_expired || false;
        const needsRenewal = row.needs_renewal || false;
        
        if (status === 'Renewed') {
            return `<button class="btn btn-success btn-sm" disabled>Already Renewed</button>`;
        } else if (status === 'Pending Payment') {
            return `<button class="btn btn-warning btn-sm" onclick="check_payment_status('${row.name}')">Check Payment</button>`;
        } else if (isExpired || needsRenewal) {
            return `<button class="btn btn-danger btn-sm" onclick="initiate_renewal('${row.name}')">Renew Certificate</button>`;
        } else {
            return `<button class="btn btn-info btn-sm" onclick="initiate_renewal('${row.name}')">Renew Certificate</button>`;
        }
    }

    // Get download button based on expiry and renewal status
    function get_download_button(row) {
        const status = row.custom_renewal_status || 'Not Renewed';
        const isExpired = row.is_expired || false;
        const needsRenewal = row.needs_renewal || false;
        
        // Hide download if expired and not renewed
        if (isExpired && status !== 'Renewed') {
            return `<button class="btn btn-secondary btn-sm" disabled>Certificate Download Expired</button>`;
        }
        
        // Show download for valid certificates
        return `<a href="/api/method/frappe.utils.print_format.download_pdf?doctype=Assessment%20Result&name=${row.name}&format=Assessment%20Result&no_letterhead=0&letterhead=Letter%20Head%20New&_lang=en" 
                   target="_blank" 
                   class="btn btn-primary btn-sm">
                   Download PDF
                </a>`;
    }

    // Initial load
    fetch_certificates();

    // Real-time filtering
    $('#filter-student, #filter-program, #filter-customer, #filter-student-group, #filter-certificate').on('keyup', function() {
        fetch_certificates(0);
    });

    // Select all checkboxes
    $(wrapper).on('change', '#select-all', function() {
        $('.select-cert').prop('checked', $(this).is(':checked'));
    });

    // Download selected PDFs
    $(wrapper).on('click', '#download-selected', function() {
        const selected = $('.select-cert:checked').map(function() {
            return $(this).val();
        }).get();

        if (!selected.length) {
            frappe.msgprint("Please select at least one certificate.");
            return;
        }

        const url = `/api/method/frappe.utils.print_format.download_multi_pdf?doctype=Assessment%20Result&name=${encodeURIComponent(JSON.stringify(selected))}&format=Assessment%20Certificate&no_letterhead=0&letterhead=Letter%20Head%20New&options=${encodeURIComponent(JSON.stringify({ "page-size": "A4" }))}`;

        window.open(url, '_blank');
    });

    // Global functions for renewal
    window.initiate_renewal = function(certificate_name) {
        frappe.call({
            method: 'student_certificates.student_certificates.api.certificate_renewal.create_renewal_payment_request',
            args: { certificate_name: certificate_name },
            callback: function(r) {
                if (r.message && r.message.status === 'success') {
                    frappe.msgprint({
                        title: 'Renewal Payment',
                        message: `Renewal fee: $${r.message.amount}<br><br>You will be redirected to the payment page.`,
                        indicator: 'green'
                    });
                    
                    // Redirect to payment page
                    setTimeout(() => {
                        // window.open(r.message.payment_url, '_blank');
                        window.location.href = r.message.payment_url;
                    }, 2000);
                    
                    // Refresh the table after a delay
                    setTimeout(() => {
                        fetch_certificates();
                    }, 3000);
                } else {
                    frappe.msgprint({
                        title: 'Error',
                        message: r.message || 'Failed to initiate renewal',
                        indicator: 'red'
                    });
                }
            }
        });
    };

    window.check_payment_status = function(certificate_name) {
        frappe.call({
            method: 'student_certificates.student_certificates.api.certificate_renewal.get_certificate_renewal_status',
            args: { certificate_name: certificate_name },
            callback: function(r) {
                if (r.message && r.message.status === 'Renewed') {
                    frappe.msgprint({
                        title: 'Payment Successful',
                        message: 'Your certificate has been renewed successfully!',
                        indicator: 'green'
                    });
                    fetch_certificates();
                } else {
                    frappe.msgprint({
                        title: 'Payment Pending',
                        message: 'Payment is still pending. Please complete the payment to renew your certificate.',
                        indicator: 'orange'
                    });
                }
            }
        });
    };
};
