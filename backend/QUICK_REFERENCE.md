# E-Learning API - Quick Reference Guide

## Authentication
```
Authorization: Bearer <USER_ID>
```

## User Roles
- **0** = Student
- **1** = Instructor  
- **2** = Admin

---

## User CRUD Endpoints

### Get User Profile
```
GET /api/users/{id}
Authorization: Bearer <token>
```
✅ Users see own; Instructors+ see all

### List All Users
```
GET /api/users
Authorization: Bearer <token>
```
✅ Instructors+ only

### Create User
```
POST /api/users
Content-Type: application/json
Authorization: Bearer <token> (optional)

{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "bio": "Optional bio",
  "avatar": "profile.jpg",
  "credential": 0
}
```
✅ Public registration; Admin for credentials

### Update User
```
PUT /api/users/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "bio": "Updated bio",
  "avatar": "new.jpg"
}
```
✅ Users edit own; Admins edit any

### Delete User
```
DELETE /api/users/{id}
Authorization: Bearer <token>
```
✅ Admins only (cannot delete self)

---

## Course Endpoints

### Get All Courses
```
GET /api/courses
GET /api/courses?search=keyword
```
✅ Public

### Get Course Details
```
GET /api/courses/{id}
```
✅ Public

### Get Course Lessons
```
GET /api/courses/{id}/lessons
Authorization: Bearer <token>
```
✅ Enrolled, author, or admin

### Get Course Quizzes
```
GET /api/courses/{id}/quizzes
Authorization: Bearer <token>
```
✅ Enrolled, author, or admin

### Get Course Project
```
GET /api/courses/{id}/project
Authorization: Bearer <token>
```
✅ Enrolled, author, or admin

### Get Enrolled Students
```
GET /api/courses/{id}/students
Authorization: Bearer <token>
```
✅ Author or admin only

### Create Course
```
POST /api/courses
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Course Title",
  "description": "Description"
}
```
✅ Instructors+ only

### Add Lesson
```
POST /api/courses/{id}/lessons
Authorization: Bearer <token>

{
  "title": "Lesson Title",
  "content": "Content here"
}
```
✅ Course author or admin

### Add Quiz
```
POST /api/courses/{id}/quizzes
Authorization: Bearer <token>

{
  "title": "Quiz Title",
  "description": "Description"
}
```
✅ Course author or admin

### Add Project
```
POST /api/courses/{id}/project
Authorization: Bearer <token>

{
  "title": "Project Title",
  "description": "Description",
  "due_date": "2024-05-01"
}
```
✅ Course author or admin

### Update Lesson/Quiz
```
PUT /lessons/{id}
PUT /quizzes/{id}
Authorization: Bearer <token>

{
  "title": "Updated Title",
  "content": "Updated content"
}
```
✅ Course author or admin

### Delete Lesson/Quiz
```
DELETE /lessons/{id}
DELETE /quizzes/{id}
Authorization: Bearer <token>
```
✅ Course author or admin

---

## Quiz Questions

### Get Questions
```
GET /api/quizzes/{id}/questions
Authorization: Bearer <token>
```
✅ Enrolled, author, or admin

### Get Student Progress
```
GET /api/quizzes/{id}/questions/progress/{studentId}
Authorization: Bearer <token>
```
✅ Student (self), author, or admin

### Create Question
```
POST /api/quizzes/{id}/questions
Authorization: Bearer <token>

{
  "text": "Question text?",
  "question_type": "multiple_choice",
  "options": ["A", "B", "C"],
  "correct_answer": 0
}
```
✅ Course author or admin

### Update Question
```
PUT /api/questions/{id}
Authorization: Bearer <token>

{
  "text": "Updated text?",
  "correct_answer": 1
}
```
✅ Course author or admin

### Delete Question
```
DELETE /api/questions/{id}
Authorization: Bearer <token>
```
✅ Course author or admin

