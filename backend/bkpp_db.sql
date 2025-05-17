/*
SQLyog Community v13.1.9 (64 bit)
MySQL - 8.0.30 : Database - bkpp
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`bkpp` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `bkpp`;

/*Table structure for table `block_dates` */

DROP TABLE IF EXISTS `block_dates`;

CREATE TABLE `block_dates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `place_id` int NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `place_id` (`place_id`),
  KEY `dates_id` (`start_date`,`end_date`),
  CONSTRAINT `block_dates_ibfk_1` FOREIGN KEY (`place_id`) REFERENCES `places` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `block_dates` */

insert  into `block_dates`(`id`,`place_id`,`start_date`,`end_date`,`reason`,`created_at`,`updated_at`) values 
(1,1,'2025-05-28','2025-05-31','Maintenance','2025-05-16 22:58:11','2025-05-16 22:58:11'),
(2,1,'2025-05-28','2025-05-31','Maintenance','2025-05-16 22:58:35','2025-05-16 22:58:35');

/*Table structure for table `bookings` */

DROP TABLE IF EXISTS `bookings`;

CREATE TABLE `bookings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `place_id` int DEFAULT NULL,
  `items` text NOT NULL,
  `total_price` decimal(15,2) NOT NULL,
  `booking_date` datetime NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_user` (`user_id`),
  KEY `fk_place` (`place_id`),
  CONSTRAINT `fk_bookings_place_id` FOREIGN KEY (`place_id`) REFERENCES `places` (`id`),
  CONSTRAINT `fk_bookings_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `fk_place` FOREIGN KEY (`place_id`) REFERENCES `places` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `bookings` */

insert  into `bookings`(`id`,`user_id`,`place_id`,`items`,`total_price`,`booking_date`,`start_date`,`end_date`,`created_at`) values 
(9,3,3,'[{\"id\":3,\"name\":\"meeting room besar\",\"price\":\"2500000.00\",\"quantity\":1,\"subtotal\":2500000,\"startDate\":\"2025-05-19T17:00:00.000Z\",\"endDate\":\"2025-05-20T17:00:00.000Z\",\"placeImage\":\"/uploads/Meeting besar.jpg\"}]',2500000.00,'2025-05-16 14:20:11','2025-05-20 00:00:00','2025-05-21 00:00:00','2025-05-16 14:20:11'),
(11,3,NULL,'[{\"id\":5,\"name\":\"kamar\",\"price\":\"200000.00\",\"quantity\":2,\"subtotal\":800000,\"startDate\":\"2025-05-20T17:00:00.000Z\",\"endDate\":\"2025-05-22T17:00:00.000Z\",\"placeImage\":\"/uploads/Kamar.jpg\"}]',800000.00,'2025-05-17 13:59:42','2025-05-21 00:00:00','2025-05-23 00:00:00','2025-05-17 13:59:42');

/*Table structure for table `otp_codes` */

DROP TABLE IF EXISTS `otp_codes`;

