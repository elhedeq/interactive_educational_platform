<?php

$readme = file_get_contents(__DIR__ . '/README.md');

// Remove markdown code fence markers if present
$readme = preg_replace('/^```markdown\n/', '', $readme);
$readme = preg_replace('/\n```$/', '', $readme);

// Escape HTML first to preserve literal content
$html = htmlspecialchars($readme, ENT_QUOTES, 'UTF-8');

// CODE BLOCKS FIRST - before headers and other processing
$codeBlocks = [];
$html = preg_replace_callback(
    '/```(.*?)\n(.*?)```/s',
    function($matches) use (&$codeBlocks) {
        $lang = trim($matches[1]);
        $code = $matches[2]; // Already escaped from htmlspecialchars above
        $langAttr = $lang ? " class=\"language-{$lang}\"" : '';
        $placeholder = '<!--CODEBLOCK-' . count($codeBlocks) . '-->';
        $codeBlocks[] = "<pre><code{$langAttr}>{$code}</code></pre>";
        return $placeholder;
    },
    $html
);

// Headers (now safe - code blocks are placeholders)
// Now unescape specific markdown patterns
// Headers
$html = preg_replace('/^# (.*?)$/m', '<h1>$1</h1>', $html);
$html = preg_replace('/^## (.*?)$/m', '<h2>$1</h2>', $html);
$html = preg_replace('/^### (.*?)$/m', '<h3>$1</h3>', $html);

// Horizontal rules
$html = preg_replace('/^---$/m', '<hr>', $html);

// Inline code (backticks)
$html = preg_replace('/`([^`]+)`/', '<code>$1</code>', $html);

// Bold
$html = preg_replace('/\*\*([^\*]+)\*\*/', '<strong>$1</strong>', $html);
$html = preg_replace('/__([^_]+)__/', '<strong>$1</strong>', $html);

// Tables - convert before paragraphs
$html = preg_replace_callback(
    '/^\|(.+?)\|\s*\n\|[\s:|\-]+\|\s*\n((?:^\|.+?\|\s*\n)*)/m',
    function($matches) {
        $headerLine = trim($matches[1]);
        $bodyLines = isset($matches[2]) ? trim($matches[2]) : '';
        
        // Parse header
        $headerCells = array_map('trim', array_filter(explode('|', $headerLine)));
        
        $tableHtml = '<table><thead><tr>';
        foreach ($headerCells as $cell) {
            $tableHtml .= '<th>' . $cell . '</th>';
        }
        $tableHtml .= '</tr></thead><tbody>';
        
        // Parse body rows
        if (!empty($bodyLines)) {
            foreach (explode("\n", $bodyLines) as $row) {
                $row = trim($row);
                if (!empty($row) && $row !== '' && strpos($row, '|') !== false) {
                    $cells = array_map('trim', array_filter(explode('|', $row)));
                    if (!empty($cells)) {
                        $tableHtml .= '<tr>';
                        foreach ($cells as $cell) {
                            $tableHtml .= '<td>' . $cell . '</td>';
                        }
                        $tableHtml .= '</tr>';
                    }
                }
            }
        }
        
        $tableHtml .= '</tbody></table>';
        return $tableHtml;
    },
    $html
);

// Lists
$html = preg_replace('/^\- (.*?)$/m', '<li>$1</li>', $html);

// Wrap consecutive list items in <ul>
$html = preg_replace_callback(
    '/(<li>.*?<\/li>)(?:\s*<li>.*?<\/li>)*/s',
    function($matches) {
        $items = $matches[0];
        return '<ul>' . $items . '</ul>';
    },
    $html
);

// Paragraphs - wrap non-empty lines that aren't already tags
$lines = explode("\n", $html);
$output = [];
$inParagraph = false;

foreach ($lines as $line) {
    $trimmed = trim($line);
    
    // Check if line is a block element
    if (empty($trimmed) || 
        preg_match('/^<(h[1-3]|table|pre|ul|hr|blockquote|li)|<!--CODEBLOCK/', $trimmed)) {
        
        if ($inParagraph) {
            $output[] = '</p>';
            $inParagraph = false;
        }
        
        if (!empty($trimmed)) {
            $output[] = $trimmed;
        }
    } else {
        // Regular text line
        if (!$inParagraph) {
            $output[] = '<p>';
            $inParagraph = true;
        }
        $output[] = $trimmed;
    }
}

if ($inParagraph) {
    $output[] = '</p>';
}

$html = implode("\n", $output);

// Links
$html = preg_replace('/\[([^\]]+)\]\(([^\)]+)\)/', '<a href="$2">$1</a>', $html);

// Replace code block placeholders with actual code blocks
foreach ($codeBlocks as $index => $codeBlock) {
    $html = str_replace('<!--CODEBLOCK-' . $index . '-->', $codeBlock, $html);
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>E-Learning Platform API Documentation</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
        }
        
        .container {
            max-width: 900px;
            margin: 0 auto;
            padding: 40px 20px;
            background: white;
            min-height: 100vh;
        }
        
        h1 {
            font-size: 2.5em;
            color: #2c3e50;
            margin: 0.5em 0;
            border-bottom: 3px solid #3498db;
            padding-bottom: 0.3em;
        }
        
        h2 {
            font-size: 1.8em;
            color: #34495e;
            margin: 1.2em 0 0.5em 0;
            border-left: 4px solid #3498db;
            padding-left: 15px;
        }
        
        h3 {
            font-size: 1.3em;
            color: #555;
            margin: 0.8em 0 0.3em 0;
        }
        
        p {
            margin: 1em 0;
            line-height: 1.8;
        }
        
        code {
            background: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', Courier, monospace;
            font-size: 0.9em;
            color: #d63384;
        }
        
        pre {
            background: #2c3e50;
            color: #ecf0f1;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            margin: 1em 0;
            font-size: 0.9em;
        }
        
        pre code {
            background: none;
            color: inherit;
            padding: 0;
            border-radius: 0;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 1.5em 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        table th {
            background: #3498db;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            border: 1px solid #2980b9;
        }
        
        table td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        
        table tbody tr:hover {
            background: #f9f9f9;
        }
        
        ul {
            list-style: none;
            padding-left: 0;
        }
        
        li {
            padding: 5px 0;
            padding-left: 25px;
            position: relative;
        }
        
        li::before {
            content: "▸";
            position: absolute;
            left: 0;
            color: #3498db;
        }
        
        hr {
            border: none;
            border-top: 2px solid #ecf0f1;
            margin: 2em 0;
        }
        
        a {
            color: #3498db;
            text-decoration: none;
            border-bottom: 1px dotted #3498db;
        }
        
        a:hover {
            color: #2980b9;
            border-bottom-color: #2980b9;
        }
        
        strong {
            color: #2c3e50;
            font-weight: 600;
        }
        
        em {
            color: #7f8c8d;
            font-style: italic;
        }
        
        .highlight {
            background: #fffacd;
            padding: 0.2em 0.4em;
            border-radius: 3px;
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 20px 15px;
            }
            
            h1 {
                font-size: 1.8em;
            }
            
            h2 {
                font-size: 1.3em;
            }
            
            table {
                font-size: 0.85em;
            }
            
            table td {
                padding: 8px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <?php echo $html; ?>
    </div>
</body>
</html>
