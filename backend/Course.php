<?php
if(!class_exists('mySQL_ORM'))
require __DIR__ . '/mySQL_ORM.php';
require __DIR__ . '/config.php';

class Course extends mySQL_ORM{

    private $table = 'courses';

    /**
     * Constructor
     */
    public function __construct()
    {
        global $dbconfig;
        parent::__construct($dbconfig);
    }

    // CORE COURSE CRUD OPERATIONS

    /**
     * Get all courses' data with instructor names
     * @return array an array of all courses' data
     */
    public function getCourses(){
        $this->select(
            $this->table, 
            'courses.*',
            '', '', '', '', 
            'users', 
            'courses.author = users.id', 
            'users.first_name AS instructor_first_name, users.last_name AS instructor_last_name' 
        );
        return $this->fetchAll();
    }

    /**
     * Get the data of one course
     * @param int $courseId the ID of the desired course
     * @return array associative array of the course's data (single row)
     */
    public function getCourse($courseId){
        // 1. Get basic course info
        $this->select(
            $this->table,
            'courses.*',
            'courses.id = :id',
            '', '', '',
            'users',
            'courses.author = users.id',
            'users.first_name AS instructor_first_name, users.last_name AS instructor_last_name',
            ['id' => $courseId]
        );
        $course = $this->fetch();

        if ($course) {
            // 2. Aggregate related content
            $course['lessons'] = $this->getLessons($courseId);
            $course['quizzes'] = $this->getQuizzes($courseId);
            $course['projects'] = $this->getProject($courseId);
        }

        return $course;
    }

    /**
     * Add new course
     * @param array $courseData the data of the course (name, description, author, etc.)
     * @return int new row ID (course_id)
     */
    public function addCourse($courseData){
        return $this->insert($this->table, $courseData);
    }

    /**
     * Delete one course 
     * @param int $courseId the ID of the course to be deleted
     * @return int number of affected rows
     */
    public function deleteCourse($courseId){
        return $this->delete($this->table, 'id = :id', ['id' => $courseId]);
    }

    /**
     * Update course data
     * @param int $courseId the ID of the course to be updated
     * @param array $courseData the data of the course
     * @return int number of affected rows
     */
    public function updateCourse($courseId, $courseData) {
        return $this->update($this->table, $courseData, 'id = :id', ['id' => $courseId]);
    }

    /**
     * Search for courses by name or description
     * @param string @keyword the keyword to search for
     * @return array an array of all matched courses
     */
    public function searchCourses($keyword) {
        $this->select($this->table, 'courses.*', "courses.name LIKE :keyword OR courses.description LIKE :keyword", '', '', '', '', '', '', ['keyword' => "%$keyword%"]);
        return $this->fetchAll();
    }


    // CONTENT RETRIEVAL

    /**
     * Get the lessons of one course
     * @param int $courseId the ID of the desired course
     * @return array associative array of the lessons' data
     */
    public function getLessons($courseId){
        $this->select(
            'lessons',
            '*', 
            'course = :id', 
            '', '',
            'lesson_order ASC', 
            '', '', '', 
            ['id' => $courseId] 
        );
        return $this->fetchAll();
    }

    /**
     * Get the quizzes of one course 
     * @param int $courseId the ID of the desired course
     * @return array associative array of the quizzes' data
     */
    public function getQuizzes($courseId){
        $this->select(
            'quizzes', 
            '*',
            'course = :id',
            '', '',
            'quiz_order ASC', 
            '', '', '',
            ['id' => $courseId]
        );
        return $this->fetchAll();
    }

    /**
     * Get the project of one course 
     * @param int $courseId the ID of the desired course
     * @return array associative array of the project's data (single row)
     */
    public function getProject($courseId){
        $this->select('projects','*','course = :id', '', '', '', '', '', '', ['id' => $courseId]);
        return $this->fetch();
    }

    /**
     * Get questions for a specific quiz
     * @param int $quizId the ID of the desired quiz
     * @return array associative array of all questions
     */
    public function getQuizQuestions($quizId){
        $this->select(
            'questions', '*', 'quiz = :id', '', '', 'question_order ASC', '', '', '', ['id' => $quizId]
        );
        return $this->fetchAll();
    }