### Submit Answer
```
POST /api/questions/{id}/answer
Authorization: Bearer <token>

{
  "answer_text": "My answer"
}
```
✅ Enrolled or author

### Update Answer / Grade
```
PUT /api/questions/{id}/answer
Authorization: Bearer <token>

{
  "answer_text": "Updated"
}
```
Or grade (instructor):
```
{
  "grade": 10,
  "comment": "Good job!",
  "student_id": 5
}
```
✅ Student (own) or instructor/admin (grading)

### Delete Answer
```
DELETE /api/questions/{id}/answer
Authorization: Bearer <token>

{
  "student_id": 5
}
```
✅ Student (own) or admin

---

## Project Submissions

### Get Submissions
```
GET /api/submissions/{projectId}
Authorization: Bearer <token>
```
✅ Student, instructor, or admin

### Submit Project
```
POST /api/submissions/{projectId}
Authorization: Bearer <token>

{
  "content": "Project code...",
  "file_url": "submissions/project.zip"
}
```
✅ Enrolled student or higher

### Update Submission / Grade
```
PUT /api/submissions/{projectId}
Authorization: Bearer <token>

{
  "content": "Updated submission"
}
```
Or grade (instructor):
```
{
  "grade": 90,
  "comment": "Great work!",
  "student_id": 5
}
```
✅ Student (own) or instructor/admin (grading)

### Delete Submission
```
DELETE /api/submissions/{projectId}
Authorization: Bearer <token>
```
✅ Student (own) or admin

---

## Subscriptions

### Get Subscriptions
```
GET /api/subscriptions
Authorization: Bearer <token>
```
✅ User (self) or admin

### Enroll in Course
```
POST /api/subscriptions
Authorization: Bearer <token>

{
  "course_id": 1
}
```
✅ All authenticated users

### Unenroll from Course
```
DELETE /api/subscriptions/{courseId}
Authorization: Bearer <token>
```
✅ Student (self) or admin

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Success (GET, PUT, DELETE) |
| 201 | Created - Resource created (POST) |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Duplicate entry |
| 500 | Server Error - Database error |

---

## Error Response Format

All errors follow this format:
```json
{
  "error": "Error message here"
}
```

---

## Quick Examples

### Register New Student
```bash
curl -X POST http://localhost/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Alice",
    "last_name": "Smith",
    "email": "alice@example.com"
  }'
```

### Create Course
```bash
curl -X POST http://localhost/api/courses \
  -H "Authorization: Bearer 2" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Web Dev 101",
    "description": "Learn web development"
  }'
```

### Enroll in Course
```bash
curl -X POST http://localhost/api/subscriptions \
  -H "Authorization: Bearer 5" \
  -H "Content-Type: application/json" \
  -d '{"course_id": 1}'
```

### Submit Quiz Answer
```bash
curl -X POST http://localhost/api/questions/1/answer \
  -H "Authorization: Bearer 5" \
  -H "Content-Type: application/json" \
  -d '{"answer_text": "My answer"}'
```

### Grade Answer (Instructor)
```bash
curl -X PUT http://localhost/api/questions/1/answer \
  -H "Authorization: Bearer 2" \
  -H "Content-Type: application/json" \
  -d '{
    "grade": 10,
    "comment": "Excellent!",
    "student_id": 5
  }'
```

### Submit Project
```bash
curl -X POST http://localhost/api/submissions/1 \
  -H "Authorization: Bearer 5" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "My project code...",
    "file_url": "submissions/project.zip"
  }'
```

### View All Users (Admin)
```bash
curl -H "Authorization: Bearer 2" http://localhost/api/users
```

---

## File Locations

- **API Router**: `/api.php`
- **User Model**: `/User.php`
- **Course Model**: `/Course.php`
- **Submission Model**: `/Submission.php`
- **Subscription Model**: `/Subscription.php`
- **Database Config**: `/config.php`

---

**Last Updated**: November 12, 2025
