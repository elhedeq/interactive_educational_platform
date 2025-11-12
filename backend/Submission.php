<?php
if(!class_exists('mySQL_ORM'))
require __DIR__ . '/mySQL_ORM.php';
require __DIR__ . '/config.php';
class Submission extends mySQL_ORM{

    private $table = 'submissions';

    /**
     * Constructor
     */

    public function __construct()
    {
        global $dbconfig;
        parent::__construct($dbconfig);
    }

    /**
     * get all submissions' data
     * @return array an array of all submissions' data
     */

    public function getSubmissions(){
        $this->select($this->table, '*');
        return $this->fetchAll();
    }

    /**
     * get the data of one submission
     * @param int $userId the ID of the desired user
     * @param int $projectId the ID of the desired project
     * @return array associative array of the submission's data
     */

    public function getSubmission($userId, $projectId){
        $this->select($this->table,'*','student = :sid AND project = :pid','','','','','','', ['sid' => $userId, 'pid' => $projectId]);
        return $this->fetch();
    }
    
    /**
     * add new submission
     * @param array $submissionData the data of the submission
     * @return int new row ID
     */

    public function addSubmission($submissionData){
        return $this->insert($this->table,$submissionData);
    }

    /**
     * delete one submission
     * @param int $userId the ID of the user
     * @param int $projectId the ID of the project
     * @return int number of affected rows
     */

    public function deleteSubmission($userId, $projectId){
        return $this->delete($this->table,'student = :sid AND project = :pid', ['sid' => $userId, 'pid' => $projectId]);
    }

    /**
     * update submission data
     * @param int $userId the ID of the user
     * @param int $projectId the ID of the project
     * @param array $submissionData the data of the submission
     * @return int number of affected rows
     */

    public function updateSubmission($userId, $projectId, $submissionData) {
        return $this->update($this->table, $subscriptionData,'student = :sid AND project = :pid', ['sid' => $userId, 'pid' => $projectId]);
    }

}
?>