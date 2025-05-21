<?php
// Set the root directory where your website is located
$rootDir = __DIR__; // Current directory where this script is located

// Error document settings to add to each .htaccess file
$errorSettings = <<<EOT
# Error document settings
ErrorDocument 404 https://www.akeva-technologies.com/404.html
ErrorDocument 500 https://www.akeva-technologies.com/500.html
ErrorDocument 403 https://www.akeva-technologies.com/403.html
ErrorDocument 503 https://www.akeva-technologies.com/503.html
ErrorDocument 400 https://www.akeva-technologies.com/error.html
ErrorDocument 401 https://www.akeva-technologies.com/error.html
ErrorDocument 405 https://www.akeva-technologies.com/error.html
ErrorDocument 408 https://www.akeva-technologies.com/error.html
ErrorDocument 410 https://www.akeva-technologies.com/error.html
ErrorDocument 429 https://www.akeva-technologies.com/error.html
ErrorDocument 502 https://www.akeva-technologies.com/error.html
ErrorDocument 504 https://www.akeva-technologies.com/error.html

EOT;

// Directories to exclude
$excludeDirs = array('.', '..', '.git', '.well-known', 'cgi-bin');

// Function to recursively process directories
function processDirectory($dir, $errorSettings, $excludeDirs) {
    $files = scandir($dir);
    
    foreach ($files as $file) {
        if (in_array($file, $excludeDirs)) {
            continue;
        }
        
        $path = $dir . '/' . $file;
        
        if (is_dir($path)) {
            // Create or update .htaccess in this directory
            $htaccessPath = $path . '/.htaccess';
            
            if (file_exists($htaccessPath)) {
                // Read existing .htaccess
                $content = file_get_contents($htaccessPath);
                
                // Check if error settings already exist
                if (strpos($content, 'ErrorDocument 404') === false) {
                    // Prepend error settings to existing content
                    file_put_contents($htaccessPath, $errorSettings . $content);
                    echo "Updated .htaccess in: $path<br>";
                } else {
                    echo "Error settings already exist in: $path<br>";
                }
            } else {
                // Create new .htaccess with error settings
                file_put_contents($htaccessPath, $errorSettings);
                echo "Created new .htaccess in: $path<br>";
            }
            
            // Process subdirectories recursively
            processDirectory($path, $errorSettings, $excludeDirs);
        }
    }
}

// Start processing from the root directory
echo "<h1>Deploying .htaccess files to subdirectories</h1>";
processDirectory($rootDir, $errorSettings, $excludeDirs);
echo "<h2>Deployment complete!</h2>";
?>