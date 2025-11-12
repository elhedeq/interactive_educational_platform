# E-Learning Platform API

A comprehensive RESTful API for managing online courses, quizzes, submissions, and user accounts with role-based access control.

## Table of Contents
- [Overview](#overview)
- [Authentication](#authentication)
- [User Roles](#user-roles)
- [User CRUD Endpoints](#user-crud-endpoints)
- [Course Endpoints](#course-endpoints)
- [Quiz & Question Endpoints](#quiz--question-endpoints)
- [Submission Endpoints](#submission-endpoints)
- [Subscription Endpoints](#subscription-endpoints)
- [HTTP Status Codes](#http-status-codes)
- [API Testing](#api-testing)

---

## Overview

The E-Learning Platform API provides a complete solution for:
- **User Management**: Create, read, update, delete user accounts with role-based access
- **Course Management**: Create and manage online courses with lessons, quizzes, and projects
- **Quiz System**: Build quizzes with questions, track student progress and answers
- **Project Submissions**: Students submit projects, instructors grade and provide feedback
- **Enrollment**: Students subscribe to courses and track their progress

**Base URL**: `http://localhost/api/`

All responses are in JSON format with appropriate HTTP status codes.

---

## Authentication

### Authorization Header Format
All protected endpoints require the `Authorization` header:
```
Authorization: Bearer <USER_ID>
```

**Example**:
```bash
curl -H "Authorization: Bearer 5" http://localhost/api/users/5
```

### CORS Headers
The API includes CORS headers for cross-origin requests:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE`
- `Access-Control-Allow-Headers: Content-Type, Authorization`

---

## User Roles

The API uses a credential-based system with three roles:

| Role | Level | Permissions |
|------|-------|-------------|
| **Student** | 0 | View own profile, enroll in courses, submit answers/projects, view course content |
| **Instructor** | 1 | All student permissions + create courses, manage own course content, grade submissions |
| **Admin** | 2 | Full access to all resources, manage all users and content |

---

## User CRUD Endpoints

### 1. GET /users/{id}
**Get a specific user's profile**

**Authentication**: Required  
**Authorization**: 
- Users can view their own profile
- Instructors/Admins can view any profile

**Parameters**:
- `id` (integer, URL parameter): User ID

**Response** (200 OK):
```json
{
  "id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "bio": "Computer Science Student",
  "avatar": "profile.jpg",
  "credential": 0
}
```

**Error Responses**:
- `401` - Unauthorized: No authentication token
- `403` - Forbidden: Insufficient permissions
- `404` - Not Found: User doesn't exist

**cURL Example**:
```bash
curl -H "Authorization: Bearer 1" http://localhost/api/users/1
```

---

### 2. GET /users
**Get all users (Instructors/Admins only)**

**Authentication**: Required  
**Authorization**: Instructors (credential 1+) only

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "bio": "Computer Science Student",
    "avatar": "profile.jpg",
    "credential": 0
  },
  {
    "id": 2,
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane@example.com",
    "bio": "Math Instructor",
    "avatar": "jane.jpg",
    "credential": 1
  }
]
```

**Error Responses**:
- `401` - Unauthorized: No authentication token
- `403` - Forbidden: Only instructors/admins can view user lists

**cURL Example**:
```bash
curl -H "Authorization: Bearer 2" http://localhost/api/users
```

---

### 3. POST /users
**Create a new user**

**Authentication**: Optional
- Unauthenticated: Creates student account (credential 0)
- Authenticated: Admin required to set custom credential levels

**Request Body**:
```json
{
  "first_name": "Alice",
  "last_name": "Johnson",
  "email": "alice@example.com",
  "bio": "New Student",
  "avatar": "alice.jpg",
  "credential": 0
}
```

**Required Fields**:
- `first_name` - String: Letters, numbers, spaces, dashes, underscores only
- `last_name` - String: Letters, numbers, spaces, dashes, underscores only
- `email` - String: Valid email address

**Optional Fields**:
- `bio` - String: User biography
- `avatar` - String: Avatar filename/path
- `credential` - Integer: 0, 1, or 2 (Admin only; defaults to 0)

**Response** (201 Created):
```json
{
  "message": "User created successfully.",
  "id": 5
}
```

**Error Responses**:
- `400` - Bad Request: Missing required fields or invalid format
- `409` - Conflict: Email already registered
- `403` - Forbidden: Non-admin trying to set credential level
- `500` - Internal Server Error: Database error

**cURL Examples**:
```bash
# Public registration (student)
curl -X POST http://localhost/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Alice",
    "last_name": "Johnson",
    "email": "alice@example.com",
    "bio": "New Student"
  }'

# Admin creating instructor
curl -X POST http://localhost/api/users \
  -H "Authorization: Bearer 2" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Bob",
    "last_name": "Teacher",
    "email": "bob@example.com",
    "credential": 1
  }'
```

---

### 4. PUT /users/{id}
**Update a user's profile**

**Authentication**: Required  
**Authorization**:
- Users can edit their own profile
- Admins can edit any profile

**Parameters**:
- `id` (integer, URL parameter): User ID to update

**Request Body** (all fields optional):
```json
{
  "first_name": "Jonathan",
  "last_name": "Doe",
  "email": "jon@example.com",
  "bio": "Updated bio",
  "avatar": "newavatar.jpg"
}
```

**Field Validation**:
- `first_name` & `last_name`: Letters, numbers, spaces, dashes, underscores only
- `email`: Must be unique across system
- `credential`: Non-admins cannot change their own

**Response** (200 OK):
```json
{
  "message": "User updated successfully."
}
```

**Error Responses**:
- `400` - Bad Request: Invalid format or no changes
- `401` - Unauthorized: No authentication token
- `403` - Forbidden: Insufficient permissions or trying to change credential
- `404` - Not Found: User doesn't exist
- `409` - Conflict: Email already in use

**cURL Examples**:
```bash
# User updating own bio
curl -X PUT http://localhost/api/users/1 \
  -H "Authorization: Bearer 1" \
  -H "Content-Type: application/json" \
  -d '{"bio": "Updated bio"}'

# Admin promoting user to instructor
curl -X PUT http://localhost/api/users/3 \
  -H "Authorization: Bearer 2" \
  -H "Content-Type: application/json" \
  -d '{"credential": 1}'
```

---

### 5. DELETE /users/{id}
**Delete a user account**

**Authentication**: Required  
**Authorization**: Admin only (credential 2)

**Parameters**:
- `id` (integer, URL parameter): User ID to delete

**Response** (200 OK):
```json
{
  "message": "User deleted successfully."
}
```

**Error Responses**:
- `400` - Bad Request: Attempting to delete own account
- `401` - Unauthorized: No authentication token
- `403` - Forbidden: Only admins can delete users
- `404` - Not Found: User doesn't exist
- `500` - Internal Server Error: Database error

**cURL Example**:
```bash
curl -X DELETE http://localhost/api/users/5 \
  -H "Authorization: Bearer 2"
```

---

## Course Endpoints

### GET /courses
**Get all courses (Public)**

**Authentication**: Not required

**Query Parameters**:
- `search` (optional): Search keyword for course title/description

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "title": "Introduction to PHP",
    "description": "Learn PHP basics",
    "author": 2,
    "created_at": "2024-01-15"
  }
]
```

**cURL Example**:
```bash
curl http://localhost/api/courses
curl http://localhost/api/courses?search=PHP
```

---

### GET /courses/{id}
**Get course details**

**Authentication**: Not required

**Response** (200 OK):
```json
{
  "id": 1,
  "title": "Introduction to PHP",
  "description": "Learn PHP basics",
  "author": 2,
  "created_at": "2024-01-15"
}
```

**cURL Example**:
```bash
curl http://localhost/api/courses/1
```

---

### GET /courses/{id}/lessons
**Get all lessons in a course**

**Authentication**: Required  
**Authorization**: Must be enrolled, author, or admin

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "course": 1,
    "title": "PHP Basics",
    "content": "..."
  }
]
```

**cURL Example**:
```bash
curl -H "Authorization: Bearer 5" http://localhost/api/courses/1/lessons
```

---

### GET /courses/{id}/quizzes
**Get all quizzes in a course**

**Authentication**: Required  
**Authorization**: Must be enrolled, author, or admin

**cURL Example**:
```bash
curl -H "Authorization: Bearer 5" http://localhost/api/courses/1/quizzes
```

---

### GET /courses/{id}/project
**Get course project**

**Authentication**: Required  
**Authorization**: Must be enrolled, author, or admin

**cURL Example**:
```bash
curl -H "Authorization: Bearer 5" http://localhost/api/courses/1/project
```

---

### GET /courses/{id}/students
**Get enrolled students (Author/Admin only)**

**Authentication**: Required  
**Authorization**: Course author or admin only

**Response** (200 OK):
```json
[
  {
    "id": 3,
    "first_name": "Alice",
    "last_name": "Smith",
    "email": "alice@example.com",
    "enrolled_at": "2024-02-01"
  }
]
```

**cURL Example**:
```bash
curl -H "Authorization: Bearer 2" http://localhost/api/courses/1/students
```

---

### POST /courses
**Create a new course**

**Authentication**: Required  
**Authorization**: Instructor (credential 1+) only

**Request Body**:
```json
{
  "title": "Advanced JavaScript",
  "description": "Master modern JavaScript"
}
```

**Response** (201 Created):
```json
{
  "message": "Course created successfully.",
  "id": 5
}
```

**cURL Example**:
```bash
curl -X POST http://localhost/api/courses \
  -H "Authorization: Bearer 2" \
  -H "Content-Type: application/json" \
  -d '{"title": "Advanced JavaScript", "description": "Master JS"}'
```

---

### POST /courses/{id}/lessons
**Add lesson to course**

**Authentication**: Required  
**Authorization**: Course author or admin only

**Request Body**:
```json
{
  "title": "Lesson Title",
  "content": "Lesson content here"
}
```

**Response** (201 Created):
```json
{
  "message": "Lessons created successfully.",
  "id": 1
}
```

---

### POST /courses/{id}/quizzes
**Add quiz to course**

**Authentication**: Required  
**Authorization**: Course author or admin only

**Request Body**:
```json
{
  "title": "Quiz 1",
  "description": "Assessment quiz"
}
```

**Response** (201 Created):
```json
{
  "message": "Quizzes created successfully.",
  "id": 1
}
```

---

### POST /courses/{id}/project
**Add project to course**

**Authentication**: Required  
**Authorization**: Course author or admin only

**Request Body**:
```json
{
  "title": "Final Project",
  "description": "Build a web app",
  "due_date": "2024-05-01"
}
```

**Response** (201 Created):
```json
{
  "message": "Project created successfully.",
  "id": 1
}
```

---

### PUT /lessons/{id}
**Update lesson**

**Authentication**: Required  
**Authorization**: Course author or admin only

**Request Body**:
```json
{
  "title": "Updated Title",
  "content": "Updated content"
}
```

**Response** (200 OK):
```json
{
  "message": "Lessons updated successfully."
}
```

---

### DELETE /lessons/{id}
**Delete lesson**

**Authentication**: Required  
**Authorization**: Course author or admin only

**Response** (200 OK):
```json
{
  "message": "Lessons deleted successfully."
}
```

---

## Quiz & Question Endpoints

### GET /quizzes/{id}/questions
**Get all questions in a quiz**

**Authentication**: Required  
**Authorization**: Enrolled student, author, or admin

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "quiz": 1,
    "text": "What is PHP?",
    "question_type": "multiple_choice"
  }
]
```

**cURL Example**:
```bash
curl -H "Authorization: Bearer 5" http://localhost/api/quizzes/1/questions
```

---

### GET /quizzes/{id}/questions/progress/{studentId}
**Get student's quiz progress**

**Authentication**: Required  
**Authorization**: Student (self only), author, or admin

**Response** (200 OK):
```json
{
  "quiz_id": 1,
  "student_id": 5,
  "total_questions": 10,
  "answered": 8,
  "score": 75
}
```

**cURL Example**:
```bash
curl -H "Authorization: Bearer 5" http://localhost/api/quizzes/1/questions/progress/5
```

---

### POST /quizzes/{id}/questions
**Add question to quiz**

**Authentication**: Required  
**Authorization**: Course author or admin only

**Request Body**:
```json
{
  "text": "What is PHP?",
  "question_type": "multiple_choice",
  "options": ["Server-side language", "CSS framework", "Database"],
  "correct_answer": 0
}
```

**Response** (201 Created):
```json
{
  "message": "Question created successfully.",
  "id": 1
}
```

---

### PUT /questions/{id}
**Update question**

**Authentication**: Required  
**Authorization**: Course author or admin only

**Request Body**:
```json
{
  "text": "Updated question text",
  "correct_answer": 1
}
```

**Response** (200 OK):
```json
{
  "message": "Question updated successfully."
}
```

---

### DELETE /questions/{id}
**Delete question**

**Authentication**: Required  
**Authorization**: Course author or admin only

**Response** (200 OK):
```json
{
  "message": "Question deleted successfully."
}
```

---

### POST /questions/{id}/answer
**Submit answer to question**

**Authentication**: Required  
**Authorization**: Enrolled student or higher

**Request Body**:
```json
{
  "answer_text": "Server-side language"
}
```

**Response** (201 Created):
```json
{
  "message": "Answer submitted successfully.",
  "id": 1
}
```

**cURL Example**:
```bash
curl -X POST http://localhost/api/questions/1/answer \
  -H "Authorization: Bearer 5" \
  -H "Content-Type: application/json" \
  -d '{"answer_text": "Server-side language"}'
```

---

### PUT /questions/{id}/answer
**Update answer or grade (instructor)**

**Authentication**: Required  
**Authorization**: Student (own answer) or instructor/admin (grading)

**Request Body** (Student):
```json
{
  "answer_text": "Updated answer"
}
```

**Request Body** (Instructor Grading):
```json
{
  "grade": 10,
  "comment": "Excellent answer!",
  "student_id": 5
}
```

**Response** (200 OK):
```json
{
  "message": "Answer updated successfully."
}
```

---

### DELETE /questions/{id}/answer
**Delete answer**

**Authentication**: Required  
**Authorization**: Student (own), or admin

**Request Body** (Optional - Admin deleting other's answer):
```json
{
  "student_id": 5
}
```

**Response** (200 OK):
```json
{
  "message": "Answer deleted successfully."
}
```

---

## Submission Endpoints

### GET /submissions/{projectId}
**Get submissions for a project**

**Authentication**: Required  
**Authorization**: Student, instructor, or admin

**Response** (200 OK):
```json
[
  {
    "student_id": 5,
    "project_id": 1,
    "content": "Project code...",
    "submitted_at": "2024-04-15",
    "grade": null,
    "comment": null
  }
]
```

**cURL Example**:
```bash
curl -H "Authorization: Bearer 5" http://localhost/api/submissions/1
```

---

### POST /submissions/{projectId}
**Submit project**

**Authentication**: Required  
**Authorization**: Enrolled student or higher

**Request Body**:
```json
{
  "content": "Project submission content here",
  "file_url": "submissions/project_123.zip"
}
```

**Response** (201 Created):
```json
{
  "message": "Submission created successfully.",
  "id": 1
}
```

**cURL Example**:
```bash
curl -X POST http://localhost/api/submissions/1 \
  -H "Authorization: Bearer 5" \
  -H "Content-Type: application/json" \
  -d '{"content": "My project submission"}'
```

---

### PUT /submissions/{projectId}
**Update submission or grade it**

**Authentication**: Required  
**Authorization**: Student (self) or instructor/admin (grading)

**Request Body** (Student Resubmission):
```json
{
  "content": "Updated submission"
}
```

**Request Body** (Instructor Grading):
```json
{
  "grade": 90,
  "comment": "Great work!",
  "student_id": 5
}
```

**Response** (200 OK):
```json
{
  "message": "Submission updated successfully."
}
```

**cURL Example**:
```bash
# Student resubmitting
curl -X PUT http://localhost/api/submissions/1 \
  -H "Authorization: Bearer 5" \
  -H "Content-Type: application/json" \
  -d '{"content": "Updated submission"}'

# Instructor grading
curl -X PUT http://localhost/api/submissions/1 \
  -H "Authorization: Bearer 2" \
  -H "Content-Type: application/json" \
  -d '{"grade": 90, "comment": "Great!", "student_id": 5}'
```

---

### DELETE /submissions/{projectId}
**Delete submission**

**Authentication**: Required  
**Authorization**: Student (self), admin

**Response** (200 OK):
```json
{
  "message": "Submission deleted successfully."
}
```

**cURL Example**:
```bash
curl -X DELETE http://localhost/api/submissions/1 \
  -H "Authorization: Bearer 5"
```

---

## Subscription Endpoints

### GET /subscriptions
**Get user's course subscriptions**

**Authentication**: Required  
**Authorization**: User (self) or admin

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "user_id": 5,
    "course_id": 1,
    "enrolled_at": "2024-02-01"
  }
]
```

---

### POST /subscriptions
**Enroll in a course**

**Authentication**: Required

**Request Body**:
```json
{
  "course_id": 1
}
```

**Response** (201 Created):
```json
{
  "message": "Subscription created successfully.",
  "id": 1
}
```

---

### DELETE /subscriptions/{courseId}
**Unenroll from course**

**Authentication**: Required  
**Authorization**: Student (self) or admin

**Response** (200 OK):
```json
{
  "message": "Subscription deleted successfully."
}
```

---

## HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| **200** | OK | Successful GET, PUT, DELETE |
| **201** | Created | Successful POST (resource created) |
| **400** | Bad Request | Missing/invalid required fields |
| **401** | Unauthorized | Missing authentication token |
| **403** | Forbidden | Insufficient permissions for action |
| **404** | Not Found | Resource doesn't exist |
| **409** | Conflict | Email already exists, duplicate entry |
| **500** | Server Error | Database or internal server error |

---

## API Testing

### Complete User Workflow Example

```bash
# 1. Create student account
curl -X POST http://localhost/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Bob",
    "last_name": "Student",
    "email": "bob@example.com",
    "bio": "New Student"
  }'
# Response: {"message": "User created successfully.", "id": 5}

# 2. Get user profile
curl -H "Authorization: Bearer 5" http://localhost/api/users/5

# 3. Update profile
curl -X PUT http://localhost/api/users/5 \
  -H "Authorization: Bearer 5" \
  -H "Content-Type: application/json" \
  -d '{"bio": "Learning JavaScript"}'

# 4. View available courses
curl http://localhost/api/courses

# 5. Enroll in course
curl -X POST http://localhost/api/subscriptions \
  -H "Authorization: Bearer 5" \
  -H "Content-Type: application/json" \
  -d '{"course_id": 1}'

# 6. View course lessons
curl -H "Authorization: Bearer 5" http://localhost/api/courses/1/lessons

# 7. Submit quiz answer
curl -X POST http://localhost/api/questions/1/answer \
  -H "Authorization: Bearer 5" \
  -H "Content-Type: application/json" \
  -d '{"answer_text": "My answer"}'

# 8. Submit project
curl -X POST http://localhost/api/submissions/1 \
  -H "Authorization: Bearer 5" \
  -H "Content-Type: application/json" \
  -d '{"content": "My project submission"}'
```

### Complete Instructor Workflow Example

```bash
# 1. Create course
curl -X POST http://localhost/api/courses \
  -H "Authorization: Bearer 2" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Web Development 101",
    "description": "Learn web dev"
  }'
# Response: {"message": "Course created successfully.", "id": 1}

# 2. Add lessons
curl -X POST http://localhost/api/courses/1/lessons \
  -H "Authorization: Bearer 2" \
  -H "Content-Type: application/json" \
  -d '{"title": "HTML Basics", "content": "..."}'

# 3. Add quiz
curl -X POST http://localhost/api/courses/1/quizzes \
  -H "Authorization: Bearer 2" \
  -H "Content-Type: application/json" \
  -d '{"title": "HTML Quiz", "description": "Test your knowledge"}'

# 4. Add quiz question
curl -X POST http://localhost/api/quizzes/1/questions \
  -H "Authorization: Bearer 2" \
  -H "Content-Type: application/json" \
  -d '{"text": "What is HTML?", "options": ["Markup language", "Framework"], "correct_answer": 0}'

# 5. View enrolled students
curl -H "Authorization: Bearer 2" http://localhost/api/courses/1/students

# 6. Grade student answer
curl -X PUT http://localhost/api/questions/1/answer \
  -H "Authorization: Bearer 2" \
  -H "Content-Type: application/json" \
  -d '{"grade": 10, "comment": "Excellent!", "student_id": 5}'

# 7. Grade project submission
curl -X PUT http://localhost/api/submissions/1 \
  -H "Authorization: Bearer 2" \
  -H "Content-Type: application/json" \
  -d '{"grade": 90, "comment": "Great work!", "student_id": 5}'
```

### Admin User Management Example

```bash
# 1. Create instructor account
curl -X POST http://localhost/api/users \
  -H "Authorization: Bearer 1" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Jane",
    "last_name": "Teacher",
    "email": "jane@example.com",
    "credential": 1
  }'

# 2. Get all users
curl -H "Authorization: Bearer 1" http://localhost/api/users

# 3. Update user
curl -X PUT http://localhost/api/users/3 \
  -H "Authorization: Bearer 1" \
  -H "Content-Type: application/json" \
  -d '{"credential": 1}'

# 4. Promote student to instructor
curl -X PUT http://localhost/api/users/5 \
  -H "Authorization: Bearer 1" \
  -H "Content-Type: application/json" \
  -d '{"credential": 1}'

# 5. Delete user
curl -X DELETE http://localhost/api/users/5 \
  -H "Authorization: Bearer 1"
```

---

## Error Response Examples

### Missing Required Fields (400)
```json
{
  "error": "Missing required fields: first_name, last_name, email."
}
```

### Email Already Exists (409)
```json
{
  "error": "Email already registered."
}
```

### Unauthorized (401)
```json
{
  "error": "Authentication required."
}
```

### Forbidden (403)
```json
{
  "error": "Insufficient privileges. Required credential level: 1"
}
```

### Not Found (404)
```json
{
  "error": "User not found."
}
```

---

## Database Tables

### users
- `id` (INT, PK)
- `first_name` (VARCHAR)
- `last_name` (VARCHAR)
- `email` (VARCHAR, UNIQUE)
- `bio` (TEXT)
- `avatar` (VARCHAR)
- `credential` (INT) - 0: Student, 1: Instructor, 2: Admin

### courses
- `id` (INT, PK)
- `title` (VARCHAR)
- `description` (TEXT)
- `author` (INT, FK users.id)
- `created_at` (TIMESTAMP)

### lessons
- `id` (INT, PK)
- `course` (INT, FK courses.id)
- `title` (VARCHAR)
- `content` (TEXT)

### quizzes
- `id` (INT, PK)
- `course` (INT, FK courses.id)
- `title` (VARCHAR)
- `description` (TEXT)

### questions
- `id` (INT, PK)
- `quiz` (INT, FK quizzes.id)
- `text` (TEXT)
- `question_type` (VARCHAR)

### answers
- `id` (INT, PK)
- `question` (INT, FK questions.id)
- `student` (INT, FK users.id)
- `answer_text` (TEXT)
- `grade` (INT)
- `comment` (TEXT)

### subscriptions
- `id` (INT, PK)
- `user_id` (INT, FK users.id)
- `course_id` (INT, FK courses.id)
- `enrolled_at` (TIMESTAMP)

### submissions
- `student_id` (INT, FK users.id)
- `project_id` (INT, FK projects.id)
- `content` (TEXT)
- `submitted_at` (TIMESTAMP)
- `grade` (INT)
- `comment` (TEXT)

---

## Installation & Setup

1. **Database Setup**:
   ```sql
   CREATE DATABASE elearning;
   ```

2. **Configuration**:
   - Edit `config.php` with your database credentials
   - Default: localhost, user: root, password: empty, database: elearning

3. **Access API**:
   - Base URL: `http://localhost/api/`
   - Files: All in `/api/` directory

---

## File Structure

```
elearning/
├── api.php                 # Main API router
├── config.php             # Database configuration
├── User.php              # User model class
├── Course.php            # Course model class
├── Quiz.php              # Quiz model class (if exists)
├── Submission.php        # Submission model class
├── Subscription.php      # Subscription model class
├── mySQL_ORM.php        # Database ORM base class
└── README.md            # This file
```

---

## Support

For API issues or questions, refer to the endpoint documentation above or check the error response messages for specific error details.

**Last Updated**: November 12, 2025  
**API Version**: 1.0.0
