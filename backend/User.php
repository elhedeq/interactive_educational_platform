<?php
if(!class_exists('mySQL_ORM'))
require __DIR__ . '/mySQL_ORM.php';
require __DIR__ . '/config.php';
class User extends mySQL_ORM{

    private $table = 'users';

    /**
     * Constructor
     */

    public function __construct()
    {
        global $dbconfig;
        parent::__construct($dbconfig);
    }

    /**
     * get all users' data
     * @return array an array of all users' data
     */

    public function getUsers(){
        $this->select($this->table, 'first_name, last_name, email, id, bio, avatar, credential');
        return $this->fetchAll();
    }

    /**
     * get the data of one user
     * @param int $userId the ID of the desired user
     * @return array associative array of the user's data
     */

    public function getUser($userId){
        $this->select($this->table,'*','id = :id','','','','','','', ['id' => $userId]);
        return $this->fetch();
    }

    /**
     * get the data of one user given his email
     * @param string $email the email of the desired user
     * @return array associative array of the user's data
     */

    public function getUserByEmail($email){
        $this->select($this->table,'*','email = :email','','','','','','', ['email' => $email]);
        return $this->fetch();
    }

    /**
     * add new user
     * @param array $userData the data of the user (name="name",email="email",...)
     * @return int new row ID
     */

    public function addUser($userData){
        return $this->insert($this->table,$userData);
    }

    /**
     * delete one user
     * @param int $userId the ID of the user to be deleted
     * @return int number of affected rows
     */

    public function deleteUser($userId){
        return $this->delete($this->table,'id = :id', ['id' => $userId]);
    }

    /**
     * update user date
     * @param int $userId the ID of the user to be updated
     * @param array $userData the data of the user (name="name",email="email",...)
     * @return int number of affected rows
     */

    public function updateUser($userId, $userData) {
        return $this->update($this->table, $userData,'id = :id', ['id' => $userId]);
    }

    /**
     * search for user by name or email
     * @param string @keyword the name or email
     * @return array an array of all matched users
     */

    public function searchUsers($keyword) {
        $keyword = $keyword;
        $this->select($this->table, '*', "first_name LIKE '%$keyword%' OR last_name LIKE '%$keyword%' OR email LIKE '%$keyword%'");
        return $this->fetchAll();
    }

    public function is_valid_name($name) {
        // Allow letters, numbers, underscores, dashes, and spaces
        return preg_match('/^[\p{L}\p{N} _-]+$/u', $name);
    }

}
?>