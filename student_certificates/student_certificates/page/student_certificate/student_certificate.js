frappe.pages['student-certificate'].on_page_load = function(wrapper) {
    let page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Student Certificate',
        single_column: true
    });

    const page_html = `
        <style>
            @import url("https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap");

            .certificate-portal {
                --ink: #0f1c2d;
                --muted: #5f6b7a;
                --surface: #ffffff;
                --surface-muted: #f5f7fa;
                --accent: #ff7a3d;
                --accent-dark: #d85c24;
                --accent-soft: rgba(255, 122, 61, 0.12);
                --glow: rgba(15, 28, 45, 0.08);
                font-family: "Manrope", "Space Grotesk", sans-serif;
                color: var(--ink);
                background:
                    radial-gradient(1200px 520px at -10% -10%, #fff2e8 0%, rgba(255, 242, 232, 0) 65%),
                    radial-gradient(1000px 420px at 110% 0%, #d7f4f3 0%, rgba(215, 244, 243, 0) 60%),
                    linear-gradient(180deg, #f7f6f1 0%, #eef2f6 60%, #f9fafb 100%);
                border-radius: 18px;
                padding: 28px;
                margin-top: 12px;
            }

            .certificate-hero {
                display: flex;
                flex-wrap: wrap;
                gap: 18px;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
            }

            .certificate-hero h2 {
                font-family: "Space Grotesk", "Manrope", sans-serif;
                font-size: 26px;
                font-weight: 700;
                letter-spacing: -0.02em;
                margin: 0;
            }

            .certificate-hero p {
                margin: 6px 0 0;
                color: var(--muted);
                font-size: 14px;
            }

            .certificate-hero .hero-badge {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 6px 12px;
                border-radius: 999px;
                background: rgba(255, 255, 255, 0.9);
                border: 1px solid #eceff3;
                color: var(--muted);
                font-size: 12px;
            }

            .certificate-filters {
                background: var(--surface);
                border-radius: 16px;
                box-shadow: 0 16px 36px rgba(15, 28, 45, 0.08);
                padding: 16px;
                display: grid;
                gap: 14px;
            }

            .filter-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 12px;
            }

            .filter-field label {
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 0.08em;
                color: var(--muted);
                margin-bottom: 6px;
            }

            .filter-field .form-control {
                border-radius: 12px;
                border: 1px solid #e1e4e8;
                box-shadow: none;
                height: 36px;
                background: #fbfbfc;
            }

            .filter-field .date-input.form-control {
                background-color: #ffffff;
                padding-right: 32px;
            }

            .filter-field .date-input.form-control:focus {
                border-color: #f2c3a8;
                box-shadow: 0 0 0 3px rgba(255, 122, 61, 0.15);
            }

            .date-input-wrap {
                position: relative;
                display: flex;
                align-items: center;
            }

            .date-input-wrap .date-icon-btn {
                position: absolute;
                right: 8px;
                height: 26px;
                width: 26px;
                border: none;
                background: #f2f3f5;
                border-radius: 8px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                color: #6b7785;
            }

            .date-input-wrap .date-icon-btn:hover {
                background: #e8eaee;
                color: #1d2a3a;
            }

            .datepicker {
                border: none;
                box-shadow: 0 18px 40px rgba(15, 28, 45, 0.12);
                border-radius: 16px;
                font-family: "Manrope", "Space Grotesk", sans-serif;
                overflow: hidden;
            }

            .datepicker--nav {
                background: #f7f7f4;
                border-bottom: 1px solid #f0f1f3;
            }

            .datepicker--nav-title {
                color: var(--ink);
                font-weight: 600;
            }

            .datepicker--day-name {
                color: var(--muted);
                font-weight: 600;
            }

            .datepicker--cell {
                border-radius: 10px;
            }

            .datepicker--cell.-focus- {
                background: #fff1e4;
            }

            .datepicker--cell.-current- {
                border: 1px solid #f2c3a8;
            }

            .datepicker--cell.-selected-,
            .datepicker--cell.-range-from-,
            .datepicker--cell.-range-to- {
                background: var(--accent);
                color: #ffffff;
            }

            .datepicker--cell.-in-range- {
                background: rgba(255, 122, 61, 0.12);
            }

            .datepicker--cell.-disabled- {
                color: #c4c7cc;
            }

            .filter-actions {
                display: flex;
                justify-content: flex-end;
                gap: 8px;
            }

            .bulk-actions {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 12px;
                flex-wrap: wrap;
                margin-top: 12px;
            }

            .bulk-actions .bulk-left {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .bulk-actions .bulk-right {
                display: flex;
                gap: 8px;
                align-items: center;
            }

            .portal-btn-outline {
                background: #ffffff;
                color: var(--ink);
                border: 1px solid #e1e4e8;
            }

            .portal-btn {
                border: none;
                border-radius: 10px;
                padding: 8px 16px;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                text-decoration: none;
                transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
            }

            .portal-btn-ghost {
                background: #f2f3f5;
                color: var(--ink);
            }

            .portal-btn-download {
                background: #ffe9dc;
                color: #b85a2d;
                border: 1px solid #f7c6ab;
                box-shadow: 0 10px 18px rgba(216, 92, 36, 0.18);
            }

            .portal-btn-download:hover {
                background: #ffd9c6;
                color: #a44c22;
                box-shadow: 0 14px 22px rgba(216, 92, 36, 0.22);
            }

            .portal-btn-primary {
                background: var(--accent);
                color: #ffffff;
                box-shadow: 0 12px 20px rgba(255, 122, 61, 0.25);
            }

            .portal-reset-btn {
                background: linear-gradient(135deg, #f7f0e8 0%, #ffe6d5 100%);
                border: 1px solid #f2c3a8;
                color: #5a3a2b;
                box-shadow: 0 10px 20px rgba(216, 92, 36, 0.12);
                transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
            }

            .portal-btn:hover {
                transform: translateY(-1px);
            }

            .portal-reset-btn:hover {
                transform: translateY(-1px);
                box-shadow: 0 14px 26px rgba(216, 92, 36, 0.18);
                background: linear-gradient(135deg, #fff1e4 0%, #ffd8c2 100%);
            }

            .portal-reset-btn:active {
                transform: translateY(0);
                box-shadow: 0 8px 16px rgba(216, 92, 36, 0.12);
            }

            .certificate-table {
                background: var(--surface);
                border-radius: 16px;
                box-shadow: 0 12px 30px rgba(15, 28, 45, 0.08);
                padding: 12px;
                margin-top: 18px;
            }

            .certificate-table .table {
                margin-bottom: 0;
                border-collapse: separate;
                border-spacing: 0 10px;
            }

            .certificate-table .table thead th {
                border: none;
                color: var(--muted);
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 0.08em;
                padding: 0 12px 6px;
            }

            .certificate-table .table tbody tr {
                background: var(--surface-muted);
                box-shadow: 0 6px 18px rgba(15, 28, 45, 0.06);
                transition: transform 0.15s ease, box-shadow 0.15s ease;
            }

            .certificate-table .table tbody tr:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 24px rgba(15, 28, 45, 0.12);
            }

            .certificate-table .table tbody td {
                border: none;
                padding: 12px;
                vertical-align: middle;
                font-size: 13px;
            }

            .certificate-table .table tbody tr td:first-child {
                border-radius: 12px 0 0 12px;
            }

            .certificate-table .table tbody tr td:last-child {
                border-radius: 0 12px 12px 0;
            }

            .certificate-pill {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                border-radius: 999px;
                padding: 4px 10px;
                font-size: 12px;
                font-weight: 600;
                background: #e9f6f5;
                color: #1d5450;
            }

            .certificate-pill.expired {
                background: #ffe4de;
                color: #b43c1b;
            }

            .certificate-pill.pending {
                background: #fff3d6;
                color: #8a5a00;
            }

            .table-actions {
                display: inline-flex;
                gap: 8px;
                flex-wrap: wrap;
            }

            .select-chip {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 4px 10px;
                border-radius: 999px;
                background: #f2f3f5;
                font-size: 12px;
                color: var(--muted);
            }

            .empty-state {
                text-align: center;
                color: var(--muted);
                padding: 18px 0;
            }

            @media (max-width: 768px) {
                .certificate-portal {
                    padding: 18px;
                }
            }
        </style>

        <div class="certificate-portal">
            <div class="certificate-hero">
                <div>
                    <h2>Student Certificates</h2>
                    <p>Track certificate status and download or renew in one place.</p>
                </div>
                <div class="hero-badge">
                    <span>Last refresh</span>
                    <strong id="cert-last-refresh">Just now</strong>
                </div>
            </div>

            <div class="certificate-filters">
                <div class="filter-grid">
                    <div class="filter-field">
                        <label>Date</label>
                        <div class="date-input-wrap">
                            <input type="text" id="filter-date" class="form-control date-input" placeholder="YYYY-MM-DD">
                            <button type="button" class="date-icon-btn" data-target="#filter-date" aria-label="Open calendar">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="filter-field">
                        <label>Certificate Number</label>
                        <input type="text" id="filter-certificate" class="form-control" placeholder="CERT-0001">
                    </div>
                    <div class="filter-field">
                        <label>Student Group</label>
                        <input type="text" id="filter-student-group" class="form-control" placeholder="Group name">
                    </div>
                    <div class="filter-field">
                        <label>Candidate Name</label>
                        <input type="text" id="filter-student" class="form-control" placeholder="Candidate">
                    </div>
                    <div class="filter-field">
                        <label>Program</label>
                        <input type="text" id="filter-program" class="form-control" placeholder="Program">
                    </div>
                    <div class="filter-field">
                        <label>Portal Expiry Date</label>
                        <div class="date-input-wrap">
                            <input type="text" id="filter-expiry-date" class="form-control date-input" placeholder="YYYY-MM-DD">
                            <button type="button" class="date-icon-btn" data-target="#filter-expiry-date" aria-label="Open calendar">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="filter-actions">
                    <button class="portal-btn portal-btn-ghost portal-reset-btn" id="reset-filters">Reset</button>
                </div>
            </div>

            <div class="bulk-actions">
                <div class="bulk-left">
                    <span class="select-chip" id="selected-count">0 selected</span>
                    <button class="portal-btn portal-btn-outline" id="toggle-select">Select</button>
                </div>
                <div class="bulk-right">
                    <button class="portal-btn portal-btn-primary" id="download-selected" disabled>Download Selected</button>
                </div>
            </div>

            <div class="certificate-table" id="certificate-table"></div>
        </div>
    `;

    $(wrapper).find('.layout-main-section').html(page_html);

    let currentPage = 0;
    const pageLength = 20;
    let selectionEnabled = false;
    const selectedCertificates = new Set();

    function get_picker_value(selector) {
        const picker = $(selector).data("datepicker");
        if (picker && picker.selectedDates && picker.selectedDates.length) {
            return frappe.datetime.obj_to_str(picker.selectedDates[0]);
        }
        return $(selector).val();
    }

    // Get filter values from inputs
    function get_filter_values() {
        return {
            date: get_picker_value('#filter-date'),
            name: $('#filter-certificate').val(),
            student_group: $('#filter-student-group').val(),
            student: $('#filter-student').val(),
            program: $('#filter-program').val(),
            expiry_date: get_picker_value('#filter-expiry-date')
        };
    }

    // Fetch and render certificates
    function fetch_certificates(page = 0) {
        currentPage = page;
        $("#cert-last-refresh").text(frappe.datetime.now_time(true));
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
                                    ${selectionEnabled ? '<th><input type="checkbox" id="select-all"></th>' : ''}
                                    <th>Date</th>
                                    <th>Certificate Number</th>
                                    <th>Student Group</th>
                                    <th>Candidate Name</th>
                                    <th>Program</th>
                                    <th>Expiry Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${r.message.filter(row => row.grade === 'PASS').map(row => `
                                    <tr>
                                        ${selectionEnabled ? `<td><input type="checkbox" class="select-cert" value="${row.name}" ${selectedCertificates.has(row.name) ? 'checked' : ''}></td>` : ''}
                                        <td>${format_date(row.creation)}</td>
                                        <td>${row.name}</td>
                                        <td>${row.student_group || '-'}</td>
                                        <td>${row.student_name || row.student || '-'}</td>
                                        <td>${row.program || '-'}</td>
                                        <td>${get_expiry_status_badge(row)}</td>
                                        <td>
                                            <div class="table-actions">
                                                ${get_download_button(row)}
                                                ${get_renewal_button(row)}
                                            </div>
                                        </td>
                                    </tr>`).join('')}
                            </tbody>
                        </table>`;
                    const pagination_html = `
                        <div class="d-flex justify-content-between align-items-center mt-2">
                            <button class="portal-btn portal-btn-ghost" id="prev-page" ${currentPage === 0 ? 'disabled' : ''}>Previous</button>
                            <span>Page ${currentPage + 1}</span>
                            <button class="portal-btn portal-btn-ghost" id="next-page" ${r.message.length < pageLength ? 'disabled' : ''}>Next</button>
                        </div>`;
                    $('#certificate-table').html(table_html + pagination_html);
                    sync_bulk_ui();
                    // Pagination events
                    $('#prev-page').off('click').on('click', function() {
                        if (currentPage > 0) fetch_certificates(currentPage - 1);
                    });
                    $('#next-page').off('click').on('click', function() {
                        if (r.message.length === pageLength) fetch_certificates(currentPage + 1);
                    });
                } else {
                    $('#certificate-table').html('<div class="empty-state">No certificate results found.</div>');
                    sync_bulk_ui();
                }
                
                // Check if there are results but none are PASS
                if (r.message && r.message.length > 0 && r.message.filter(row => row.grade === 'PASS').length === 0) {
                    $('#certificate-table').html('<div class="empty-state">No certificates available. Only PASS grades are shown.</div>');
                    sync_bulk_ui();
                }
            }
        });
    }

    // Get expiry status badge
    // Every certificate expires 365 days after creation, so there's always an expiry
    function get_expiry_status_badge(row) {
        const isExpired = row.is_expired || false;
        const needsRenewal = row.needs_renewal || false;
        const daysUntilExpiry = row.days_until_expiry;
        const status = row.custom_renewal_status || 'Not Renewed';

        if (status === 'Renewed') {
            return '<span class="certificate-pill">Valid (Renewed)</span>';
        } else if (isExpired) {
            return '<span class="badge badge-danger">Expired</span>';
        } else if (needsRenewal && daysUntilExpiry !== null && daysUntilExpiry !== undefined && daysUntilExpiry > 0) {
            return `<span class="badge badge-warning">Expires in ${daysUntilExpiry} days</span>`;
        } else if (daysUntilExpiry !== null && daysUntilExpiry !== undefined && daysUntilExpiry > 30) {
            return `<span class="badge badge-success">Valid (${daysUntilExpiry} days)</span>`;
        } else if (daysUntilExpiry !== null && daysUntilExpiry !== undefined && daysUntilExpiry > 0) {
            // Handle case where daysUntilExpiry is between 0-30 but needsRenewal is false
            return `<span class="badge badge-warning">Expires in ${daysUntilExpiry} days</span>`;
        } else if (daysUntilExpiry !== null && daysUntilExpiry !== undefined && daysUntilExpiry <= 0) {
            // If daysUntilExpiry is 0 or negative, it's expired
            return '<span class="badge badge-danger">Expired</span>';
        } else {
            // Fallback: if daysUntilExpiry is null/undefined (shouldn't happen), show as expired
            // This ensures we never show "No Expiry" since every certificate has a 365-day expiry rule
            return '<span class="badge badge-danger">Expired</span>';
        }

        // Fallback: if no days info, mark as expired to avoid "No Expiry"
        return '<span class="certificate-pill expired">Expired</span>';
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
            return `<button class="portal-btn portal-btn-ghost" disabled>Already Renewed</button>`;
        } else if (status === 'Pending Payment') {
            return `<button class="portal-btn portal-btn-ghost" onclick="check_payment_status('${row.name}')">Check Payment</button>`;
        } else if (isExpired || needsRenewal) {
            return `<button class="portal-btn portal-btn-primary" onclick="initiate_renewal('${row.name}')">Renew Certificate</button>`;
        } else {
            return `<button class="portal-btn portal-btn-primary" onclick="initiate_renewal('${row.name}')">Renew Certificate</button>`;
        }
    }

    // Get download button based on expiry and renewal status
    function get_download_button(row) {
        const status = row.custom_renewal_status || 'Not Renewed';
        const isExpired = row.is_expired || false;
        const needsRenewal = row.needs_renewal || false;
        
        // Hide download if expired and not renewed
        if (isExpired && status !== 'Renewed') {
            return `<button class="portal-btn portal-btn-ghost" disabled>Download Expired</button>`;
        }
        
        // Show download for valid certificates
        return `<a href="/api/method/frappe.utils.print_format.download_pdf?doctype=Assessment%20Result&name=${row.name}&format=Assessment%20Result&no_letterhead=0&letterhead=Letter%20Head%20New&_lang=en" 
                   target="_blank" 
                   class="portal-btn portal-btn-download">
                   Download PDF
                </a>`;
    }

    function format_date(value) {
        if (!value) return '';
        try {
            return frappe.datetime.str_to_user(value);
        } catch (e) {
            return value;
        }
    }

    // Initial load
    fetch_certificates();

    function init_date_picker(selector) {
        if (!$.fn.datepicker) return;
        const lang = frappe.boot.lang || "en";
        $(selector).datepicker({
            language: $.fn.datepicker.language[lang] ? lang : "en",
            dateFormat: "yyyy-mm-dd",
            autoClose: true,
            onSelect: function () {
                fetch_certificates(0);
            }
        });
        const picker = $(selector).data("datepicker");
        const $icon = $(`[data-target="${selector}"]`);
        $icon.off("click").on("click", function (e) {
            e.preventDefault();
            if (picker && picker.show) {
                picker.show();
            } else {
                $(selector).trigger("focus");
            }
        });
    }

    init_date_picker("#filter-date");
    init_date_picker("#filter-expiry-date");

    // Real-time filtering
    $('#filter-student, #filter-program, #filter-student-group, #filter-certificate').on('input', function() {
        fetch_certificates(0);
    });

    $('#filter-date, #filter-expiry-date').on('change', function() {
        fetch_certificates(0);
    });

    $('#reset-filters').on('click', function() {
        const datePicker = $('#filter-date').data("datepicker");
        const expiryPicker = $('#filter-expiry-date').data("datepicker");
        if (datePicker) {
            datePicker.clear();
        } else {
            $('#filter-date').val('');
        }
        $('#filter-date').val('');
        $('#filter-certificate').val('');
        $('#filter-student-group').val('');
        $('#filter-student').val('');
        $('#filter-program').val('');
        if (expiryPicker) {
            expiryPicker.clear();
        } else {
            $('#filter-expiry-date').val('');
        }
        fetch_certificates(0);
    });

    function sync_bulk_ui() {
        const count = selectedCertificates.size;
        $('#selected-count').text(`${count} selected`);
        $('#download-selected').prop('disabled', count === 0);
        $('#toggle-select').text(selectionEnabled ? 'Hide Select' : 'Select');
    }

    $(wrapper).on('click', '#toggle-select', function() {
        selectionEnabled = !selectionEnabled;
        if (!selectionEnabled) {
            selectedCertificates.clear();
        }
        fetch_certificates(currentPage);
    });

    $(wrapper).on('change', '#select-all', function() {
        const checked = $(this).is(':checked');
        $('.select-cert').prop('checked', checked);
        if (checked) {
            $('.select-cert').each(function() {
                selectedCertificates.add($(this).val());
            });
        } else {
            $('.select-cert').each(function() {
                selectedCertificates.delete($(this).val());
            });
        }
        sync_bulk_ui();
    });

    $(wrapper).on('change', '.select-cert', function() {
        const value = $(this).val();
        if ($(this).is(':checked')) {
            selectedCertificates.add(value);
        } else {
            selectedCertificates.delete(value);
        }
        sync_bulk_ui();
    });

    $(wrapper).on('click', '#download-selected', function() {
        if (selectedCertificates.size === 0) {
            frappe.msgprint("Please select at least one certificate.");
            return;
        }

        const selected = Array.from(selectedCertificates);
        const formatName = "Assessment Result";
        const letterheadName = "Letter Head New";

        const url = `/api/method/student_certificates.student_certificates.page.student_certificate.student_certificate.download_selected_certificates` +
            `?names=${encodeURIComponent(JSON.stringify(selected))}` +
            `&format_name=${encodeURIComponent(formatName)}` +
            `&letterhead=${encodeURIComponent(letterheadName)}` +
            `&no_letterhead=0`;

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
