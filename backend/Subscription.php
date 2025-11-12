<?php
if(!class_exists('mySQL_ORM'))
require __DIR__ . '/mySQL_ORM.php';
require __DIR__ . '/config.php';
class Subscription extends mySQL_ORM{

    private $table = 'subscriptions';

    /**
     * Constructor
     */

    public function __construct()
    {
        global $dbconfig;
        parent::__construct($dbconfig);
    }

    /**
     * get all subscriptions' data
     * @return array an array of all subscriptions' data
     */

    public function getSubscriptions(){
        $this->select($this->table, '*');
        return $this->fetchAll();
    }

    /**
     * get the data of one subscription
     * @param int $userId the ID of the desired user
     * @param int $courseId the ID of the desired course
     * @return array associative array of the subscription's data
     */

    public function getSubscription($userId, $courseId){
        $this->select($this->table,'*','student = :sid AND course = :cid','','','','','','', ['sid' => $userId, 'cid' => $courseId]);
        return $this->fetch();
    }
    
    /**
     * add new subscription
     * @param array $subscriptionData the data of the subscription
     * @return int new row ID
     */

    public function addSubscription($subscriptionData){
        return $this->insert($this->table,$subscriptionData);
    }

    /**
     * delete one subscription
     * @param int $userId the ID of the user
     * @param int $courseId the ID of the course
     * @return int number of affected rows
     */

    public function deleteSubscription($userId, $courseId){
        return $this->delete($this->table,'student = :sid AND course = :cid', ['sid' => $userId, 'cid' => $courseId]);
    }

    /**
     * update subscription data
     * @param int $userId the ID of the user
     * @param int $courseId the ID of the course
     * @param array $subscriptionData the data of the subscription
     * @return int number of affected rows
     */

    public function updateSubscription($userId, $courseId, $subscriptionData) {
        return $this->update($this->table, $subscriptionData,'student = :sid AND course = :cid', ['sid' => $userId, 'cid' => $courseId]);
    }

}
?>