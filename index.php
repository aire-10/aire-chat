<?php
// If user visits aire-chat.test, redirect to the frontend app
header('Location: frontend/index.html', true, 302);
exit;
