<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require 'Course.php';
require 'Subscription.php';
require 'Submission.php';
require 'User.php'; 

$courseService = new Course();
$userService = new User(); 
$subscriptionService = new Subscription();
$submissionService = new Submission();

/**
 * Retrieves the authenticated user object from the database based on the Authorization header.
 * @param User $userService The User service instance.
 * @return array|null The user object or null if not authenticated.
 */
function getAuthUser($userService) {
    // Simulated authentication: User ID is passed in the Authorization: Bearer <ID> header
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';

    if (preg_match('/Bearer (\d+)/', $authHeader, $matches)) {
        $userId = $matches[1];
        $user = $userService->getUser($userId);
        return $user;
    }

    return null;
}

/**
 * Checks if the authenticated user has the required credential level.
 * @param int $requiredCredential The minimum required credential level (0=Student, 1=Instructor, 2=Admin).
 * @param array|null $authUser The authenticated user object.
 * @return bool True if authorized, terminates with 403 otherwise.
 */
function checkAuth($requiredCredential, $authUser) {
    if (!$authUser) {
        http_response_code(401); // Unauthorized
        echo json_encode(['error' => 'Authentication required.']);
        exit();
    }

    if ($authUser['credential'] < $requiredCredential) {
        http_response_code(403); // Forbidden
        echo json_encode(['error' => 'Insufficient privileges. Required credential level: ' . $requiredCredential]);
        exit();
    }

    return true;
}

/**
 * Checks if the authenticated user owns the parent course of a component.
 * Required for Instructor (1) operations. Admin (2) bypasses this check.
 * @param Course $courseService The Course service instance.
 * @param array $authUser The authenticated user object.
 * @param string $componentType 'lessons', 'quizzes', 'projects', or 'questions'.
 * @param int $componentId The ID of the component.
 * @return bool True if authorized (Admin or Owner), terminates with 403 otherwise.
 */
function checkOwnership($courseService, $authUser, $componentType, $componentId) {
    if ($authUser['credential'] == 2) {
        return true; // Admin bypass
    }

    // Determine the course ID that owns the component
    if ($componentType === 'questions') {
        $parent = $courseService->getQuestionParentCourse($componentId);
    } else {
        $parent = $courseService->getComponentParentCourse($componentType, $componentId);
    }

    if (!$parent) {
        http_response_code(404);
        echo json_encode(['error' => ucfirst($componentType) . ' not found.']);
        exit();
    }

    if ($authUser['id'] != $parent['author']) {
        http_response_code(403);
        echo json_encode(['error' => 'Access denied. You can only modify content from courses you authored.']);
        exit();
    }

    return true;
}


$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = explode( '/', $uri );

$parts = array_values(array_filter($uri));

$endpoint = $parts[1] ?? null;


// ============================================
// USER CRUD API
// ============================================

// --- GET Users ---
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($parts[2]) && $parts[2] === 'users') {
    $authUser = getAuthUser($userService);
    checkAuth(0, $authUser); // Must be authenticated

    if (isset($parts[3])) {
        // GET /users/{id} - Get specific user
        $userId = (int)$parts[3];
        $user = $userService->getUser($userId);

        if (!$user) {
            http_response_code(404);
            echo json_encode(['error' => 'User not found.']);
            exit();
        }

        // Authorization: User can see own profile, or Admin/Instructor can see any profile
        if ($authUser['id'] != $userId && $authUser['credential'] < 1) {
            http_response_code(403);
            echo json_encode(['error' => 'Access denied. You can only view your own profile.']);
            exit();
        }

        http_response_code(200);
        echo json_encode($user);
    } else {
        // GET /users - Get all users (Admin only or Instructor can see students in their courses)
        if ($authUser['credential'] < 1) {
            http_response_code(403);
            echo json_encode(['error' => 'Access denied. Only instructors and admins can view user lists.']);
            exit();
        }

        $users = $userService->getUsers();
        http_response_code(200);
        echo json_encode($users);
    }
    exit();
}

