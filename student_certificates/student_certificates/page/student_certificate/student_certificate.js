frappe.pages['student-certificate'].on_page_load = function(wrapper) {
    let page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Customer Support Portal',
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

            .certificate-table .col-student {
                width: 26%;
            }

            .certificate-table .col-program {
                width: 18%;
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

            .table-actions .portal-btn {
                min-width: 130px;
                justify-content: center;
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

            .portal-main-menu {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
                margin-bottom: 18px;
                padding: 6px;
                background: rgba(255, 255, 255, 0.75);
                border: 1px solid #eceff3;
                border-radius: 14px;
                width: fit-content;
                max-width: 100%;
            }

            .portal-main-menu .portal-menu-btn {
                border: none;
                border-radius: 10px;
                padding: 10px 18px;
                font-size: 13px;
                font-weight: 700;
                cursor: pointer;
                background: transparent;
                color: var(--muted);
                transition: background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
            }

            .portal-main-menu .portal-menu-btn.active {
                background: var(--accent);
                color: #fff;
                box-shadow: 0 10px 18px rgba(255, 122, 61, 0.22);
            }

            .portal-main-menu .portal-menu-btn:not(.active):hover {
                background: #fff1e4;
                color: var(--ink);
            }

            .portal-view { display: none; }
            .portal-view.active { display: block; }

            .training-panel {
                background: var(--surface);
                border-radius: 16px;
                box-shadow: 0 16px 36px rgba(15, 28, 45, 0.08);
                padding: 18px;
                margin-bottom: 18px;
            }

            .training-panel h3 {
                font-family: "Space Grotesk", "Manrope", sans-serif;
                font-size: 18px;
                margin: 0 0 4px;
            }

            .training-panel .panel-sub {
                color: var(--muted);
                font-size: 13px;
                margin: 0 0 14px;
            }

            .training-form-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 12px;
                margin-bottom: 12px;
            }

            .candidate-card {
                border: 1px dashed #d8dde5;
                border-radius: 14px;
                padding: 14px;
                background: #fbfcfe;
                margin-bottom: 12px;
            }

            .candidate-card .cand-head {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
                font-weight: 600;
                font-size: 13px;
            }

            .id-attach-row {
                display: flex;
                gap: 10px;
                align-items: center;
                flex-wrap: wrap;
            }

            .id-attach-row .attach-name {
                font-size: 12px;
                color: var(--muted);
            }

            .tdr-list {
                margin-top: 14px;
                display: grid;
                gap: 10px;
            }

            .tdr-card {
                border: 1px solid #eceff3;
                border-radius: 12px;
                padding: 12px 14px;
                background: var(--surface-muted);
                display: flex;
                justify-content: space-between;
                gap: 12px;
                flex-wrap: wrap;
                align-items: center;
            }

            .tdr-card .meta {
                font-size: 12px;
                color: var(--muted);
                margin-top: 4px;
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
                    <h2>Customer Support Portal</h2>
                    <p id="portal-hero-sub">Download certificates or submit training date requests.</p>
                </div>
                <div class="hero-badge">
                    <span>Last refresh</span>
                    <strong id="cert-last-refresh">Just now</strong>
                </div>
            </div>

            <div class="portal-main-menu" role="tablist" aria-label="Portal menus">
                <button type="button" class="portal-menu-btn active" data-portal-view="certificates" id="menu-certificates">Certificates</button>
                <button type="button" class="portal-menu-btn" data-portal-view="training" id="menu-training">Training Request</button>
            </div>

            <div class="portal-view active" id="portal-view-certificates">
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

            <div class="portal-view" id="portal-view-training">
            <div class="training-panel" id="training-date-panel">
                <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:flex-start">
                    <div>
                        <h3>Training date requests</h3>
                        <p class="panel-sub">Add candidates (Full Name, Emirates ID / Passport No., Date of Birth, Contact Number, Email). After CSV load, upload each ID document one by one, then submit.</p>
                        <div id="tdr-staff-pending" class="hero-badge" style="display:none;margin-top:10px">
                            <span>Pending requests (staff)</span>
                            <strong id="tdr-pending-count">0</strong>
                        </div>
                    </div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap">
                        <button type="button" class="portal-btn portal-btn-outline" id="tdr-tab-manual">Manual form</button>
                        <button type="button" class="portal-btn portal-btn-primary" id="tdr-tab-csv">CSV Bulk Upload</button>
                    </div>
                </div>

                <div class="tdr-menu" style="display:flex;gap:8px;margin:14px 0 8px;flex-wrap:wrap">
                    <button type="button" class="portal-btn portal-btn-ghost" id="toggle-tdr-form">Request training date</button>
                    <button type="button" class="portal-btn portal-btn-ghost" id="toggle-tdr-csv">Open CSV upload</button>
                </div>

                <div id="tdr-form" style="display:none;margin-top:8px">
                    <div class="training-form-grid">
                        <div class="filter-field">
                            <label>Course</label>
                            <div id="tdr-course-link"></div>
                            <input type="hidden" id="tdr-course" value="">
                        </div>
                        <div class="filter-field">
                            <label>Preferred date</label>
                            <div class="date-input-wrap">
                                <input type="text" id="tdr-preferred-date" class="form-control date-input" placeholder="YYYY-MM-DD">
                                <button type="button" class="date-icon-btn" data-target="#tdr-preferred-date" aria-label="Open calendar">
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
                            <label>Contact name</label>
                            <input type="text" id="tdr-contact-name" class="form-control" placeholder="Optional">
                        </div>
                        <div class="filter-field">
                            <label>Contact phone</label>
                            <input type="text" id="tdr-contact-phone" class="form-control" placeholder="Optional">
                        </div>
                    </div>
                    <div class="filter-field" style="margin-bottom:12px">
                        <label>Notes</label>
                        <textarea id="tdr-notes" class="form-control" rows="2" placeholder="Scheduling preferences…" style="height:auto;min-height:64px"></textarea>
                    </div>

                    <div style="display:flex;justify-content:space-between;align-items:flex-end;margin:8px 0 6px;gap:8px;flex-wrap:wrap">
                        <div>
                            <strong style="font-size:13px">Candidates</strong>
                            <div class="panel-sub" style="margin:2px 0 0">Select a previous student by Emirates ID / Passport, or add new.</div>
                        </div>
                        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
                            <select id="tdr-saved-candidates" class="form-control" style="min-width:260px;max-width:380px;height:34px" title="Previous students for this customer">
                                <option value="">Select previous student (Emirates ID / Passport)…</option>
                            </select>
                            <button type="button" class="portal-btn portal-btn-outline" id="tdr-add-candidate">+ New candidate</button>
                        </div>
                    </div>
                    <div id="tdr-candidates"></div>

                    <div style="display:flex;gap:8px;margin-top:10px">
                        <button type="button" class="portal-btn portal-btn-primary" id="tdr-submit">Submit request</button>
                        <button type="button" class="portal-btn portal-btn-ghost" id="tdr-cancel">Cancel</button>
                    </div>
                </div>

                <div id="tdr-csv-form" style="display:none;margin-top:8px">
                    <div class="panel-sub" style="margin-bottom:12px">
                        Load candidates from CSV into the request form. After import you will upload each candidate’s ID document one by one, then submit.
                        CSV columns: Full Name, Emirates ID / Passport No., Date of Birth, Contact Number, Email.
                    </div>
                    <div style="display:flex;flex-wrap:wrap;gap:8px;margin:12px 0">
                        <button type="button" class="portal-btn portal-btn-outline" id="tdr-csv-template">Download CSV template</button>
                    </div>
                    <div class="filter-field">
                        <label>Candidates CSV *</label>
                        <input type="file" id="tdr-csv-file" class="form-control" accept=".csv,text/csv" style="height:auto;padding:8px">
                    </div>
                    <div style="display:flex;gap:8px;margin-top:12px">
                        <button type="button" class="portal-btn portal-btn-primary" id="tdr-csv-submit">Load CSV into form</button>
                        <button type="button" class="portal-btn portal-btn-ghost" id="tdr-csv-cancel">Cancel</button>
                    </div>
                </div>

                <div class="tdr-list" id="tdr-list">
                    <div class="empty-state">Loading training date requests…</div>
                </div>
            </div>
            </div>
        </div>
    `;

    $(wrapper).find('.layout-main-section').html(page_html);

    let currentPage = 0;
    const pageLength = 20;
    let selectionEnabled = false;
    const selectedCertificates = new Set();
    let tdrListLoaded = false;

    function set_portal_view(view) {
        const next = view === "training" ? "training" : "certificates";
        $(".portal-menu-btn").removeClass("active");
        $(`.portal-menu-btn[data-portal-view="${next}"]`).addClass("active");
        $(".portal-view").removeClass("active");
        $(`#portal-view-${next}`).addClass("active");
        if (next === "training") {
            $("#portal-hero-sub").text("Submit training date requests with candidate details. Use CSV to load candidates, then upload each ID on the form.");
            if (!tdrListLoaded) {
                fetch_tdr_list();
                tdrListLoaded = true;
            }
        } else {
            $("#portal-hero-sub").text("Track certificate status and download or renew in one place.");
            fetch_certificates(currentPage);
        }
    }

    $(wrapper).on("click", ".portal-menu-btn", function () {
        set_portal_view($(this).data("portal-view"));
    });

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
        const uaeTime = new Date().toLocaleString("en-GB", {
            timeZone: "Asia/Dubai",
            hour12: true,
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        });
        $("#cert-last-refresh").text(`Dubai time · ${uaeTime}`);
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
                                    <th class="col-student">Candidate Name</th>
                                    <th class="col-program">Program</th>
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
                                        <td class="col-student">${row.student_name || row.student || '-'}</td>
                                        <td class="col-program">${row.program || '-'}</td>
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
            return `<button class="portal-btn portal-btn-download" onclick="check_payment_status('${row.name}')">Check Payment</button>`;
        } else if (isExpired || needsRenewal) {
            return `<button class="portal-btn portal-btn-download" onclick="initiate_renewal('${row.name}')">Renew Certificate</button>`;
        } else {
            return `<button class="portal-btn portal-btn-download" onclick="initiate_renewal('${row.name}')">Renew Certificate</button>`;
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

        if (row.custom_certificate && row.custom_certificate.toLowerCase().endsWith('.pdf')) {
            return `<a href="${encodeURI(row.custom_certificate)}"
                       target="_blank"
                       class="portal-btn portal-btn-primary">
                       Download PDF
                    </a>`;
        }
        
        // Show download for valid certificates
        return `<a href="/api/method/frappe.utils.print_format.download_pdf?doctype=Assessment%20Result&name=${row.name}&format=Assessment%20Result&no_letterhead=0&letterhead=Letter%20Head%20New&_lang=en" 
                   target="_blank" 
                   class="portal-btn portal-btn-primary">
                   Download PDF
                </a>`;
    }

    function format_date(value) {
        if (!value) return '';
        try {
            return frappe.datetime.str_to_user(value, false, true);
        } catch (e) {
            return value;
        }
    }

    // Initial load
    // Certificates load via set_portal_view("certificates") at end of page setup

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

    // ── Training Date Negotiation (Certificate Portal) ──
    const TDR_API = 'numerouno.numerouno.api.training_date_request';
    let tdrCandidateSeq = 0;

    function tdr_escape(s) {
        return frappe.utils.escape_html(s || '');
    }

    function add_tdr_candidate(data = {}) {
        tdrCandidateSeq += 1;
        const idx = tdrCandidateSeq;
        const html = `
            <div class="candidate-card" data-cand="${idx}">
                <div class="cand-head">
                    <span>Candidate #${idx}</span>
                    <button type="button" class="portal-btn portal-btn-ghost tdr-remove-cand" data-cand="${idx}">Remove</button>
                </div>
                <div class="training-form-grid">
                    <div class="filter-field">
                        <label>Full name (with employee ID if any) *</label>
                        <input type="text" class="form-control cand-full-name" value="${tdr_escape(data.full_name || '')}" required>
                    </div>
                    <div class="filter-field">
                        <label>Emirates ID / Passport No. *</label>
                        <input type="text" class="form-control cand-id-number" value="${tdr_escape(data.id_number || '')}" required>
                    </div>
                    <div class="filter-field">
                        <label>Date of birth *</label>
                        <input type="date" class="form-control cand-dob" value="${tdr_escape(data.date_of_birth || '')}" required>
                    </div>
                    <div class="filter-field">
                        <label>Contact number *</label>
                        <input type="text" class="form-control cand-phone" value="${tdr_escape(data.contact_number || '')}" required>
                    </div>
                    <div class="filter-field">
                        <label>Email *</label>
                        <input type="email" class="form-control cand-email" value="${tdr_escape(data.email || '')}" required>
                    </div>
                </div>
                <div class="filter-field" style="margin-top:8px">
                    <label>ID document * (upload file for each candidate — not a link)</label>
                    <div class="id-attach-row">
                        <button type="button" class="portal-btn portal-btn-outline cand-upload-id" data-cand="${idx}">Upload ID</button>
                        <input type="hidden" class="cand-id-attachment" value="${tdr_escape(data.id_attachment || '')}">
                        <span class="attach-name cand-attach-label">${data.id_attachment ? tdr_escape(data.id_attachment.split('/').pop()) : 'No file attached'}</span>
                    </div>
                </div>
            </div>`;
        $('#tdr-candidates').append(html);
    }

    function collect_tdr_candidates() {
        const rows = [];
        $('#tdr-candidates .candidate-card').each(function () {
            const $c = $(this);
            rows.push({
                full_name: ($c.find('.cand-full-name').val() || '').trim(),
                id_number: ($c.find('.cand-id-number').val() || '').trim(),
                date_of_birth: ($c.find('.cand-dob').val() || '').trim() || null,
                contact_number: ($c.find('.cand-phone').val() || '').trim(),
                email: ($c.find('.cand-email').val() || '').trim(),
                id_attachment: ($c.find('.cand-id-attachment').val() || '').trim(),
            });
        });
        return rows;
    }

    let tdrCourseControl = null;
    let tdrSavedCandidates = [];

    function init_tdr_course_link() {
        const $wrap = $('#tdr-course-link');
        if (!$wrap.length) return;
        if (tdrCourseControl) {
            tdrCourseControl.refresh();
            return;
        }
        $wrap.empty();
        tdrCourseControl = frappe.ui.form.make_control({
            parent: $wrap.get(0),
            df: {
                fieldtype: 'Link',
                options: 'Course',
                fieldname: 'tdr_course',
                placeholder: __('Search course'),
                only_select: true,
                get_query() {
                    const filters = {};
                    // Prefer active courses when the field exists
                    return { filters };
                },
                change() {
                    const val = tdrCourseControl.get_value() || '';
                    $('#tdr-course').val(val);
                },
            },
            render_input: true,
        });
        tdrCourseControl.refresh();
        $wrap.find('.control-input, .frappe-control').css({ width: '100%' });
        $wrap.find('input').addClass('form-control').attr('placeholder', 'Type to search course…');
    }

    function reset_tdr_course() {
        $('#tdr-course').val('');
        if (tdrCourseControl) {
            tdrCourseControl.set_value('');
        }
    }

    function load_tdr_saved_candidates() {
        frappe.call({
            method: `${TDR_API}.list_saved_candidates`,
            callback(r) {
                tdrSavedCandidates = r.message || [];
                const opts = ['<option value="">Select previous student (Emirates ID / Passport)…</option>']
                    .concat(
                        tdrSavedCandidates.map((c, i) =>
                            `<option value="${i}">${tdr_escape(c.label || c.full_name)}</option>`
                        )
                    );
                $('#tdr-saved-candidates').html(opts.join(''));
                // Always show — empty state still educates the user
                $('#tdr-saved-candidates').show();
                if (!tdrSavedCandidates.length) {
                    $('#tdr-saved-candidates').prop('disabled', true);
                } else {
                    $('#tdr-saved-candidates').prop('disabled', false);
                }
            },
        });
    }

    function load_tdr_courses() {
        // Kept for compatibility; searchable Link replaces the old select.
        init_tdr_course_link();
        load_tdr_saved_candidates();
    }

    function render_tdr_list(rows) {
        if (!rows || !rows.length) {
            $('#tdr-list').html('<div class="empty-state">No training date requests yet. Use “Request training date” or “CSV Bulk Upload” above.</div>');
            return;
        }
        const html = rows.map((dr) => {
            const candNames = (dr.candidates || []).map((c) => c.full_name).filter(Boolean).join(', ');
            const actions = [];
            if (dr.can_confirm_proposal) {
                actions.push(`<button type="button" class="portal-btn portal-btn-primary tdr-confirm" data-name="${tdr_escape(dr.name)}">Confirm proposed date</button>`);
            }
            if (dr.can_request_review) {
                actions.push(`<button type="button" class="portal-btn portal-btn-ghost tdr-review" data-name="${tdr_escape(dr.name)}">Request another review</button>`);
            }
            return `
                <div class="tdr-card">
                    <div>
                        <strong>${tdr_escape(dr.course_name)}</strong>
                        <span class="certificate-pill" style="margin-left:8px">${tdr_escape(dr.status)}</span>
                        <div class="meta">
                            ${tdr_escape(dr.name)} · Preferred ${tdr_escape(dr.preferred_date_fmt)}
                            ${dr.proposed_date_fmt ? ` · Proposed <strong>${tdr_escape(dr.proposed_date_fmt)}</strong>` : ''}
                            ${dr.confirmed_date_fmt ? ` · Confirmed <strong>${tdr_escape(dr.confirmed_date_fmt)}</strong>` : ''}
                        </div>
                        <div class="meta">${(dr.participants || (dr.candidates || []).length || 0)} candidate(s)${candNames ? `: ${tdr_escape(candNames)}` : ''}</div>
                        ${dr.course_schedule ? `<div class="meta">On training calendar · ${tdr_escape(dr.course_schedule)}</div>` : ''}
                        ${dr.coordinator_notes ? `<div class="meta">NUTC note: ${tdr_escape(dr.coordinator_notes)}</div>` : ''}
                    </div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap">${actions.join('') || (dr.is_open ? '<span class="meta">Awaiting NUTC review</span>' : '')}</div>
                </div>`;
        }).join('');
        $('#tdr-list').html(html);
    }

    function fetch_tdr_list() {
        frappe.call({
            method: `${TDR_API}.list_my_date_requests`,
            callback(r) {
                const payload = r.message || {};
                const rows = Array.isArray(payload) ? payload : (payload.requests || []);
                const isStaff = !Array.isArray(payload) && !!payload.is_staff;
                const pending = !Array.isArray(payload) ? payload.pending_open_count : null;
                if (isStaff && pending !== null && pending !== undefined) {
                    $('#tdr-staff-pending').show();
                    $('#tdr-pending-count').text(pending);
                } else {
                    $('#tdr-staff-pending').hide();
                }
                render_tdr_list(rows);
            },
            error() {
                $('#tdr-list').html('<div class="empty-state">Could not load training date requests.</div>');
            },
        });
    }

    function init_tdr_preferred_date() {
        if (!$.fn.datepicker) return;
        const lang = frappe.boot.lang || 'en';
        ['#tdr-preferred-date'].forEach((selector) => {
            const $el = $(selector);
            if ($el.data('datepicker')) return;
            $el.datepicker({
                language: $.fn.datepicker.language[lang] ? lang : 'en',
                dateFormat: 'yyyy-mm-dd',
                autoClose: true,
                minDate: new Date(),
            });
            const picker = $el.data('datepicker');
            $(`[data-target="${selector}"]`).off('click').on('click', function (e) {
                e.preventDefault();
                if (picker && picker.show) picker.show();
                else $el.trigger('focus');
            });
        });
    }

    function showManualForm() {
        $('#tdr-csv-form').hide();
        $('#tdr-form').show();
        if (!$('#tdr-candidates .candidate-card').length) add_tdr_candidate();
        init_tdr_preferred_date();
        load_tdr_courses();
    }

    function showCsvForm() {
        $('#tdr-form').hide();
        $('#tdr-csv-form').show();
        init_tdr_preferred_date();
        load_tdr_courses();
    }

    $('#toggle-tdr-form, #tdr-tab-manual').on('click', function () {
        if ($('#tdr-form').is(':visible') && $(this).attr('id') === 'toggle-tdr-form') {
            $('#tdr-form').hide();
            return;
        }
        showManualForm();
    });

    $('#toggle-tdr-csv, #tdr-tab-csv').on('click', function () {
        if ($('#tdr-csv-form').is(':visible') && $(this).attr('id') === 'toggle-tdr-csv') {
            $('#tdr-csv-form').hide();
            return;
        }
        showCsvForm();
    });

    $('#tdr-cancel').on('click', function () {
        $('#tdr-form').hide();
    });

    $('#tdr-csv-cancel').on('click', function () {
        $('#tdr-csv-form').hide();
    });

    $('#tdr-add-candidate').on('click', function () {
        add_tdr_candidate();
    });

    function apply_saved_candidate_to_card($card, saved) {
        if (!$card || !$card.length || !saved) return;
        $card.find('.cand-full-name').val(saved.full_name || '');
        $card.find('.cand-id-number').val(saved.id_number || '');
        $card.find('.cand-dob').val(saved.date_of_birth || '');
        $card.find('.cand-phone').val(saved.contact_number || '');
        $card.find('.cand-email').val(saved.email || '');
        $card.find('.cand-id-attachment').val(saved.id_attachment || '');
        $card.find('.cand-attach-label').text(
            saved.id_attachment
                ? String(saved.id_attachment).split('/').pop()
                : 'No file attached'
        );
    }

    function fill_from_saved(saved) {
        if (!saved) return;
        const payload = {
            full_name: saved.full_name,
            id_number: saved.id_number,
            date_of_birth: saved.date_of_birth,
            contact_number: saved.contact_number,
            email: saved.email,
            id_attachment: saved.id_attachment || '',
        };
        const $blank = $('#tdr-candidates .candidate-card').filter(function () {
            return !($(this).find('.cand-full-name').val() || '').trim();
        }).first();
        if ($blank.length) {
            apply_saved_candidate_to_card($blank, payload);
        } else {
            add_tdr_candidate(payload);
        }
    }

    $('#tdr-saved-candidates').on('change', function () {
        const idx = $(this).val();
        if (idx === '' || idx == null) return;
        const saved = tdrSavedCandidates[parseInt(idx, 10)];
        if (!saved) return;
        fill_from_saved(saved);
        $(this).val('');
        frappe.show_alert({
            message: __('Student selected — attach ID if needed, then submit'),
            indicator: 'blue',
        });
    });

    // While typing Emirates ID / Passport, auto-fill if already known for this customer
    $(wrapper).on('blur', '.cand-id-number', function () {
        const $card = $(this).closest('.candidate-card');
        const idVal = ($(this).val() || '').trim();
        if (!idVal) return;
        // Skip if name already filled (user is editing)
        if (($card.find('.cand-full-name').val() || '').trim()) return;
        frappe.call({
            method: `${TDR_API}.find_candidate_by_id`,
            args: { id_number: idVal },
            callback(r) {
                if (!r.message) return;
                apply_saved_candidate_to_card($card, r.message);
                frappe.show_alert({
                    message: __('Matched existing student by Emirates ID / Passport'),
                    indicator: 'green',
                });
            },
        });
    });

    $(wrapper).on('click', '.tdr-remove-cand', function () {
        const $cards = $('#tdr-candidates .candidate-card');
        if ($cards.length <= 1) {
            frappe.msgprint('At least one candidate is required.');
            return;
        }
        $(this).closest('.candidate-card').remove();
    });

    $(wrapper).on('click', '.cand-upload-id', function () {
        const $card = $(this).closest('.candidate-card');
        new frappe.ui.FileUploader({
            allow_multiple: false,
            restrictions: {
                allowed_file_types: ['image/*', '.pdf', 'application/pdf'],
            },
            on_success(file) {
                const url = file.file_url || file.file_name;
                $card.find('.cand-id-attachment').val(url);
                $card.find('.cand-attach-label').text(file.file_name || url);
                frappe.show_alert({ message: __('ID document attached'), indicator: 'green' });
            },
        });
    });

    $('#tdr-submit').on('click', function () {
        const preferred = get_picker_value('#tdr-preferred-date') || $('#tdr-preferred-date').val();
        const course = $('#tdr-course').val();
        const candidates = collect_tdr_candidates();
        if (!course) {
            frappe.msgprint('Please select a course.');
            return;
        }
        if (!preferred) {
            frappe.msgprint('Please choose a preferred date.');
            return;
        }
        if (!candidates.length) {
            frappe.msgprint('Please add at least one candidate.');
            return;
        }
        for (let i = 0; i < candidates.length; i++) {
            const c = candidates[i];
            if (!c.full_name || !c.id_number || !c.date_of_birth || !c.contact_number || !c.email) {
                frappe.msgprint(`Candidate #${i + 1}: Full Name, Emirates ID/Passport No., Date of Birth, Contact Number and Email are required.`);
                return;
            }
            if (!c.id_attachment) {
                frappe.msgprint(`Candidate #${i + 1}: Please upload the ID document.`);
                return;
            }
        }

        frappe.call({
            method: `${TDR_API}.submit_date_request`,
            args: {
                course,
                preferred_date: preferred,
                candidates: JSON.stringify(candidates),
                customer_notes: $('#tdr-notes').val(),
                contact_name: $('#tdr-contact-name').val(),
                contact_phone: $('#tdr-contact-phone').val(),
            },
            freeze: true,
            freeze_message: __('Submitting…'),
            callback(r) {
                if (r.exc) return;
                frappe.show_alert({ message: __('Training date request submitted'), indicator: 'green' });
                $('#tdr-form').hide();
                $('#tdr-candidates').empty();
                $('#tdr-notes').val('');
                reset_tdr_course();
                const picker = $('#tdr-preferred-date').data('datepicker');
                if (picker) picker.clear();
                else $('#tdr-preferred-date').val('');
                load_tdr_saved_candidates();
                fetch_tdr_list();
            },
        });
    });

    function parse_candidate_csv_text(text) {
        const lines = String(text || "").split(/\r?\n/).filter((l) => l.trim());
        if (lines.length < 2) {
            throw new Error("CSV needs a header row and at least one candidate row.");
        }
        const split = (line) => {
            // simple CSV split supporting quoted commas
            const out = [];
            let cur = "";
            let q = false;
            for (let i = 0; i < line.length; i++) {
                const ch = line[i];
                if (ch === '"') {
                    q = !q;
                    continue;
                }
                if (ch === "," && !q) {
                    out.push(cur.trim());
                    cur = "";
                    continue;
                }
                cur += ch;
            }
            out.push(cur.trim());
            return out;
        };
        const headers = split(lines[0]).map((h) => h.toLowerCase().replace(/\s+/g, "_").replace(/\//g, "_"));
        const alias = {
            name: "full_name",
            candidate_name: "full_name",
            emirates_id: "id_number",
            emirates_id_passport_no: "id_number",
            emirates_id__passport_no: "id_number",
            passport_no: "id_number",
            passport_number: "id_number",
            dob: "date_of_birth",
            phone: "contact_number",
            mobile: "contact_number",
        };
        const mapped = headers.map((h) => alias[h] || h);
        const need = ["full_name", "id_number", "date_of_birth", "contact_number", "email"];
        const missing = need.filter((k) => !mapped.includes(k));
        if (missing.length) {
            throw new Error("CSV missing columns: " + missing.join(", "));
        }
        const rows = [];
        for (let i = 1; i < lines.length; i++) {
            const cols = split(lines[i]);
            const row = {};
            mapped.forEach((key, idx) => {
                row[key] = (cols[idx] || "").trim();
            });
            if (!row.full_name) continue;
            rows.push({
                full_name: row.full_name,
                id_number: row.id_number,
                date_of_birth: row.date_of_birth,
                contact_number: row.contact_number,
                email: row.email,
            });
        }
        if (!rows.length) {
            throw new Error("CSV has no candidate rows.");
        }
        return rows;
    }

    $('#tdr-csv-template').on('click', function () {
        frappe.call({
            method: `${TDR_API}.get_candidate_csv_template`,
            callback(r) {
                const res = r.message || {};
                const blob = new Blob([res.content || ''], { type: 'text/csv;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = res.filename || 'training_candidates_template.csv';
                a.click();
                URL.revokeObjectURL(url);
            },
        });
    });

    $('#tdr-csv-submit').on('click', function () {
        const csvInput = document.getElementById('tdr-csv-file');
        if (!csvInput?.files?.length) {
            frappe.msgprint('Please choose a candidates CSV file.');
            return;
        }
        const file = csvInput.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const rows = parse_candidate_csv_text(reader.result);
                // Prefill manual form — user uploads ID one by one, then submits
                $('#tdr-candidates').empty();
                tdrCandidateSeq = 0;
                rows.forEach((row) => add_tdr_candidate(row));
                $('#tdr-csv-form').hide();
                showManualForm();
                csvInput.value = '';
                frappe.msgprint({
                    title: __('Candidates loaded'),
                    message: __(
                        '{0} candidate(s) loaded into the form. Please upload each candidate ID document one by one, then click Submit request.',
                        [rows.length]
                    ),
                    indicator: 'blue',
                });
            } catch (e) {
                frappe.msgprint({ title: __('CSV error'), message: e.message || String(e), indicator: 'red' });
            }
        };
        reader.onerror = () => frappe.msgprint('Could not read CSV file.');
        reader.readAsText(file);
    });

    $(wrapper).on('click', '.tdr-confirm', function () {
        const name = $(this).data('name');
        frappe.call({
            method: `${TDR_API}.confirm_proposed_date`,
            args: { name },
            freeze: true,
            callback(r) {
                if (!r.exc) {
                    frappe.show_alert({ message: __('Date confirmed'), indicator: 'green' });
                    fetch_tdr_list();
                }
            },
        });
    });

    $(wrapper).on('click', '.tdr-review', function () {
        const name = $(this).data('name');
        frappe.prompt(
            {
                fieldname: 'customer_notes',
                fieldtype: 'Small Text',
                label: __('Why do you need another date?'),
            },
            (values) => {
                frappe.call({
                    method: `${TDR_API}.request_date_review`,
                    args: { name, customer_notes: values.customer_notes },
                    freeze: true,
                    callback(r) {
                        if (!r.exc) {
                            frappe.show_alert({ message: __('Sent back for review'), indicator: 'blue' });
                            fetch_tdr_list();
                        }
                    },
                });
            },
            __('Request another review'),
            __('Send')
        );
    });

    // Default menu: Certificates (Training Request loads on demand)
    set_portal_view("certificates");
};
