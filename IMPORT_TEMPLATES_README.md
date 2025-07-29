# Import Templates Guide

This folder contains Excel template files that you can use to import student and teacher data into the e-Vriddhi system.

## Template Files

### 1. Student Import Templates

#### **student_import_template.xlsx** (Recommended - New Format)
Use this template for new imports. It uses separated Standard and Division columns.

**Columns:**
- **Name** (Required): Full name of the student (e.g., "John Doe")
- **RollNumber** (Required): Unique roll number (e.g., "R001")
- **StudentId** (Required): Unique student ID (e.g., "STU001")
- **DateOfBirth** (Required): Date in YYYY-MM-DD format (e.g., "2018-03-15")
- **Standard** (Required): Grade level (e.g., "1", "2", "3", etc.)
- **Division** (Required): Class division (e.g., "A", "B", "C", etc.)

#### **student_import_template_legacy.xlsx** (Legacy Format)
Use this template if you have existing data in the old format.

**Columns:**
- **Name** (Required): Full name of the student
- **RollNumber** (Required): Unique roll number
- **StudentId** (Required): Unique student ID
- **DateOfBirth** (Required): Date in YYYY-MM-DD format
- **Class** (Required): Combined class name (e.g., "Grade 1A", "Grade 2B")

### 2. Teacher Import Template

#### **teacher_import_template.xlsx**
Use this template to import teacher data.

**Columns:**
- **Name** (Required): Full name of the teacher (e.g., "Dr. Sarah Johnson")
- **Email** (Required): Teacher's email address (e.g., "sarah.johnson@school.edu")
- **Phone** (Required): Phone number with country code (e.g., "+1234567890")
- **Subjects** (Required): Comma-separated list of subjects (e.g., "Math,Science,English")
  - Available subjects: Math, English, Hindi, Science, Geography
- **Classes** (Optional): Comma-separated list of classes taught (e.g., "Grade 1A,Grade 1B")
- **IsClassTeacher** (Required): "true" or "false" - whether this teacher is a class teacher
- **ClassTeacherFor** (Optional): If IsClassTeacher is true, specify which class (e.g., "Grade 1A")

## How to Use

### For Students:
1. Download either `student_import_template.xlsx` (new format) or `student_import_template_legacy.xlsx` (legacy format)
2. Replace the sample data with your actual student information
3. Ensure all required fields are filled
4. Save the file
5. In the e-Vriddhi system, go to Admin Dashboard → Student Management → Import Students
6. Upload your filled Excel file

### For Teachers:
1. Download `teacher_import_template.xlsx`
2. Replace the sample data with your actual teacher information
3. Ensure all required fields are filled
4. For subjects, use only the available options: Math, English, Hindi, Science, Geography
5. Use comma separation for multiple subjects or classes (no spaces after commas)
6. Save the file
7. In the e-Vriddhi system, go to Admin Dashboard → Teacher Management → Import Teachers
8. Upload your filled Excel file

## Important Notes

### Data Validation:
- **Roll Numbers and Student IDs must be unique** - duplicates will be rejected
- **Date format must be YYYY-MM-DD** (e.g., 2018-03-15)
- **Email addresses must be valid and unique for teachers**
- **Phone numbers should include country code**

### Subject Guidelines:
- Only use these exact subject names: Math, English, Hindi, Science, Geography
- Use comma separation for multiple subjects: "Math,Science" (no spaces)

### Class Format:
- For new student format: Use separate Standard ("1", "2", etc.) and Division ("A", "B", etc.) columns
- For legacy format: Use combined class names like "Grade 1A", "Grade 2B"
- For teachers: List classes they teach like "Grade 1A,Grade 2B"

### Error Handling:
- The system will provide detailed error messages if there are issues with your data
- Common errors include missing required fields, duplicate IDs, and invalid date formats
- Fix any errors and re-upload the file

### File Size:
- Keep Excel files under 10MB for best performance
- For large datasets, consider splitting into multiple files

## Sample Data

Each template includes 3 sample rows to show the correct format. Delete these sample rows and add your real data before importing.

## Support

If you encounter issues with the import process:
1. Check that all required fields are filled
2. Verify data formats match the specifications above
3. Ensure there are no duplicate Roll Numbers, Student IDs, or Email addresses
4. Contact your system administrator for assistance