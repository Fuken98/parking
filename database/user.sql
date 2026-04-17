CREATE USER 'parking_user'@'localhost' IDENTIFIED BY 'Parking123!';
GRANT ALL PRIVILEGES ON parking.* TO 'parking_user'@'localhost';
FLUSH PRIVILEGES;
