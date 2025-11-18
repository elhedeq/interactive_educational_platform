# API README

This document explains authentication, available endpoints, expected request and response shapes, error codes, and curl examples for the PHP API implemented in api.txt.

---

### Summary of Authentication
- Authentication uses JWT tokens passed in the HTTP Authorization header as:
  Authorization: Bearer <JWT_TOKEN>
- The helper function getAuthUser extracts and verifies the JWT via User::verifyJWT and returns the user record (including fields **id** and **credential**).
- Credential levels:
  - **0** = Student (basic registered user)
  - **1** = Instructor
  - **2** = Admin
- Authorization checks are enforced by checkAuth(requiredLevel, authUser) and additional ownership checks where applicable.

---

## Common Response and Error Codes
- **200 OK** — Request succeeded, returns JSON payload.
- **201 Created** — Resource created, returns confirmation and new id.
- **400 Bad Request** — Missing or invalid request data.
- **401 Unauthorized** — Authentication required or token missing/invalid.
- **403 Forbidden** — Authenticated but insufficient privileges or not owner.
- **404 Not Found** — Resource not found.
- **409 Conflict** — Resource conflict (for example, email already registered).
- **500 Internal Server Error** — Server-side error or operation failed.

All responses are JSON objects. Error responses use the shape:
{ "error": "message" }
Success messages often use:
{ "message": "text" } or { "id": number } or combined.

---

## How to send requests
- Content-Type: application/json for request bodies.
- Include Authorization header for endpoints that require authentication.
- Use appropriate HTTP method: GET, POST, PUT, DELETE.
- For PUT/DELETE that receive a JSON body, the API uses php://input JSON.

---

# Endpoints

Note: Replace base URL with your API host, for example http://example.com/api.php or http://example.com/.

---

### Login
- Path: POST /login
- Purpose: Authenticate user and receive JWT and user details.
- Auth: None
- Request body JSON
  - required: **email**, **password**
- Success response 200:
  - JSON from User::login (typically includes success, token, user info)
- Errors: 400 missing fields, 401 invalid credentials
- Example
```bash
curl -X POST https://api.example.com/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secret"}'
```

---

### Current Authenticated User
- Path: GET /users/me
- Purpose: Retrieve authenticated user object
- Auth: JWT required (credential 0+)
- Success response 200: user object
- Errors: 401 unauthenticated
- Example
```bash
curl -X GET https://api.example.com/users/me \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

---

### Users CRUD
- POST /users
  - Create new user (registration)
  - Public, but if credential is provided only admin can set it
  - Required fields: first_name, last_name, email, password
  - Password minimum length 6
  - Responses: 201/200 with login result; 400 validation; 409 email exists
  - Example
```bash
curl -X POST https://api.example.com/users \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Ali","last_name":"Khan","email":"ali@example.com","password":"secret"}'
```

- GET /users
  - Get list of users
  - Auth: Instructor or Admin (credential >= 1)
  - Response: 200 users array; 403 if not permitted
  - Example
```bash
curl -X GET https://api.example.com/users \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

- GET /users/{id}
  - Get a specific user
  - Auth: Any authenticated user can fetch own profile; Instructor/Admin can fetch any
  - Errors: 403 if trying to access other profile without privileges
  - Example
```bash
curl -X GET https://api.example.com/users/5 \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

- PUT /users/{id}
  - Update user
  - Auth: Owner or Admin
  - Fields validated (name format, unique email)
  - 403 if non-admin attempts to change credential
  - Example
```bash
curl -X PUT https://api.example.com/users/5 \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Mohamed","email":"m@example.com"}'
```

- DELETE /users/{id}
  - Delete user
  - Auth: Owner or Admin
  - Response: 200 success or 404/403
  - Example
```bash
curl -X DELETE https://api.example.com/users/5 \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

---

### Courses
- GET /courses
  - Public listing of courses
  - Optional: GET /courses?search=keyword for search
  - Response 200 list
  - Example
