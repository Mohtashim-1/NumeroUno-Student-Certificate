import frappe
import traceback

@frappe.whitelist()
def get_trainer_pending_attendance():
    try:
        user = frappe.session.user
        user_roles = frappe.get_roles(user)
        user_email = frappe.db.get_value("User", user, "email")
        
        # Log function entry
        print(f"[get_trainer_pending_attendance] Function called - User: {user}, Email: {user_email}, Roles: {user_roles}")
        frappe.log_error(
            message=f"get_trainer_pending_attendance called - User: {user}, Email: {user_email}, Roles: {user_roles}",
            title="Student Attendance - Function Entry"
        )
        
        # If Administrator or System Manager, return all pending attendance
        if user == "Administrator" or "System Manager" in user_roles:
            print(f"[get_trainer_pending_attendance] User is Administrator or System Manager - fetching all pending attendance")
            frappe.log_error(
                message=f"User {user} is Administrator/System Manager - fetching all pending attendance",
                title="Student Attendance - Admin Path"
            )
            
            records = frappe.db.get_all(
                "Student Attendance",
                filters={"docstatus": 0},
                fields=["name", "student", "student_name", "date", "status", "custom_student_signature", "docstatus", "student_group", "course_schedule"]
            )
            
            print(f"[get_trainer_pending_attendance] Admin query returned {len(records)} records")
            frappe.log_error(
                message=f"Admin query returned {len(records)} records",
                title="Student Attendance - Admin Query Result"
            )
            
            return records

        # For Instructor role: Get attendance for student groups they're assigned to
        if "Instructor" in user_roles:
            print(f"[get_trainer_pending_attendance] User has Instructor role - processing instructor path")
            frappe.log_error(
                message=f"User {user} has Instructor role - processing instructor path",
                title="Student Attendance - Instructor Path"
            )
            
            # Find Instructor records linked to this user
            # Check via custom_email field (direct link to User)
            print(f"[get_trainer_pending_attendance] Searching instructors via custom_email: {user}")
            instructors_via_email = frappe.get_all(
                "Instructor",
                filters={"custom_email": user},
                fields=["name"]
            )
            print(f"[get_trainer_pending_attendance] Found {len(instructors_via_email)} instructors via email: {[inst['name'] for inst in instructors_via_email]}")
            frappe.log_error(
                message=f"Instructors via email ({user}): {[inst['name'] for inst in instructors_via_email]}",
                title="Student Attendance - Instructors via Email"
            )
            
            # Check via employee.user_id (indirect link through Employee)
            print(f"[get_trainer_pending_attendance] Searching employee for user_id: {user}")
            employee = frappe.db.get_value("Employee", {"user_id": user}, "name")
            print(f"[get_trainer_pending_attendance] Found employee: {employee}")
            frappe.log_error(
                message=f"Employee found for user {user}: {employee}",
                title="Student Attendance - Employee Lookup"
            )
            
            instructors_via_employee = []
            if employee:
                print(f"[get_trainer_pending_attendance] Searching instructors via employee: {employee}")
                instructors_via_employee = frappe.get_all(
                    "Instructor",
                    filters={"employee": employee},
                    fields=["name"]
                )
                print(f"[get_trainer_pending_attendance] Found {len(instructors_via_employee)} instructors via employee: {[inst['name'] for inst in instructors_via_employee]}")
                frappe.log_error(
                    message=f"Instructors via employee ({employee}): {[inst['name'] for inst in instructors_via_employee]}",
                    title="Student Attendance - Instructors via Employee"
                )
            
            # Combine all instructor names
            all_instructor_names = [inst["name"] for inst in instructors_via_email]
            all_instructor_names.extend([inst["name"] for inst in instructors_via_employee])
            
            print(f"[get_trainer_pending_attendance] Combined instructor names: {all_instructor_names}")
            frappe.log_error(
                message=f"All instructor names for user {user}: {all_instructor_names}",
                title="Student Attendance - Combined Instructors"
            )
            
            if not all_instructor_names:
                # User is not linked to any instructor, return empty
                print(f"[get_trainer_pending_attendance] No instructors found for user {user} - returning empty list")
                frappe.log_error(
                    message=f"No instructors found for user {user} - returning empty list",
                    title="Student Attendance - No Instructors Found"
                )
                return []
            
            # Find all Student Groups where these instructors are assigned
            print(f"[get_trainer_pending_attendance] Searching Student Group Instructor links for instructors: {all_instructor_names}")
            student_group_links = frappe.db.get_all(
                "Student Group Instructor",
                filters={"instructor": ["in", all_instructor_names]},
                fields=["parent"],
                group_by="parent"
            )
            print(f"[get_trainer_pending_attendance] Found {len(student_group_links)} student group links")
            frappe.log_error(
                message=f"Student Group Instructor links found: {len(student_group_links)} links for instructors {all_instructor_names}",
                title="Student Attendance - Student Group Links"
            )
            
            if not student_group_links:
                print(f"[get_trainer_pending_attendance] No student group links found - returning empty list")
                frappe.log_error(
                    message=f"No student group links found for instructors {all_instructor_names}",
                    title="Student Attendance - No Student Group Links"
                )
                return []
            
            student_group_names = [link["parent"] for link in student_group_links]
            print(f"[get_trainer_pending_attendance] Student group names: {student_group_names}")
            frappe.log_error(
                message=f"Student group names: {student_group_names}",
                title="Student Attendance - Student Group Names"
            )
            
            # Get pending Student Attendance for those Student Groups
            # Check both student_group field and course_schedule -> student_group
            print(f"[get_trainer_pending_attendance] Querying Student Attendance for student groups: {student_group_names}")
            records = frappe.db.get_all(
                "Student Attendance",
                filters={
                    "docstatus": 0,
                    "student_group": ["in", student_group_names]
                },
                fields=["name", "student", "student_name", "date", "status", "custom_student_signature", "docstatus", "student_group", "course_schedule"]
            )
            print(f"[get_trainer_pending_attendance] Found {len(records)} attendance records via student_group")
            frappe.log_error(
                message=f"Found {len(records)} attendance records via student_group filter for groups {student_group_names}",
                title="Student Attendance - Records via Student Group"
            )
            
            # Also get attendance via Course Schedule if it exists
            print(f"[get_trainer_pending_attendance] Querying Course Schedule for student groups: {student_group_names}")
            course_schedules = frappe.db.get_all(
                "Course Schedule",
                filters={"student_group": ["in", student_group_names]},
                pluck="name"
            )
            print(f"[get_trainer_pending_attendance] Found {len(course_schedules)} course schedules: {course_schedules}")
            frappe.log_error(
                message=f"Found {len(course_schedules)} course schedules: {course_schedules}",
                title="Student Attendance - Course Schedules"
            )
            
            if course_schedules:
                print(f"[get_trainer_pending_attendance] Querying Student Attendance for course schedules: {course_schedules}")
                course_schedule_records = frappe.db.get_all(
                    "Student Attendance",
                    filters={
                        "docstatus": 0,
                        "course_schedule": ["in", course_schedules]
                    },
                    fields=["name", "student", "student_name", "date", "status", "custom_student_signature", "docstatus", "student_group", "course_schedule"]
                )
                print(f"[get_trainer_pending_attendance] Found {len(course_schedule_records)} attendance records via course_schedule")
                frappe.log_error(
                    message=f"Found {len(course_schedule_records)} attendance records via course_schedule filter",
                    title="Student Attendance - Records via Course Schedule"
                )
                
                # Combine and deduplicate by name
                existing_names = {r["name"] for r in records}
                initial_count = len(records)
                for r in course_schedule_records:
                    if r["name"] not in existing_names:
                        records.append(r)
                
                print(f"[get_trainer_pending_attendance] Combined records: {initial_count} initial + {len(course_schedule_records)} course_schedule = {len(records)} total (after deduplication)")
                frappe.log_error(
                    message=f"Combined records: {initial_count} initial + {len(course_schedule_records)} course_schedule = {len(records)} total",
                    title="Student Attendance - Combined Records"
                )
            
            print(f"[get_trainer_pending_attendance] Returning {len(records)} total records for Instructor path")
            frappe.log_error(
                message=f"Instructor path returning {len(records)} total records for user {user}",
                title="Student Attendance - Instructor Path Result"
            )
            
            return records

        # Fallback: Check Course Schedule custom_email (for backward compatibility)
        print(f"[get_trainer_pending_attendance] Processing fallback path - checking Course Schedule custom_email")
        frappe.log_error(
            message=f"Processing fallback path for user {user} - checking Course Schedule custom_email: {user_email}",
            title="Student Attendance - Fallback Path"
        )
        
        if not user_email:
            print(f"[get_trainer_pending_attendance] No user email found - returning empty list")
            frappe.log_error(
                message=f"No user email found for user {user} - returning empty list",
                title="Student Attendance - No User Email"
            )
            return []

        # Get all Course Schedule names where custom_email matches the user's email
        print(f"[get_trainer_pending_attendance] Querying Course Schedule for custom_email: {user_email}")
        course_schedule_names = frappe.db.get_all(
            "Course Schedule",
            filters={"custom_email": user_email},
            pluck="name"
        )
        print(f"[get_trainer_pending_attendance] Found {len(course_schedule_names)} course schedules: {course_schedule_names}")
        frappe.log_error(
            message=f"Found {len(course_schedule_names)} course schedules for email {user_email}: {course_schedule_names}",
            title="Student Attendance - Course Schedules via Email"
        )
        
        if not course_schedule_names:
            print(f"[get_trainer_pending_attendance] No course schedules found - returning empty list")
            frappe.log_error(
                message=f"No course schedules found for email {user_email}",
                title="Student Attendance - No Course Schedules"
            )
            return []

        # Get pending Student Attendance for those Course Schedules
        print(f"[get_trainer_pending_attendance] Querying Student Attendance for course schedules: {course_schedule_names}")
        records = frappe.db.get_all(
            "Student Attendance",
            filters={
                "docstatus": 0,
                "course_schedule": ["in", course_schedule_names]
            },
            fields=["name", "student", "student_name", "date", "status", "custom_student_signature", "docstatus", "student_group", "course_schedule"]
        )
        print(f"[get_trainer_pending_attendance] Fallback path returning {len(records)} records")
        frappe.log_error(
            message=f"Fallback path returning {len(records)} records for user {user}",
            title="Student Attendance - Fallback Path Result"
        )
        
        return records
    
    except Exception as e:
        error_message = f"Error in get_trainer_pending_attendance for user {frappe.session.user if frappe.session else 'Unknown'}: {str(e)}\nTraceback: {traceback.format_exc()}"
        print(f"[get_trainer_pending_attendance] ERROR: {error_message}")
        frappe.log_error(
            message=error_message,
            title="Student Attendance - Exception"
        )
        raise
