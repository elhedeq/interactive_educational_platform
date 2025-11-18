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
        $this->select($this->table, 'first_name, last_name, email, birth_date, id, bio, avatar, credential');
        return $this->fetchAll();
    }

    /**
     * get the data of one user
     * @param int $userId the ID of the desired user
     * @return array associative array of the user's data
     */

    public function getUser($userId){
        $this->select($this->table,'first_name, last_name, email, birth_date, id, bio, avatar, credential','id = :id','','','','','','', ['id' => $userId]);
        return $this->fetch();
    }

    /**
     * get the data of one user given his email
     * @param string $email the email of the desired user
     * @return array associative array of the user's data
     */

    public function getUserByEmail($email){
        $this->select($this->table,'first_name, last_name, email, birth_date, id, bio, avatar, credential, password','email = :email','','','','','','', ['email' => $email]);
        return $this->fetch();
    }

    /**
     * add new user
     * @param array $userData the data of the user (name="name",email="email",...)
     * @return int new row ID
     */

    public function addUser($userData){
        // Hash password if provided
        if (isset($userData['password']) && !empty($userData['password'])) {
            $userData['password'] = $this->hashPassword($userData['password']);
        }
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
        $this->select($this->table, 'first_name, last_name, birth_date, email, id, bio, avatar, credential', "users.first_name LIKE '%$keyword%' OR users.last_name LIKE '%$keyword%' OR users.email LIKE '%$keyword%'");
        return $this->fetchAll();
    }

    public function is_valid_name($name) {
        // Allow letters, numbers, underscores, dashes, and spaces
        return preg_match('/^[\p{L}\p{N} _-]+$/u', $name);
    }

    /**
     * Hash a password using bcrypt
     * @param string $password the plain text password
     * @return string the hashed password
     */
    public function hashPassword($password) {
        return password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
    }

    /**
     * Login user with email and password
     * @param string $email the user's email
     * @param string $password the user's password
     * @return array with 'success' and 'token' or 'error' message
     */
    public function login($email, $password) {
        // Get user by email
        $user = $this->getUserByEmail($email);
        
        if (!$user) {
            return [
                'success' => false,
                'error' => 'Invalid email or password'
            ];
        }

        // Verify password
        if (!isset($user['password']) || !password_verify($password, $user['password'])) {
            return [
                'success' => false,
                'error' => 'Invalid email or password'
            ];
        }

        // Generate JWT token
        $token = $this->generateJWT($user);

        return [
            'success' => true,
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'first_name' => $user['first_name'],
                'last_name' => $user['last_name'],
                'birth_date' => $user['birth_date'],
                'email' => $user['email'],
                'id' => $user['id'],
                'bio' => $user['bio'],
                'avatar' => $user['avatar'],
                'credential' => $user['credential']
            ]
        ];
    }

    /**
     * Generate JWT token for a user
     * @param array $user the user data
     * @return string JWT token
     */
    private function generateJWT($user) {
        $header = json_encode(['alg' => 'HS256', 'typ' => 'JWT']);
        $payload = json_encode([
            'sub' => $user['id'],
            'email' => $user['email'],
            'iat' => time(),
            'exp' => time() + (24 * 60 * 60) // 24 hours
        ]);

        $base64Header = rtrim(strtr(base64_encode($header), '+/', '-_'), '=');
        $base64Payload = rtrim(strtr(base64_encode($payload), '+/', '-_'), '=');

        $signature = hash_hmac('sha256', $base64Header . '.' . $base64Payload, getenv('JWT_SECRET') ?: 'your-secret-key', true);
        $base64Signature = rtrim(strtr(base64_encode($signature), '+/', '-_'), '=');

        return $base64Header . '.' . $base64Payload . '.' . $base64Signature;
    }

    /**
     * Verify and decode a JWT token
     * @param string $token the JWT token
     * @return array|null decoded token payload or null if invalid/expired
     */
    public function verifyJWT($token) {
        if (!$token || strpos($token, '.') === false) {
            return null;
        }

        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }

        list($base64Header, $base64Payload, $base64Signature) = $parts;

        // Reconstruct the signature to verify
        $signature = hash_hmac('sha256', $base64Header . '.' . $base64Payload, getenv('JWT_SECRET') ?: 'your-secret-key', true);
        $expectedSignature = rtrim(strtr(base64_encode($signature), '+/', '-_'), '=');

        // Verify signature
        if (!hash_equals($expectedSignature, $base64Signature)) {
            return null;
        }

        // Decode payload
        $payload = json_decode(base64_decode(strtr($base64Payload, '-_', '+/') . str_repeat('=', 4 - strlen($base64Payload) % 4)), true);

        if (!$payload) {
            return null;
        }

        // Check expiration
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            return null;
        }

        return $payload;
    }

}
?>