```bash
curl -X GET "https://api.example.com/courses"
```

- GET /courses/{id}
  - Requires authentication and either: admin, course author, or enrolled student
  - Response 200 course details or 401/403/404
  - Example
```bash
curl -X GET https://api.example.com/courses/12 \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

- GET /courses/{id}/preview
  - Public preview endpoint returning only basic course info (safe for public use)
  - Response 200 preview object
  - Example
```bash
curl -X GET https://api.example.com/courses/12/preview
```

- POST /courses
  - Create new course
  - Auth: Instructor (credential >= 1)
  - Request body: course fields (courseService expects an array)
  - Sets author = authenticated user id
  - Response: 201 { message, id } or 403
  - Example
```bash
curl -X POST https://api.example.com/courses \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Intro to PHP","description":"...","price":0}'
```

- PUT /courses/{id}
  - Update course
  - Auth: Author or Admin
  - Response: 200 success or 403/404
  - Example
```bash
curl -X PUT https://api.example.com/courses/12 \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"description":"Updated description"}'
```

- DELETE /courses/{id}
  - Delete course
  - Auth: Author or Admin
  - Example
```bash
curl -X DELETE https://api.example.com/courses/12 \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

---

### Course Components
- POST /courses/{courseId}/lessons
- POST /courses/{courseId}/quizzes
- POST /courses/{courseId}/project
  - Create component for a course
  - Auth: Instructor and must be course author (Admin bypass)
  - Body: component fields plus course id is added automatically
  - Example
```bash
curl -X POST https://api.example.com/courses/12/lessons \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Lesson 1","content":"..."}'
```

- PUT or DELETE /courses/{courseId}/{componentType}/{componentId}
  - Update or remove component (lessons, quizzes, project)
  - Auth: Instructor and owner (or Admin)
  - Example update
```bash
curl -X PUT https://api.example.com/courses/12/lessons/34 \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated lesson"}'
```

- GET /courses/{id}/lessons or /quizzes or /project
  - Retrieve specific course components
  - Auth: enrolled student, author, or admin
  - Example
```bash
curl -X GET https://api.example.com/courses/12/lessons \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

- GET /courses/{id}/students
  - Returns enrolled students
  - Auth: Course author or Admin
  - Example
```bash
curl -X GET https://api.example.com/courses/12/students \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

- GET /courses/{id}/related
  - Returns other courses from the same instructor
  - Example
```bash
curl -X GET https://api.example.com/courses/12/related
```

---

### Quizzes and Questions
- GET /quizzes/{quizId}/questions
  - Auth: authenticated user who is enrolled, author, or admin
  - Returns questions for the quiz
  - Example
```bash
curl -X GET https://api.example.com/quizzes/8/questions \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

- GET /quizzes/{quizId}/questions/progress/{studentId}
  - Auth: Instructor/Admin or student checking their own progress
  - Example
```bash
curl -X GET https://api.example.com/quizzes/8/questions/progress/21 \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

- POST /quizzes/{quizId}/questions
  - Create a question under a quiz
  - Auth: Instructor who owns the quiz or Admin
  - Example
```bash
curl -X POST https://api.example.com/quizzes/8/questions \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"text":"What is PHP?","type":"mcq","options":["A","B"],"answer":0}'
```

- PUT /questions/{questionId}
- DELETE /questions/{questionId}
  - Update or delete question
  - Auth: Instructor and must be course owner or Admin
  - Example
```bash
curl -X PUT https://api.example.com/questions/45 \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"text":"Updated question text"}'
```

---

### Question Answers
- POST /questions/{questionId}/answer
  - Student submits an answer
  - Auth: enrolled student, author, or admin
  - Body: answer data; student id is taken from the token
  - Response 201 with new id
  - Example
```bash
curl -X POST https://api.example.com/questions/45/answer \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"response":"My answer text"}'
```

