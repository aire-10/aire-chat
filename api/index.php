<?php
require __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

$db = new DB();

$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$base = '/api';
$path = preg_replace('%^'.preg_quote($base, '%').'%', '', $uri);
$path = trim($path, '/');
$parts = explode('/', $path);

function inputJson() {
    $json = @file_get_contents('php://input');
    if (!$json) return null;
    return json_decode($json, true);
}

if ($path === '' || $path === 'ping') {
    echo json_encode(['status' => 'ok', 'timestamp' => time()]);
    exit;
}

if ($parts[0] === 'sessions') {
    if ($method === 'GET' && count($parts) === 1) {
        echo json_encode($db->getSessions());
        exit;
    }

    if (($method === 'POST' || $method === 'PUT') && count($parts) === 1) {
        $data = inputJson();
        if (empty($data['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing session id']);
            exit;
        }

        $db->upsertSession(['id' => $data['id'], 'title' => $data['title'] ?? 'New Chat']);
        echo json_encode(['status' => 'saved']);
        exit;
    }

    if (count($parts) >= 2) {
        $sessionId = $parts[1];

        if (count($parts) === 2 && $method === 'GET') {
            $sessions = $db->getSessions();
            $session = array_values(array_filter($sessions, fn($s) => $s['id'] === $sessionId));
            echo json_encode($session[0] ?? null);
            exit;
        }

        if (count($parts) === 3 && $parts[2] === 'messages') {
            if ($method === 'GET') {
                echo json_encode($db->getMessages($sessionId));
                exit;
            }

            if ($method === 'POST' || $method === 'PUT') {
                $body = inputJson();
                if (!$body || !is_array($body)) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Missing message payload']);
                    exit;
                }

                $messages = isset($body['messages']) ? $body['messages'] : [];
                if (!is_array($messages)) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Invalid messages array']);
                    exit;
                }

                // ensure session exists
                $db->upsertSession(['id' => $sessionId, 'title' => $body['title'] ?? 'New Chat']);

                $db->saveMessages($sessionId, $messages);
                echo json_encode(['status' => 'saved']);
                exit;
            }
        }
    }
}

http_response_code(404);
echo json_encode(['error' => 'Unknown API route', 'path' => $path]);