    /**
     * Fetch related students' names for a course
     * @param int $courseId The ID of the course
     * @return array Array of student user data
     */
    public function getStudentsEnrolled($courseId) {
        $main_cols = "subscriptions.started_at, subscriptions.completed_at";
        $join_cols = "users.id AS student_id, users.first_name, users.last_name";

        $this->select(
            'subscriptions', $main_cols,
            'subscriptions.course = :id', 
            '', '', '', 
            'users', 'subscriptions.student = users.id',
            $join_cols,
            ['id' => $courseId] 
        );
        return $this->fetchAll();
    }

    /**
     * Get a specific student's answers for a single question.
     * @param int $questionId The ID of the question
     * @param int $studentId The ID of the student
     * @return array Single row of answer data (grade, comment, answer text/ID)
     */
    public function getStudentAnswer($questionId, $studentId) {
        $main_cols = "answers.answer, answers.grade, answers.comment";
        $join_cols = "questions.type AS question_type";
        $where = 'answers.question = :qid AND answers.student = :sid';
        $params = ['qid' => $questionId, 'sid' => $studentId];

        $this->select(
            'answers', $main_cols, $where, // $table, $fields, $where
            '', '', '', // $limit, $offset, $order
            'questions', 'answers.question = questions.id', // $joinTable, $joinPoint
            $join_cols, // $extraFields
            $params // $params
        );
        return $this->fetch();
    }

    /**
     * Get all questions and a specific student's answers for a single quiz.
     * This is ideal for displaying a student's full quiz attempt.
     * @param int $quizId The ID of the quiz
     * @param int $studentId The ID of the student
     * @return array Array of question and corresponding answer data (if submitted)
     */
    public function getStudentQuizProgress($quizId, $studentId) {
        $fields = "
            questions.*,
            answers.answer AS student_answer,
            answers.grade AS student_grade,
            answers.comment AS instructor_comment
        ";

        $table = 'questions';
        $joinTable = 'answers';
        $joinPoint = 'questions.id = answers.question AND answers.student = :sid';
        $where = 'questions.quiz = :qid';

        $params = [
            'qid' => $quizId,
            'sid' => $studentId
        ];

        $this->select(
            $table, 
            $fields,
            $where, 
            '', '',
            '', 
            $joinTable, 
            $joinPoint, 
            '', 
            $params 
        );
        return $this->fetchAll();
    }


    // CRUD FOR COURSE COMPONENTS (Lessons, Quizzes, Projects)

    /**
     * Adds a lesson to a course.
     * @param array $lessonData Must include 'course', 'title', 'lesson_order', etc.
     * @return int New lesson ID
     */
    public function addLesson($lessonData) {
        return $this->insert('lessons', $lessonData);
    }

    /**
     * Updates a specific lesson.
     * @param int $lessonId ID of the lesson to update
     * @param array $lessonData Data to update
     * @return int Affected rows
     */
    public function updateLesson($lessonId, $lessonData) {
        return $this->update('lessons', $lessonData, 'id = :id', ['id' => $lessonId]);
    }

    /**
     * Deletes a lesson.
     * @param int $lessonId ID of the lesson to delete
     * @return int Affected rows
     */
    public function deleteLesson($lessonId) {
        return $this->delete('lessons', 'id = :id', ['id' => $lessonId]);
    }

    // --- Quiz CRUD ---

    /**
     * Adds a quiz to a course.
     * @param array $quizData Must include 'course', 'name', 'quiz_order', etc.
     * @return int New quiz ID
     */
    public function addQuiz($quizData) {
        return $this->insert('quizzes', $quizData);
    }

    /**
     * Updates a specific quiz.
     * @param int $quizId ID of the quiz to update
     * @param array $quizData Data to update
     * @return int Affected rows
     */
    public function updateQuiz($quizId, $quizData) {
        return $this->update('quizzes', $quizData, 'id = :id', ['id' => $quizId]);
    }

    /**
     * Deletes a quiz 
     * @param int $quizId ID of the quiz to delete
     * @return int Affected rows
     */
    public function deleteQuiz($quizId) {
        return $this->delete('quizzes', 'id = :id', ['id' => $quizId]);
    }

