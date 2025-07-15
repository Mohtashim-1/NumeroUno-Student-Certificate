import frappe

@frappe.whitelist()
def get_trainer_pending_attendance():
    user = frappe.session.user
    user_email = frappe.db.get_value("User", user, "email")
    
    # If Administrator, return all pending attendance
    if user == "Administrator":
        return frappe.db.get_all(
            "Student Attendance",
            filters={"docstatus": 0},
            fields=["name", "student", "student_name", "date", "status", "custom_student_signature", "docstatus"]
        )

    if not user_email:
        return []

    # Get all Course Schedule names where custom_email matches the user's email
    course_schedule_names = frappe.db.get_all(
        "Course Schedule",
        filters={"custom_email": user_email},
        pluck="name"
    )
    if not course_schedule_names:
        return []

    # Get pending Student Attendance for those Course Schedules
    records = frappe.db.get_all(
        "Student Attendance",
        filters={
            "docstatus": 0,
            "course_schedule": ["in", course_schedule_names]
        },
        fields=["name", "student", "student_name", "date", "status", "custom_student_signature", "docstatus"]
    )
    return records