- PUT /questions/{questionId}/answer
  - Two modes: student updates their answer, or instructor/admin grades an answer (grade/comment)
  - Student mode: no grade/comment fields allowed
  - Instructor grading: include student_id and grading fields; auth must be course author or Admin
  - Example grading
```bash
curl -X PUT https://api.example.com/questions/45/answer \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"student_id":21,"grade":95,"comment":"Good work"}'
```

- DELETE /questions/{questionId}/answer
  - Student deletes own answer or Admin deletes any (Admin may specify student_id)
  - Example delete own
```bash
curl -X DELETE https://api.example.com/questions/45/answer \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

---

### Subscriptions
- POST /subscriptions
  - Enroll in a course
  - Auth: Registered user (credential 0+)
  - Body: must include **course** (course id). Student is set to authenticated user.
  - Example
```bash
curl -X POST https://api.example.com/subscriptions \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"course":12}'
```

- DELETE /subscriptions/{courseId}
  - Un-enroll self from course
  - Auth: Registered user
  - Example
```bash
curl -X DELETE https://api.example.com/subscriptions/12 \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

- DELETE /subscriptions/{courseId}/student/{studentId}
  - Instructor can remove another student from their course (or Admin)
  - Auth: Instructor and course owner or Admin
  - Example
```bash
curl -X DELETE https://api.example.com/subscriptions/12/student/21 \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

---

### Submissions
- POST /submissions
  - Create a project submission
  - Auth: Registered user and must be enrolled in the associated course
  - Body must include **project** (project id) and other submission fields (e.g., url)
  - Example
```bash
curl -X POST https://api.example.com/submissions \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"project":7,"url":"https://github.com/user/repo"}'
```

- PUT /submissions/{projectId}
  - Two modes:
    - Student re-submission: student updates their submission (cannot set grade/comment)
    - Instructor grading: include student_id and grade/comment; instructor must be course owner or Admin
  - Example student update
```bash
curl -X PUT https://api.example.com/submissions/7 \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://github.com/user/new-repo"}'
```
  - Example instructor grading
```bash
curl -X PUT https://api.example.com/submissions/7 \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"student_id":21,"grade":88,"comment":"Nice improvements"}'
```

- DELETE /submissions/{projectId}
  - Student deletes own submission; Admin can delete any via query param student_id
  - Example student delete
```bash
curl -X DELETE "https://api.example.com/submissions/7" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```
  - Example admin delete for a student
```bash
curl -X DELETE "https://api.example.com/submissions/7?student_id=21" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

---

## Additional Notes and Implementation Details
- The API attempts to support environments where the Authorization header may be available under different server variables (HTTP_AUTHORIZATION, REDIRECT_HTTP_AUTHORIZATION, or getallheaders fallback).
- Ownership checks use courseService methods:
  - getComponentParentCourse(componentType, componentId)
  - getQuestionParentCourse(questionId)
  - getCourseIdByQuizId and getQuestionsForQuiz are referenced and expected to be implemented on Course.php if used.
- When creating resources the server typically returns an id on success.
- For public course browsing, GET /courses and GET /courses?search=keyword are available; sensitive course content requires authentication and either enrollment, author, or admin.
- The code enforces strict separation between student actions and instructor/admin actions for grading and moderation.
- Input validation performed: name format, password length, unique email, required fields per endpoint.

---

## Troubleshooting Tips
- If you receive **401 Unauthorized**, verify that:
  - The JWT is present in Authorization header exactly as "Bearer <token>".
  - The token is not expired and verifyJWT returns decoded token with sub field.
- If you receive **403 Forbidden**, check whether:
  - Your credential level meets the required level.
  - You are the course owner for operations restricted to authors.
  - Students are trying to perform instructor-only actions (grading, removing others).
- If you receive **404 Not Found**, confirm resource ids exist and that you are using the correct route.
- For **409 Conflict** on registration, change the email or remove uniqueness constraint violation.

