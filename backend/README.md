# API Documentation

This API handles **authentication, course management, grading, and user enrollment** for the eLearning platform.

---

## Authentication

All authenticated requests must include a **JWT Token** in the `Authorization` header.

* **Format**: `Authorization: Bearer <JWT_TOKEN>` 
* **Levels**:
    * **0**: Student 
    * **1**: Instructor 
    * **2**: Admin 

---

## Response Codes

| Code | Description | Notes |
| :--- | :--- | :--- |
| **200 OK** | Success. | Includes successful updates where no data changed ("No changes made..."). |
| **201 Created** | Resource successfully created. | |
| **400 Bad Request** | Missing fields or invalid data. | |
| **401 Unauthorized** | Missing or invalid token. | |
| **403 Forbidden** | Insufficient permissions (e.g., student trying to grade). | |
| **404 Not Found** | Resource does not exist. | |
| **409 Conflict** | Data conflict (e.g., email already exists). | |

---

## Endpoints

### 1. Authentication & Users

| Method | Endpoint | Description | Auth Required | Request Body Example | Response Example |
| :--- | :--- | :--- | :--- | :--- | :--- |
| POST | `/login` | Login with email and password. Returns Token. | No | `{"email": "user@example.com", "password": "securepassword"}` | `{"success": true, "token": "<JWT_TOKEN>", "user": {...}}` |
| POST | `/users` | Create a new user (register) and auto-login. | No | `{"first_name": "New", "last_name": "User", "email": "new.user@ex.com", "password": "pass"}` | `{"success": true, "token": "<JWT_TOKEN>", "user": {...}}` |
| GET | `/users/me` | Get the logged-in user's profile. | Student (0+) | N/A | `{"id": 1, "first_name": "John", "email": "..."}` |
| GET | `/users` | List all users. | Instructor (1+) | N/A | `[{"id": 1, "first_name": "..."}, {...}]` |
| GET | `/users/{id}` | Get specific user profile. | Student (0+) | N/A | `{"id": 1, "first_name": "John", "email": "..."}` |
| PUT | `/users/{id}` | Update user profile. | Owner/Admin | `{"first_name": "Jane", "bio": "Updated bio text."}` | `{"message": "User updated successfully."}` |
| DELETE | `/users/{id}` | Delete user account. | Owner/Admin | N/A | `{"message": "User deleted successfully."}` |
| GET | `/users/{id}/created-courses` | Get courses authored by a user. | Student (0+) | N/A | `[{"id": 101, "name": "..."}, {...}]` |
| GET | `/users/{id}/enrolled-courses` | Get courses a user is enrolled in. | Owner/Admin | N/A | `[{"id": 101, "name": "...", "started_at": "..."}]` |

---

### 2. Course Management

| Method | Endpoint | Description | Auth Required | Request Body Example | Response Example |
| :--- | :--- | :--- | :--- | :--- | :--- |
| GET | `/courses` | List all available courses. | No | N/A | `[{"id": 101, "name": "...", "instructor_first_name": "..."}]` |
| GET | `/courses?search=keyword` | Search for courses by keyword. | No | N/A | `[{"id": 101, "name": "...", "instructor_first_name": "..."}]` |
| POST | `/courses` | Create a new course. | Instructor (1+) | `{"name": "New Course", "description": "...", "category": "Tech"}` | `{"message": "Course POSTd successfully.", "id": 102}` |
| GET | `/courses/{id}` | Get detailed course content (lessons, quizzes, project). | Enrolled/Author/Admin | N/A | `{"id": 101, "name": "...", "lessons": [...], "quizzes": [...]}` |
| GET | `/courses/{id}/preview` | Get basic course info (public preview). | No | N/A | `{"id": 101, "name": "...", "lessons_count": 5}` |
| PUT | `/courses/{id}` | Update course details. | Author/Admin | `{"name": "Updated Title", "description": "Revised description."}` | `{"message": "Course PUTd successfully."}` |
| DELETE | `/courses/{id}` | Delete a course. | Author/Admin | N/A | `{"message": "Course DELETEd successfully."}` |
| GET | `/courses/{id}/students` | List enrolled students. | Author/Admin | N/A | `[{"student_id": 5, "first_name": "...", "progress": 50}, {...}]` |
| GET | `/courses/{id}/related` | Get other courses by same author. | No | N/A | `[{"id": 103, "name": "..."}, {...}]` |
| GET | `/courses/{id}/submissions` | Get all submissions for a course. | Author/Admin | N/A | `[{"id": 10, "project_name": "...", "grade": null}, {...}]` |

---

### 3. Course Components (Lessons, Quizzes, Projects)

