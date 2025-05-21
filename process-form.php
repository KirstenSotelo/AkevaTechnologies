<?php
// Set headers to prevent caching
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

// Start session for rate limiting
session_start();

// Only process POST requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Rate limiting implementation
    $maxSubmissions = 3; // Maximum submissions allowed
    $timeWindow = 3600; // Time window in seconds (1 hour)
    
    // Initialize session variables if they don't exist
    if (!isset($_SESSION['form_submissions'])) {
        $_SESSION['form_submissions'] = 0;
    }
    if (!isset($_SESSION['form_first_submission_time'])) {
        $_SESSION['form_first_submission_time'] = time();
    }
    
    // Check if time window has passed, reset if it has
    if (time() - $_SESSION['form_first_submission_time'] > $timeWindow) {
        $_SESSION['form_submissions'] = 0;
        $_SESSION['form_first_submission_time'] = time();
    }
    
    // Check if user has exceeded submission limit
    if ($_SESSION['form_submissions'] >= $maxSubmissions) {
        http_response_code(429); // Too Many Requests
        echo json_encode([
            'success' => false, 
            'message' => 'Too many submissions. Please try again later.'
        ]);
        exit;
    }
    
    // Your Web3Forms access key - keep this secret
    $accessKey = 'ACCESS KEY HERE';
    
    // Get form data
    $name = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_STRING);
    $email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
    $phone = filter_input(INPUT_POST, 'phone', FILTER_SANITIZE_STRING);
    $company = filter_input(INPUT_POST, 'company', FILTER_SANITIZE_STRING);
    $subject = filter_input(INPUT_POST, 'subject', FILTER_SANITIZE_STRING);
    $message = filter_input(INPUT_POST, 'message', FILTER_SANITIZE_STRING);
    $consent = isset($_POST['consent']) ? 'Yes' : 'No';
    
    // Check for honeypot field (spam protection)
    if (!empty($_POST['botcheck'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Bot detected']);
        exit;
    }
    
    // Additional spam checks
    
    // 1. Check for submission speed (bots often submit forms too quickly)
    if (isset($_SESSION['last_submission_time'])) {
        $timeSinceLastSubmission = time() - $_SESSION['last_submission_time'];
        if ($timeSinceLastSubmission < 5) { // Less than 5 seconds between submissions
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Please wait before submitting again.']);
            exit;
        }
    }
    $_SESSION['last_submission_time'] = time();
    
    // 2. Check for suspicious content in message (links, etc.)
    $suspiciousPatterns = [
        '/\b(?:https?:\/\/|www\.)\S+/i', // URLs
        '/\[url=/i',                     // BBCode URLs
        '/<a\s+href/i',                  // HTML links
        '/\b(?:viagra|cialis|casino|poker|lottery|prize|winner)\b/i' // Common spam words
    ];
    
    foreach ($suspiciousPatterns as $pattern) {
        if (preg_match($pattern, $message)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Your message contains content that appears to be spam.']);
            exit;
        }
    }
    
    // Validate required fields
    if (empty($name) || empty($email) || empty($subject) || empty($message) || $consent !== 'Yes') {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Please fill all required fields']);
        exit;
    }
    
    // Prepare data for Web3Forms
    $formData = [
        'access_key' => $accessKey,
        'name' => $name,
        'email' => $email,
        'phone' => $phone,
        'company' => $company,
        'subject' => $subject,
        'message' => $message,
        'consent' => $consent,
        'from_name' => 'Akeva Technologies Website',
        // You can add a redirect URL if needed
        // 'redirect' => 'https://www.akeva-technologies.com/thank-you.html',
    ];
    
    // Initialize cURL
    $ch = curl_init('https://api.web3forms.com/submit');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($formData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/x-www-form-urlencoded'
    ]);
    
    // Execute the request
    $response = curl_exec($ch);
    $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    // Parse the response to see if it's JSON
    $responseData = json_decode($response, true);
    
    // Set the content type header to JSON
    header('Content-Type: application/json');
    
    // Log the response for debugging
    error_log('Web3Forms Response: ' . $response);
    error_log('Status Code: ' . $statusCode);

    // Return the Web3Forms response to the client with the appropriate status code
    if ($statusCode >= 200 && $statusCode < 300) {
        // Force a 200 OK status for successful submissions
        http_response_code(200);
        
        // Increment submission counter on success
        $_SESSION['form_submissions']++;
        
        // If we got a valid JSON response, pass it through
        if ($responseData) {
            echo json_encode([
                'success' => true,
                'message' => 'Your message has been sent successfully!'
            ]);
        } else {
            // If not JSON, create our own success response
            echo json_encode([
                'success' => true,
                'message' => 'Your message has been sent successfully!'
            ]);
        }
    } else {
        // For error responses
        http_response_code(200); // Still return 200 to client but with error message
        echo json_encode([
            'success' => false,
            'message' => 'There was an error processing your request.'
        ]);
    }
    exit;
} else {
    // Not a POST request
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}
?>
