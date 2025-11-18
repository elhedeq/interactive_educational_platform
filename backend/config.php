<?php
// Load environment variables from .env file
if (file_exists(__DIR__ . '/.env')) {
    $lines = file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        // Skip comments and empty lines
        if (strpos($line, '#') === 0 || strpos($line, '=') === false) {
            continue;
        }
        list($key, $value) = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value);
        // Set environment variable if not already set
        if (!getenv($key)) {
            putenv($key . '=' . $value);
        }
    }
}

# database connection arguments
$dbconfig = array(
    getenv('DB_HOST') ?: 'localhost',
    getenv('DB_USER') ?: 'root',
    getenv('DB_PASSWORD') ?: '',
    getenv('DB_NAME') ?: 'elearning'
);

# project specific variables
$project_vars = array(
    'root' => $_SERVER["DOCUMENT_ROOT"] ,
    'uploads' => $_SERVER["DOCUMENT_ROOT"] . "/uploads"
);
?>