    // --- Project CRUD ---

    /**
     * Adds a project to a course.
     * @param array $projectData Must include 'course', 'name', 'description'.
     * @return int New project ID
     */
    public function addProject($projectData) {
        return $this->insert('projects', $projectData);
    }

    /**
     * Updates a specific project.
     * @param int $projectId ID of the project to update
     * @param array $projectData Data to update
     * @return int Affected rows
     */
    public function updateProject($projectId, $projectData) {
        return $this->update('projects', $projectData, 'id = :id', ['id' => $projectId]);
    }

    /**
     * Deletes a project.
     * @param int $projectId ID of the project to delete
     * @return int Affected rows
     */
    public function deleteProject($projectId) {
        return $this->delete('projects', 'id = :id', ['id' => $projectId]);
    }

    // Questions and Answers CRUD

    // --- Question CRUD ---

    /**
     * Get a single question by ID.
     * @param int $questionId The ID of the question.
     * @return array Single row of question data.
     */
    public function getQuestion($questionId){
        $this->select('questions', '*', 'id = :id', '', '', '', '', '', '', ['id' => $questionId]);
        return $this->fetch();
    }

    /**
     * Adds a question to a quiz.
     * @param array $questionData Must include 'quiz', 'type', 'head', 'answer', 'question_order'.
     * @return int New question ID.
     */
    public function addQuestion($questionData) {
        return $this->insert('questions', $questionData);
    }

    /**
     * Updates a specific question.
     * @param int $questionId ID of the question to update.
     * @param array $questionData Data to update.
     * @return int Affected rows.
     */
    public function updateQuestion($questionId, $questionData) {
        return $this->update('questions', $questionData, 'id = :id', ['id' => $questionId]);
    }

    /**
     * Deletes a question 
     * @param int $questionId ID of the question to delete.
     * @return int Affected rows.
     */
    public function deleteQuestion($questionId) {
        return $this->delete('questions', 'id = :id', ['id' => $questionId]);
    }

    // --- Answer CRUD ---

    /**
     * Get a single question answer by question and student ID
     * @param int $questionId The ID of the question
     * @param int $studentId The ID of the student
     * @return array Single row of answer data
     */
    public function getAnswer($questionId, $studentId){
        $this->select('answers', '*', 'question = :id AND student = :sid', '', '', '', '', '', '', ['qid' => $questionId, 'sid' => $studentId]);
        return $this->fetch();
    }

    /**
     * Saves a student's answer to a question.
     * @param array $answerData Must include 'question', 'student', and 'answer'.
     * @return int New answer ID (last insert ID).
     */
    public function addAnswer($answerData) {
        return $this->insert('answers', $answerData);
    }

    /**
     * Updates a student's answer (used for grading or correcting).
     * @param int $questionId ID of the question.
     * @param int $studentId ID of the student.
     * @param array $answerData Data to update (e.g., 'grade', 'comment', or new 'answer').
     * @return int Affected rows.
     */
    public function updateAnswer($questionId, $studentId, $answerData) {
        $where = 'question = :qid AND student = :sid';
        $whereParams = ['qid' => $questionId, 'sid' => $studentId];
        return $this->update('answers', $answerData, $where, $whereParams);
    }

    /**
     * Deletes a student's answer for a specific question.
     * @param int $questionId ID of the question.
     * @param int $studentId ID of the student.
     * @return int Affected rows.
     */
    public function deleteAnswer($questionId, $studentId) {
        $where = 'question = :qid AND student = :sid';
        $params = ['qid' => $questionId, 'sid' => $studentId];
        return $this->delete('answers', $where, $params);
    }

    public function getCourseIdByQuizId($quizId) {
        $this->select('quizzes', 'course', 'id = :qid', '', '', '', '', '', '', ['qid' => $quizId]);
        $result = $this->fetch();
        return $result ? $result['course'] : null;
    }

    public function getQuestionsForQuiz($quizId) {
        $this->select('questions', '*', 'quiz = :qid', '', '', 'question_order ASC', '', '', '', ['qid' => $quizId]);
        return $this->fetchAll();
    }
}

?>