// --- POST User (Create New User) ---
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($parts[2]) && $parts[2] === 'users') {
    $data = json_decode(file_get_contents('php://input'), true);

    // Validate required fields
    if (!isset($data['first_name']) || !isset($data['last_name']) || !isset($data['email'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields: first_name, last_name, email.']);
        exit();
    }

    // Check if email already exists
    $existingUser = $userService->getUserByEmail($data['email']);
    if ($existingUser) {
        http_response_code(409);
        echo json_encode(['error' => 'Email already registered.']);
        exit();
    }

    // Validate name format
    if (!$userService->is_valid_name($data['first_name']) || !$userService->is_valid_name($data['last_name'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid name format. Names must contain only letters, numbers, spaces, dashes, and underscores.']);
        exit();
    }

    // Check if authenticated user is trying to set credential level
    $authUser = getAuthUser($userService);
    if (isset($data['credential'])) {
        // Only Admin (2) can assign credential levels
        if (!$authUser || $authUser['credential'] < 2) {
            http_response_code(403);
            echo json_encode(['error' => 'Access denied. Only admins can assign credential levels.']);
            exit();
        }
    } else {
        // Default to Student (0) if not specified
        $data['credential'] = 0;
    }

    // Create user
    $newId = $userService->addUser($data);

    if ($newId) {
        http_response_code(201);
        echo json_encode(['message' => 'User created successfully.', 'id' => $newId]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create user.']);
    }
    exit();
}

// --- PUT User (Update User) ---
if ($_SERVER['REQUEST_METHOD'] === 'PUT' && isset($parts[2]) && $parts[2] === 'users' && isset($parts[3])) {
    $authUser = getAuthUser($userService);
    checkAuth(0, $authUser); // Must be authenticated

    $userId = (int)$parts[3];
    $targetUser = $userService->getUser($userId);

    if (!$targetUser) {
        http_response_code(404);
        echo json_encode(['error' => 'User not found.']);
        exit();
    }

    // Authorization: User can only edit their own profile, or Admin can edit anyone
    if ($authUser['id'] != $userId && $authUser['credential'] < 2) {
        http_response_code(403);
        echo json_encode(['error' => 'Access denied. You can only edit your own profile.']);
        exit();
    }

    $data = json_decode(file_get_contents('php://input'), true);

    // Validate name fields if provided
    if (isset($data['first_name']) && !$userService->is_valid_name($data['first_name'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid first_name format.']);
        exit();
    }

    if (isset($data['last_name']) && !$userService->is_valid_name($data['last_name'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid last_name format.']);
        exit();
    }

    // Check if email is being changed and if it already exists
    if (isset($data['email']) && $data['email'] !== $targetUser['email']) {
        $existingUser = $userService->getUserByEmail($data['email']);
        if ($existingUser) {
            http_response_code(409);
            echo json_encode(['error' => 'Email already in use by another user.']);
            exit();
        }
    }

    // Prevent non-admin users from changing their credential level
    if (isset($data['credential']) && $authUser['credential'] < 2) {
        http_response_code(403);
        echo json_encode(['error' => 'Access denied. Only admins can change credential levels.']);
        exit();
    }

    $result = $userService->updateUser($userId, $data);

    if ($result > 0) {
        http_response_code(200);
        echo json_encode(['message' => 'User updated successfully.']);
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'No changes made or user not found.']);
    }
    exit();
}

// --- DELETE User ---
if ($_SERVER['REQUEST_METHOD'] === 'DELETE' && isset($parts[2]) && $parts[2] === 'users' && isset($parts[3])) {
    $authUser = getAuthUser($userService);
    checkAuth(2, $authUser); // Admin only (credential level 2)

    $userId = (int)$parts[3];
    $targetUser = $userService->getUser($userId);

    if (!$targetUser) {
        http_response_code(404);
        echo json_encode(['error' => 'User not found.']);
        exit();
    }

    // Prevent self-deletion
    if ($authUser['id'] === $userId) {
        http_response_code(400);
        echo json_encode(['error' => 'You cannot delete your own account.']);
        exit();
    }

    $result = $userService->deleteUser($userId);

    if ($result > 0) {
        http_response_code(200);
        echo json_encode(['message' => 'User deleted successfully.']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete user.']);
    }
    exit();
}

// ============================================
// COURSE API
// ============================================

// --- GET Courses ---
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($parts[2]) && $parts[2] === 'courses') {
    if (isset($parts[3])) {
        $courseId = (int)$parts[3];
        $course = $courseService->getCourse($courseId);

        if (!$course) {
            http_response_code(404);
            echo json_encode(['error' => 'Course not found.']);
            exit();
        }

        $authUser = getAuthUser($userService);
        $isAuthenticated = $authUser !== null;
        $isAuthor = $isAuthenticated && ($authUser['id'] == $course['author']);
        $isAdmin = $isAuthenticated && ($authUser['credential'] == 2);
        // Only check enrollment if authenticated
        $isEnrolled = $isAuthenticated ? $subscriptionService->getSubscription($authUser['id'], $courseId) : false;

        // Content retrieval: lessons, quizzes, projects, students
        if (isset($parts[4])) {
            // Rule: Must be Authenticated (0+), Admin (2), Author (1+), OR Enrolled Student (0+)
            if (!$isAuthenticated) {
                http_response_code(401);
                echo json_encode(['error' => 'Authentication required to view course components.']);
                exit();
            }

            if (!$isAdmin && !$isAuthor && !$isEnrolled) {
                http_response_code(403);
                echo json_encode(['error' => 'Access denied. Must be the course author or an enrolled student.']);
                exit();
            }

            switch ($parts[4]) {
                case 'lessons':
                    $data = $courseService->getLessons($courseId);
                    break;
                case 'quizzes':
                    $data = $courseService->getQuizzes($courseId);
                    break;
                case 'project':
                    $data = $courseService->getProject($courseId);
                    break;
                case 'students':
                    // Rule: Only Author (1+) or Admin (2) can see the list of enrolled students
                    if (!$isAdmin && !$isAuthor) {
                        http_response_code(403);
                        echo json_encode(['error' => 'Access denied. Only the course author or an admin can view the student list.']);
                        exit();
                    }
                    $data = $courseService->getStudentsEnrolled($courseId);
                    break;
                default:
                    http_response_code(404);
                    echo json_encode(['error' => 'Invalid course sub-resource.']);
                    exit();
            }
        } else {
            // GET /courses/{id}
            $data = $course;
        }

    } elseif (isset($_GET['search'])) {
        // GET /courses?search=keyword (Public)
        $data = $courseService->searchCourses($_GET['search']);
    } else {
        // GET /courses (Public)
        $data = $courseService->getCourses();
    }

    http_response_code(200);
    echo json_encode($data);
    exit();
}

// --- POST Course ---
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($parts[2]) && $parts[2] === 'courses') {
    $authUser = getAuthUser($userService);
    checkAuth(1, $authUser); // Rule: Instructor (1+) can create courses

    $data = json_decode(file_get_contents('php://input'), true);
    $data['author'] = $authUser['id']; // Set author from authenticated user

    $newId = $courseService->addCourse($data);

    http_response_code(201);
    echo json_encode(['message' => 'Course created successfully.', 'id' => $newId]);
    exit();
}

// --- PUT/DELETE Course and Components ---
if (in_array($_SERVER['REQUEST_METHOD'], ['PUT', 'DELETE']) && isset($parts[2]) && $parts[2] === 'courses' && isset($parts[3])) {
    $authUser = getAuthUser($userService);
    checkAuth(1, $authUser); // Rule: Instructor (1+) required for all course/component edits/deletes

    $courseId = (int)$parts[3];
    $course = $courseService->getCourse($courseId);

    if (!$course) { http_response_code(404); echo json_encode(['error' => 'Course not found.']); exit(); }

    // Ownership Check for Course (or Admin bypass)
    if ($authUser['credential'] < 2 && $authUser['id'] != $course['author']) {
        http_response_code(403);
        echo json_encode(['error' => 'Access denied. You can only manage courses you authored.']);
        exit();
    }

    // Determine if it's a course or a component operation
    if (isset($parts[4])) {
        // Component Operation (lessons, quizzes, projects)
        $componentType = $parts[4];
        $componentId = (int)($parts[5] ?? null);

        if (!$componentId) {
            http_response_code(400);
            echo json_encode(['error' => 'Component ID missing.']);
            exit();
        }

        // Ownership is implicitly checked by the course author check above.
        $data = $_SERVER['REQUEST_METHOD'] === 'PUT' ? json_decode(file_get_contents('php://input'), true) : [];

        switch ($componentType) {
            case 'lessons':
                $serviceMethod = $_SERVER['REQUEST_METHOD'] === 'PUT' ? 'updateLesson' : 'deleteLesson';
                $result = $courseService->$serviceMethod($componentId, $data);
                break;
            case 'quizzes':
                $serviceMethod = $_SERVER['REQUEST_METHOD'] === 'PUT' ? 'updateQuiz' : 'deleteQuiz';
                $result = $courseService->$serviceMethod($componentId, $data);
                break;
            case 'project':
                $serviceMethod = $_SERVER['REQUEST_METHOD'] === 'PUT' ? 'updateProject' : 'deleteProject';
                $result = $courseService->$serviceMethod($componentId, $data);
                break;
            default:
                http_response_code(404);
                echo json_encode(['error' => 'Invalid course component.']);
                exit();
        }

        if ($result > 0) {
            http_response_code(200);
            echo json_encode(['message' => ucfirst($componentType) . ' ' . $_SERVER['REQUEST_METHOD'] . 'd successfully.']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => ucfirst($componentType) . ' not found or no changes made.']);
        }

    } else {
        // Course PUT or DELETE
        $serviceMethod = $_SERVER['REQUEST_METHOD'] === 'PUT' ? 'updateCourse' : 'deleteCourse';
        $data = $_SERVER['REQUEST_METHOD'] === 'PUT' ? json_decode(file_get_contents('php://input'), true) : [];
        $result = $courseService->$serviceMethod($courseId, $data);

        if ($result > 0) {
            http_response_code(200);
            echo json_encode(['message' => 'Course ' . $_SERVER['REQUEST_METHOD'] . 'd successfully.']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Course not found or no changes made.']);
        }
    }
    exit();
}

// --- POST Component (Lessons, Quizzes, Projects) ---
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($parts[2]) && $parts[2] === 'courses' && isset($parts[3]) && isset($parts[4])) {
    $authUser = getAuthUser($userService);
    checkAuth(1, $authUser); // Rule: Instructor (1+) can add components

    $courseId = (int)$parts[3];
    $course = $courseService->getCourse($courseId);

    if (!$course) { http_response_code(404); echo json_encode(['error' => 'Course not found.']); exit(); }

    // Ownership Check
    if ($authUser['credential'] < 2 && $authUser['id'] != $course['author']) {
        http_response_code(403);
        echo json_encode(['error' => 'Access denied. You can only add components to courses you authored.']);
        exit();
    }

    $componentType = $parts[4];
    $data = json_decode(file_get_contents('php://input'), true);
    $data['course'] = $courseId;

    switch ($componentType) {
        case 'lessons':
            $newId = $courseService->addLesson($data);
            break;
        case 'quizzes':
            $newId = $courseService->addQuiz($data);
            break;
        case 'project':
            $newId = $courseService->addProject($data);
            break;
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Invalid course component for POST.']);
            exit();
    }

    http_response_code(201);
    echo json_encode(['message' => ucfirst($componentType) . ' created successfully.', 'id' => $newId]);
    exit();
}

// QUIZ/QUESTION/ANSWER API

// --- GET Quiz Questions and Student Progress ---
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($parts[2]) && $parts[2] === 'quizzes' && isset($parts[3]) && $parts[4] === 'questions') {
    $quizId = (int)$parts[3];

    $authUser = getAuthUser($userService);
    checkAuth(0, $authUser); // Rule: Must be authenticated (0+) to view content

    // Check enrollment/ownership for content viewing
    $parent = $courseService->getComponentParentCourse('quizzes', $quizId);
    if (!$parent) { http_response_code(404); echo json_encode(['error' => 'Quiz not found.']); exit(); }

    $isAuthor = ($authUser['id'] == $parent['author']);
    $isAdmin = ($authUser['credential'] == 2);
    $isEnrolled = $subscriptionService->getSubscription($authUser['id'], $parent['course']);

    if (!$isAdmin && !$isAuthor && !$isEnrolled) {
        http_response_code(403);
        echo json_encode(['error' => 'Access denied. Must be the course author or an enrolled student to view quiz content.']);
        exit();
    }

    if (isset($parts[5]) && $parts[5] === 'progress' && isset($parts[6])) {
        // GET /quizzes/{id}/questions/progress/{studentId} (Instructor/Admin only, or student checking self)
        $studentId = (int)$parts[6];

        if (!$isAdmin && !$isAuthor) {
            // Students can only check their own progress
            if ($authUser['id'] != $studentId) {
                http_response_code(403);
                echo json_encode(['error' => 'Access denied. You can only view your own quiz progress.']);
                exit();
            }
        }
        $data = $courseService->getStudentQuizProgress($quizId, $studentId);
    } else {
        // GET /quizzes/{id}/questions (Questions for the quiz)
        $data = $courseService->getQuizQuestions($quizId);
    }

    http_response_code(200);
    echo json_encode($data);
    exit();
}

// --- POST Question ---
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($parts[2]) && $parts[2] === 'quizzes' && isset($parts[3]) && $parts[4] === 'questions') {
    $authUser = getAuthUser($userService);
    checkAuth(1, $authUser); // Rule: Instructor (1+) can create questions

    $quizId = (int)$parts[3];

    // Ownership Check: Check the parent course of the quiz
    $parent = $courseService->getComponentParentCourse('quizzes', $quizId);
    if (!$parent) { http_response_code(404); echo json_encode(['error' => 'Quiz not found.']); exit(); }

    if ($authUser['credential'] < 2 && $authUser['id'] != $parent['author']) {
        http_response_code(403);
        echo json_encode(['error' => 'Access denied. You can only add questions to quizzes you authored.']);
        exit();
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $data['quiz'] = $quizId;

    $newId = $courseService->addQuestion($data);
    http_response_code(201);
    echo json_encode(['message' => 'Question created successfully.', 'id' => $newId]);
    exit();
}

// --- PUT/DELETE Question ---
if (in_array($_SERVER['REQUEST_METHOD'], ['PUT', 'DELETE']) && isset($parts[2]) && $parts[2] === 'questions' && isset($parts[3])) {
    $authUser = getAuthUser($userService);
    checkAuth(1, $authUser); // Rule: Instructor (1+) can edit/delete questions

    $questionId = (int)$parts[3];

    // Ownership Check: Check the parent course of the question
    checkOwnership($courseService, $authUser, 'questions', $questionId);

    $serviceMethod = $_SERVER['REQUEST_METHOD'] === 'PUT' ? 'updateQuestion' : 'deleteQuestion';
    $data = $_SERVER['REQUEST_METHOD'] === 'PUT' ? json_decode(file_get_contents('php://input'), true) : [];
    $result = $courseService->$serviceMethod($questionId, $data);

    if ($result > 0) {
        http_response_code(200);
        echo json_encode(['message' => 'Question ' . $_SERVER['REQUEST_METHOD'] . 'd successfully.']);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Question not found or no changes made.']);
    }
    exit();
}

// --- POST/PUT/DELETE Answer ---
if (in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PUT', 'DELETE']) && isset($parts[2]) && $parts[2] === 'questions' && isset($parts[3]) && $parts[4] === 'answer') {
    $authUser = getAuthUser($userService);
    checkAuth(0, $authUser); // Rule: Must be authenticated (0+)

    $questionId = (int)$parts[3];
    $studentId = $authUser['id'];

    // Find parent course for enrollment/ownership check
    $parent = $courseService->getQuestionParentCourse($questionId);
    if (!$parent) { http_response_code(404); echo json_encode(['error' => 'Question not found.']); exit(); }

    $isAuthor = ($authUser['id'] == $parent['author']);
    $isAdmin = ($authUser['credential'] == 2);
    $isEnrolled = $subscriptionService->getSubscription($authUser['id'], $parent['course']);

    // Check if the user is authorized to interact with this question
    if (!$isAdmin && !$isAuthor && !$isEnrolled) {
        http_response_code(403);
        echo json_encode(['error' => 'Access denied. You must be the course author or an enrolled student.']);
        exit();
    }

    $data = json_decode(file_get_contents('php://input'), true);

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // POST /questions/{id}/answer (Submit answer)
        $data['question'] = $questionId;
        $data['student'] = $studentId; // Student is the authenticated user

        $newId = $courseService->addAnswer($data);
        http_response_code(201);
        echo json_encode(['message' => 'Answer submitted successfully.', 'id' => $newId]);

    } elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        // PUT /questions/{id}/answer (Update answer or Grade answer)
        $isGrading = isset($data['grade']) || isset($data['comment']);

        if ($isGrading) {
            // Rule: Must be Instructor (1+) or Admin (2) AND Course Owner
            if ($authUser['credential'] < 1 || (!$isAdmin && !$isAuthor)) {
                http_response_code(403);
                echo json_encode(['error' => 'Access denied. Only the course author or an admin can grade answers.']);
                exit();
            }
            // Allow instructor to specify student ID to grade
            $targetStudentId = (int)($data['student_id'] ?? $studentId);
            unset($data['student_id']);
        } else {
            // Rule: Must be the Student Owner (0+) updating their own answer
            $targetStudentId = $studentId; // Always the authenticated user's ID
        }

        $result = $courseService->updateAnswer($questionId, $targetStudentId, $data);

        if ($result > 0) {
            http_response_code(200);
            echo json_encode(['message' => 'Answer updated successfully.']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Answer not found or no changes made.']);
        }

    } elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        // DELETE /questions/{id}/answer (Student deleting their own answer or Admin)
        $targetStudentId = $studentId;
        if (isset($data['student_id']) && $authUser['credential'] == 2) {
             // Admin can specify a student ID to delete
             $targetStudentId = (int)$data['student_id'];
        } elseif (isset($data['student_id']) && $authUser['id'] != $data['student_id']) {
            // Non-admin trying to delete someone else's answer
            http_response_code(403);
            echo json_encode(['error' => 'Access denied. You can only delete your own answer.']);
            exit();
        }

        $result = $courseService->deleteAnswer($questionId, $targetStudentId);

        if ($result > 0) {
            http_response_code(200);
            echo json_encode(['message' => 'Answer deleted successfully.']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Answer not found or no changes made.']);
        }
    }
    exit();
}

// SUBSCRIPTION API (/subscriptions)

// --- POST Subscription ---
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $endpoint === 'subscriptions') {
    $authUser = getAuthUser($userService);
    checkAuth(0, $authUser); // Rule: Registered users (0+) can subscribe

    $data = json_decode(file_get_contents('php://input'), true);
    $data['student'] = $authUser['id']; // Student ID is the authenticated user

    // Check if the course exists before subscribing
    if (!$courseService->getCourse($data['course'])) {
        http_response_code(404);
        echo json_encode(['error' => 'Course not found.']);
        exit();
    }

    $newId = $subscriptionService->addSubscription($data);
    http_response_code(201);
    echo json_encode(['message' => 'Subscription created successfully (enrolled).', 'id' => $newId]);
    exit();
}

// --- DELETE Subscription ---
if ($_SERVER['REQUEST_METHOD'] === 'DELETE' && $endpoint === 'subscriptions' && isset($parts[3])) {
    $authUser = getAuthUser($userService);
    checkAuth(0, $authUser); // Rule: Registered users (0+) can manage/delete subscriptions

    // URL format: /subscriptions/{courseId}
    $courseId = (int)$parts[3];
    $studentId = $authUser['id']; // Default to authenticated user

    // Additional checks for Instructor/Admin to delete *other* students' subscriptions
    if (isset($parts[4]) && $parts[4] === 'student' && isset($parts[5])) {
        // DELETE /subscriptions/{courseId}/student/{studentId}
        checkAuth(1, $authUser); // Rule: Instructor (1+) needed to delete others
        $studentId = (int)$parts[5];

        // Ownership Check: Instructor can only remove students from their own courses
        $course = $courseService->getCourse($courseId);
        if (!$course) { http_response_code(404); echo json_encode(['error' => 'Course not found.']); exit(); }

        if ($authUser['credential'] < 2 && $authUser['id'] != $course['author']) {
            http_response_code(403);
            echo json_encode(['error' => 'Access denied. You can only remove students from courses you authored.']);
            exit();
        }
    }
    // Final delete operation
    $result = $subscriptionService->deleteSubscription($studentId, $courseId);

    if ($result > 0) {
        http_response_code(200);
        echo json_encode(['message' => 'Subscription deleted successfully (un-enrolled).']);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Subscription not found or already deleted.']);
    }
    exit();
}

// SUBMISSION API (/submissions)


// --- POST Submission ---
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $endpoint === 'submissions') {
    $authUser = getAuthUser($userService);
    checkAuth(0, $authUser); // Rule: Registered users (0+) can submit

    $data = json_decode(file_get_contents('php://input'), true);
    $data['student'] = $authUser['id']; // Student ID is the authenticated user

    // Need to find parent course to check enrollment
    $projectId = $data['project'] ?? null;
    if (!$projectId) { http_response_code(400); echo json_encode(['error' => 'Project ID required.']); exit(); }

    $parent = $courseService->getComponentParentCourse('projects', $projectId);
    if (!$parent) { http_response_code(404); echo json_encode(['error' => 'Project not found.']); exit(); }

    // Rule: Must be an enrolled student to submit to a project
    if (!$subscriptionService->getSubscription($authUser['id'], $parent['course'])) {
        http_response_code(403);
        echo json_encode(['error' => 'Access denied. You must be enrolled in the course to submit this project.']);
        exit();
    }

    $newId = $submissionService->addSubmission($data);
    http_response_code(201);
    echo json_encode(['message' => 'Submission created successfully.', 'id' => $newId]);
    exit();
}

// --- PUT Submission (Update URL or Grade) ---
if ($_SERVER['REQUEST_METHOD'] === 'PUT' && $endpoint === 'submissions' && isset($parts[3])) {
    $authUser = getAuthUser($userService);
    checkAuth(0, $authUser); // Rule: Registered users (0+) can update/grade

    // URL format: /submissions/{projectId}
    $projectId = (int)$parts[3];
    $data = json_decode(file_get_contents('php://input'), true);

    // Identify if the update is a re-submission (student) or a grade/comment (instructor/admin)
    $isGrading = isset($data['grade']) || isset($data['comment']);

    if ($isGrading) {
        // Grading: Requires Instructor (1+) or Admin (2)
        checkAuth(1, $authUser);

        // Ownership Check: Instructor can only grade projects in their own courses
        $parent = $courseService->getComponentParentCourse('projects', $projectId);
        if (!$parent) { http_response_code(404); echo json_encode(['error' => 'Project not found.']); exit(); }
        if ($authUser['credential'] < 2 && $authUser['id'] != $parent['author']) {
            http_response_code(403);
            echo json_encode(['error' => 'Access denied. You can only grade submissions for your own courses.']);
            exit();
        }

        // Allow instructor to specify student ID to grade
        $studentId = (int)($data['student_id'] ?? null);
        if (!$studentId) { http_response_code(400); echo json_encode(['error' => 'Student ID must be provided when grading.']); exit(); }
        unset($data['student_id']);

    } else {
        // Re-submission (URL update): Requires Student Owner
        $studentId = $authUser['id']; // Student can only update their own submission
        // Ensure student isn't trying to tamper with grading fields
        if (isset($data['grade']) || isset($data['comment'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Students cannot modify grade or comment fields.']);
            exit();
        }
    }

    $result = $submissionService->updateSubmission($studentId, $projectId, $data);

    if ($result > 0) {
        http_response_code(200);
        echo json_encode(['message' => 'Submission updated successfully.']);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Submission not found or no changes made.']);
    }
    exit();
}

// --- DELETE Submission ---
if ($_SERVER['REQUEST_METHOD'] === 'DELETE' && $endpoint === 'submissions' && isset($parts[3])) {
    $authUser = getAuthUser($userService);
    checkAuth(0, $authUser); // Rule: Registered users (0+) can delete

    // URL format: /submissions/{projectId}
    $projectId = (int)$parts[3];
    $studentId = $authUser['id']; // Default to authenticated user

    // If an Admin (2) is logged in, they can potentially delete anyone's submission
    if ($authUser['credential'] == 2 && isset($_GET['student_id'])) {
        $studentId = (int)$_GET['student_id'];
    } elseif ($authUser['credential'] != 2 && isset($_GET['student_id']) && $authUser['id'] != $_GET['student_id']) {
        // Non-admin trying to delete someone else's submission
        http_response_code(403);
        echo json_encode(['error' => 'Access denied. You can only delete your own submission.']);
        exit();
    }


    $result = $submissionService->deleteSubmission($studentId, $projectId);

    if ($result > 0) {
        http_response_code(200);
        echo json_encode(['message' => 'Submission deleted successfully.']);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Submission not found or already deleted.']);
    }
    exit();
}


// If no endpoint matched
http_response_code(404);
echo json_encode(['error' => 'Not Found']);
exit();