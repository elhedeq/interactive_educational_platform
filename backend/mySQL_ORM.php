<?php
class mySQL_ORM {
    protected $config = array();
    protected $pdo;
    protected $stmt;

    public function __construct(array $config) {
        if(count($config) !== 4 ){
            throw new InvalidArgumentException("invalid number of connection parameters");
        }
        $this->config = $config;
    }

    public function connect(){
        if(!$this->pdo){
            list($host, $username, $password, $database) = $this->config;
            $dsn = "mysql:host=$host;dbname=$database;charset=utf8mb4";
            try {
                $this->pdo = new PDO($dsn, $username, $password, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                ]);
            } catch (PDOException $e) {
                throw new RuntimeException("error connecting to server: " . $e->getMessage());
            }
            unset($host, $username, $password, $database);
        }
        return $this->pdo;
    }

    public function query($query, $params = []) {
        $this->connect();
        $this->stmt = $this->pdo->prepare($query);
        if (!$this->stmt->execute($params)) {
            throw new RuntimeException("couldn't execute query: " . $query);
        }
        return $this->stmt;
    }

    public function select($table, $fields='*', $where = '', $limit = '', $offset = '', $order = '', $joinTable = '', $joinPoint = '', $extraFields = '', $params = []) {
        $query = 'SELECT ' . $fields . ($extraFields ? ',' . $extraFields : '') . ' FROM ' . $table
            . ($joinTable ? ' JOIN ' . $joinTable . ' ON ' . $joinPoint : '')
            . ($where ? ' WHERE ' . $where : '')
            . ($order ? ' ORDER BY ' . $order : '')
            . ($limit ? ' LIMIT ' . (int)$limit : '')
            . ($offset ? ' OFFSET ' . (int)$offset : '')
            . ';';
        $this->query($query, $params);
        return $this->countRows();
    }

    public function insert($table, array $data) {
        $fields = implode(',', array_keys($data));
        $placeholders = implode(',', array_map(function($k){ return ':' . $k; }, array_keys($data)));
        $query = "INSERT INTO $table ($fields) VALUES ($placeholders)";
        $this->query($query, $data);
        return $this->getInsertId();
    }

    public function update($table, array $data, $where = '', $whereParams = []) {
        $set = [];
        foreach ($data as $field => $value) {
            $set[] = "`$field` = :$field";
        }
        $setStr = implode(',', $set);
        $query = "UPDATE $table SET $setStr" . ($where ? " WHERE $where" : '');
        $params = array_merge($data, $whereParams);
        $this->query($query, $params);
        return $this->getAffectedRows();
    }

    public function delete($table, $where, $params = []) {
        $query = "DELETE FROM $table WHERE $where";
        $this->query($query, $params);
        return $this->getAffectedRows();
    }

    public function fetch() {
        return $this->stmt ? $this->stmt->fetch() : false;
    }

    public function fetchAll() {
        return $this->stmt ? $this->stmt->fetchAll() : false;
    }

    public function countRows(){
        return $this->stmt ? $this->stmt->rowCount() : 0;
    }

    protected function getInsertId(){
        return $this->pdo ? $this->pdo->lastInsertId() : null;
    }

    protected function getAffectedRows() {
        return $this->stmt ? $this->stmt->rowCount() : 0;
    }

    public function disconnect() {
        $this->pdo = null;
        return true;
    }

    public function __destruct() {
        $this->disconnect();
    }
}
?>