| Method | Endpoint | Description | Auth Required | Request Body Example | Response Example |
| :--- | :--- | :--- | :--- | :--- | :--- |
| GET | `/courses/{id}/lessons` | List lessons for a course. | Enrolled/Author/Admin | N/A | `[{"id": 1, "title": "Lesson Title"}, {...}]` |
| GET | `/courses/{id}/quizzes` | List quizzes for a course. | Enrolled/Author/Admin | N/A | `[{"id": 2, "name": "Quiz Name"}, {...}]` |
| GET | `/courses/{id}/projects` | Get project for a course. | Enrolled/Author/Admin | N/A | `{"id": 3, "name": "Project Name", "description": "..."}` |
| POST | `/courses/{id}/lessons` | Add a new lesson to a course. | Author/Admin | `{"title": "Lesson Title", "content": "...", "lesson_order": 1}` | `{"message": "lessons POSTd successfully.", "id": 1}` |
| POST | `/courses/{id}/quizzes` | Add a new quiz to a course. | Author/Admin | `{"name": "Quiz Name"}` | `{"message": "quizzes POSTd successfully.", "id": 2}` |
| POST | `/courses/{id}/projects` | Add a new project to a course. | Author/Admin | `{"name": "Project Name", "description": "..."}` | `{"message": "projects POSTd successfully.", "id": 3}` |
| PUT | `/lessons/{id}` | Update lesson details. | Author/Admin | `{"content": "New content"}` | `{"message": "lessons PUTd successfully."}` |
| DELETE | `/lessons/{id}` | Delete a lesson. | Author/Admin | N/A | `{"message": "lessons DELETEd successfully."}` |
| PUT | `/quizzes/{id}` | Update quiz details. | Author/Admin | `{"name": "New Quiz Name"}` | `{"message": "quizzes PUTd successfully."}` |
| DELETE | `/quizzes/{id}` | Delete a quiz. | Author/Admin | N/A | `{"message": "quizzes DELETEd successfully."}` |
| PUT | `/projects/{id}` | Update project details. | Author/Admin | `{"description": "New description"}` | `{"message": "projects PUTd successfully."}` |
| DELETE | `/projects/{id}` | Delete a project. | Author/Admin | N/A | `{"message": "projects DELETEd successfully."}` |
| GET | `/quizzes/{id}/questions` | Get questions for a quiz (includes correct answers for Admin/Author). | Enrolled/Author/Admin | N/A | `[{"id": 1, "question_text": "...", "correct_answer": "A"}, {...}]` |

---

### 4. Questions

| Method | Endpoint | Description | Auth Required | Request Body Example | Response Example |
| :--- | :--- | :--- | :--- | :--- | :--- |
| POST | `/quizzes/{id}/questions` | Add a new question to a quiz. | Author/Admin | `{"question_text": "Q?", "type": "text", "correct_answer": "Answer"}` | `{"message": "Question POSTd successfully.", "id": 4}` |
| PUT | `/questions/{id}` | Update question text/options. | Author/Admin | `{"question_text": "Updated question?"}` | `{"message": "Question PUTd successfully."}` |
| DELETE | `/questions/{id}` | Delete a question. | Author/Admin | N/A | `{"message": "Question DELETEd successfully."}` |

---

### 5. Answers & Grading

| Method | Endpoint | Description | Auth Required | Request Body Example | Response Example |
| :--- | :--- | :--- | :--- | :--- | :--- |
| POST | `/questions/{id}/answer` | Student submits an answer. | Student (0+) | `{"answer": "My submitted answer text or ID"}` | `{"message": "Answer POSTd successfully.", "id": 10}` |
| PUT | `/questions/{id}/answer` | **Student**: Update own answer. **Instructor/Admin**: Grade answer. | Student/Author/Admin | **Student**: `{"answer": "new answer"}`. **Instr**: `{"student_id": 5, "grade": 100, "comment": "Good"}`. | `{"message": "Answer updated successfully."}` |
| DELETE | `/questions/{id}/answer` | Delete an answer. Admin can use `?student_id=5` to specify student. | Student/Admin | N/A | `{"message": "Answer DELETEd successfully."}` |

---

### 6. Subscriptions (Enrollment)

| Method | Endpoint | Description | Auth Required | Request Body Example | Response Example |
| :--- | :--- | :--- | :--- | :--- | :--- |
| POST | `/subscriptions` | Enroll in a course. | Student (0+) | `{"course": 101}` | `{"message": "Subscription created successfully.", "id": 20}` |
| DELETE | `/subscriptions/{courseId}` | Un-enroll self from a course. | Student (0+) | N/A | `{"message": "Subscription DELETEd successfully."}` |
| DELETE | `/subscriptions/{cid}/student/{sid}` | Instructor removes student from a course. | Author/Admin | N/A | `{"message": "Subscription DELETEd successfully."}` |

---

### 7. Submissions (Projects)

| Method | Endpoint | Description | Auth Required | Request Body Example | Response Example |
| :--- | :--- | :--- | :--- | :--- | :--- |
| GET | `/submissions/{projectId}` | Get own submission for a project. | Student (0+) | N/A | `{"id": 1, "project": 3, "url": "http://...", "grade": 90}` |
| POST | `/submissions/{projectId}` | Submit a project URL. | Student (0+) | `{"url": "http://link.to.my.project/submission"}` | `{"message": "Submission created successfully.", "id": 10}` |
| PUT | `/submissions/{projectId}` | **Student**: Resubmit project URL. **Instructor**: Grade submission. | Student/Author/Admin | **Student**: `{"url": "new-link.com"}`. **Instr**: `{"student_id": 5, "grade": 95, "comment": "Nice work."}` | `{"message": "Submission updated successfully."}` |
| DELETE | `/submissions/{projectId}` | Delete a submission. Admin can use `?student_id=5` to specify student. | Owner/Admin | N/A | `{"message": "Submission DELETEd successfully."}` |