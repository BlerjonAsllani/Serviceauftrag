<?php
   session_start();
   session_destroy();
   echo "Session gelöscht!";
   header('Location: http://localhost:3000');
   ?>