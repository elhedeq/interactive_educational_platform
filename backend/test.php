<?php
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
        echo "Setting $key to $value\n";
        // Set environment variable if not already set
        if (!getenv($key)) {
            putenv($key . '=' . $value);
        } 
    }
} else {
    echo ".env file not found.";
}
echo 'password: ' . password_hash('password', PASSWORD_BCRYPT, ['cost' => 12]);
?>