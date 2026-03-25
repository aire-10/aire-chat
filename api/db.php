<?php

class DB {
    private $pdo;

    public function __construct($path = null) {
        $path = $path ?? __DIR__ . '/../database.sqlite';
        $this->pdo = new PDO('sqlite:' . $path);
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $this->migrate();
    }

    private function migrate() {
        $this->pdo->exec('CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
        )');

        $this->pdo->exec('CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            session_id TEXT NOT NULL,
            role TEXT NOT NULL,
            text TEXT NOT NULL,
            ts INTEGER NOT NULL,
            FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
        )');

        $this->pdo->exec('CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            password TEXT NOT NULL,
            created_at INTEGER NOT NULL
        )');
    }

    public function getSessions() {
        $stmt = $this->pdo->query('SELECT * FROM sessions ORDER BY updated_at DESC');
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function createSession($id, $title) {
        $now = time();
        $sql = 'INSERT OR REPLACE INTO sessions (id,title,created_at,updated_at) VALUES (:id,:title,:created_at,:updated_at)';
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':id'=>$id, ':title'=>$title, ':created_at'=>$now, ':updated_at'=>$now]);
    }

    public function updateSession($id, $title) {
        $now = time();
        $sql = 'UPDATE sessions SET title = :title, updated_at = :updated_at WHERE id = :id';
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':id'=>$id, ':title'=>$title, ':updated_at'=>$now]);
    }

    public function getMessages($sessionId) {
        $stmt = $this->pdo->prepare('SELECT * FROM messages WHERE session_id = :session_id ORDER BY ts ASC');
        $stmt->execute([':session_id'=>$sessionId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function saveMessages($sessionId, $messages) {
        $this->pdo->beginTransaction();
        $del = $this->pdo->prepare('DELETE FROM messages WHERE session_id = :session_id');
        $del->execute([':session_id' => $sessionId]);

        $ins = $this->pdo->prepare('INSERT OR REPLACE INTO messages (id, session_id, role, text, ts)
            VALUES (:id, :session_id, :role, :text, :ts)');

        foreach ($messages as $m) {
            if (empty($m['id'])) {
                $m['id'] = uniqid('m_', true);
            }
            $ins->execute([
                ':id' => $m['id'],
                ':session_id' => $sessionId,
                ':role' => $m['role'],
                ':text' => $m['text'],
                ':ts' => $m['ts'] ?? time(),
            ]);
        }

        $this->pdo->commit();
    }

    public function upsertSession($session) {
        if (!isset($session['id'])) return;
        if (!isset($session['title'])) $session['title'] = 'New Chat';
        $now = time();
        $exists = $this->pdo->prepare('SELECT 1 FROM sessions WHERE id = :id');
        $exists->execute([':id'=>$session['id']]);
        if ($exists->fetch()) {
            $this->updateSession($session['id'], $session['title']);
        } else {
            $this->createSession($session['id'], $session['title']);
        }
    }
}