CREATE TABLE `otp_codes` (
  `otp_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `code` varchar(6) NOT NULL,
  `purpose` enum('registration','reset_password') NOT NULL,
  `expires_at` timestamp NOT NULL,
  `is_used` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`otp_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `otp_codes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `otp_codes` */

/*Table structure for table `payments` */

DROP TABLE IF EXISTS `payments`;

CREATE TABLE `payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int NOT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `qr_code_url` text,
  `status` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_bookings_booking_id` (`booking_id`),
  CONSTRAINT `fk_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bookings_booking_id` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `payments` */

insert  into `payments`(`id`,`booking_id`,`amount`,`qr_code_url`,`status`,`created_at`) values 
(4,9,2500000.00,'https://api.qrserver.com/v1/create-qr-code/?data=PAYMENT-9-2500000&size=150x150','pending','2025-05-16 14:20:11'),
(14,11,800000.00,'https://api.qrserver.com/v1/create-qr-code/?data=PAYMENT-11-800000&size=150x150','pending','2025-05-17 14:00:50');

/*Table structure for table `place_images` */

DROP TABLE IF EXISTS `place_images`;

CREATE TABLE `place_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `place_id` int DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `place_id` (`place_id`),
  CONSTRAINT `place_images_ibfk_1` FOREIGN KEY (`place_id`) REFERENCES `places` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `place_images` */

insert  into `place_images`(`id`,`place_id`,`image_url`) values 
(1,1,'/uploads/Transit2.jpg'),
(2,1,'/uploads/Transit3.jpg'),
(3,1,'/uploads/Transit4.jpg'),
(4,1,'/uploads/Transit5.jpg'),
(5,3,'/uploads/Besar2.jpg'),
(6,3,'/uploads/Besar3.jpg'),
(7,3,'/uploads/Besar4.jpg'),
(8,3,'/uploads/Besar5.jpg'),
(9,4,'/uploads/Gedung2.jpg'),
(10,4,'/uploads/Gedung3.jpg'),
(11,4,'/uploads/Gedung4.jpg'),
(12,4,'/uploads/Gedung5.jpg'),
(13,5,'/uploads/Kamar2.jpg'),
(14,5,'/uploads/Kamar3.jpg'),
(15,5,'/uploads/Kamar4.jpg'),
(16,6,'/uploads/Lapangan2.jpg'),
(17,6,'/uploads/Lapangan3.jpg'),
(18,6,'/uploads/Lapangan4.jpg'),
(19,6,'/uploads/Lapangan5.jpg');

/*Table structure for table `places` */

DROP TABLE IF EXISTS `places`;

CREATE TABLE `places` (
  `id` int NOT NULL AUTO_INCREMENT,
  `place_name` varchar(255) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `trip_duration` varchar(100) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `description` text,
  `capacity` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `places` */

insert  into `places`(`id`,`place_name`,`image_url`,`trip_duration`,`price`,`description`,`capacity`) values 
(1,'transit','/uploads/Transit.jpg','1 hari',500000.00,'Ruang Transit yang nyaman dengan fasilitas WIFI, AC, Meja & Sofa, \r\nSerta tempat perjamuan tamu.\r\n',NULL),
(2,'meeting room kecil','/uploads/Meeting kecil.jpg','1 hari',1250000.00,'Meeting room kecil multifungsi dengan fasilitas WIFI, AC, Monitor, Alat Proyektor, \r\nMeja & kursi, serta perlengkapan sound system yang lengkap',50),
(3,'meeting room besar','/uploads/Meeting besar.jpg','1 hari',2500000.00,'Meeting room besar yang nyaman dan luas dengan fasilitas WIFI, AC, Meja & kursi, \r\nProyektor, Layar Presentasi, serta sistem audio yang lengkap.',100),
(4,'Gedung pertemuan','/uploads/Gedung.jpg','1 hari',3750000.00,'Ruang pertemuan yang nyaman dan luas dengan fasilitas WIFI, AC, Meja & kursi, Proyektok,\r\nLayar presentasi, serta sound system yang lengkap.',200),
(5,'kamar','/uploads/Kamar.jpg','1 hari',200000.00,'Kamar nyaman dengan fasilitas WIFI, 1 unit AC (masing-masing kamar), \r\nSmart TV yang dilengkapi Youtube & Netflix, Double Bed. Lemari dan kamar Mandi, \r\nserta tersedia opsi smoking room untuk kenyamanan anda selama menginap.  ',NULL),
(6,'lapangan','/uploads/Lapangan.jpg','1 hari',500000.00,'Lapangan yang luas dan nyaman, \r\ndilengkapi dengan fasilitas lengkap untuk berbagai kegiatan outdoor, termasuk area untuk olahraga,\r\nupacara, tempat duduk, serta akses parkir yang luas ',NULL);

/*Table structure for table `sessions` */

DROP TABLE IF EXISTS `sessions`;

CREATE TABLE `sessions` (
  `session_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL,
  PRIMARY KEY (`session_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `sessions` */

/*Table structure for table `users` */

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `is_verified` tinyint(1) DEFAULT '0',
  `is_admin` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `phone_number` (`phone_number`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `users` */

insert  into `users`(`user_id`,`full_name`,`email`,`phone_number`,`password_hash`,`is_verified`,`is_admin`,`created_at`,`updated_at`) values 
(3,'RAIHANALDY','rhnaldy4@gmail.com','+6289510889127','$2b$10$LT8Qsbzz7HNq.rUoJuQ2h.rXZ6qos5oH16N4OJ5NRpHhJrDnfL/1e',0,0,'2025-04-29 15:04:49','2025-05-05 10:05:45'),
(6,'Sholeh Hidayat','sholehhidayat54@gmail.com','+6285162581872','$2b$10$I7e4pTYmRlJ94vOHmv4hcu8ZYD2FWq0lbs3z4KqTy1mBh1Cz7u9/u',0,1,'2025-05-14 12:00:57','2025-05-14 12:01:23');

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
