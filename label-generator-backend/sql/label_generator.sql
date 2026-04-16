-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 15, 2026 at 08:36 PM
-- Server version: 8.0.43
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `label_generator`
--

-- --------------------------------------------------------

--
-- Table structure for table `parts`
--

CREATE TABLE `parts` (
  `id` int NOT NULL,
  `vendor_id` int DEFAULT NULL,
  `part_number` varchar(100) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `country_of_origin` varchar(100) DEFAULT NULL,
  `description_eng` varchar(500) DEFAULT NULL,
  `description_fr` varchar(500) DEFAULT NULL,
  `description_esp` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `parts`
--

INSERT INTO `parts` (`id`, `vendor_id`, `part_number`, `description`, `country_of_origin`, `description_eng`, `description_fr`, `description_esp`) VALUES
(1, 1, 'B05-6031M03', 'Knuckle-20K Disc Brake', 'USA', NULL, NULL, NULL),
(2, 1, 'B05-6031M03', 'Knuckle-20K Disc Brake', 'USA', NULL, NULL, NULL),
(3, 1, 'P12-7789X01', 'Axle Housing Assembly', 'USA', NULL, NULL, NULL),
(4, 2, 'BX-889900', 'Air Brake Compressor', 'Germany', NULL, NULL, NULL),
(5, 2, 'BX-112233', 'ABS Control Module', 'Mexico', NULL, NULL, NULL),
(6, 3, 'MT-445566', 'Drive Shaft Assembly', 'Canada', NULL, NULL, NULL),
(7, 3, 'MT-778899', 'Rear Axle Carrier', 'USA', NULL, NULL, NULL),
(8, 4, 'DN-102938', 'Differential Gear Kit', 'USA', NULL, NULL, NULL),
(9, 4, 'DN-564738', 'Steering Column Shaft', 'Brazil', NULL, NULL, NULL),
(10, 5, 'BS-998877', 'Fuel Injection Pump', 'Germany', NULL, NULL, NULL),
(11, 5, 'BS-223344', 'Electronic Control Unit', 'Hungary', NULL, NULL, NULL),
(12, 6, 'ZF-556677', 'Transmission Module', 'Germany', NULL, NULL, NULL),
(13, 6, 'ZF-889900', 'Clutch Pressure Plate', 'Poland', NULL, NULL, NULL),
(14, 7, 'ET-112244', 'Hydraulic Pump', 'USA', NULL, NULL, NULL),
(15, 7, 'ET-556688', 'Torque Converter', 'India', NULL, NULL, NULL),
(16, 8, 'WB-778811', 'Brake Actuator', 'USA', NULL, NULL, NULL),
(17, 8, 'WB-990022', 'Air Dryer System', 'China', NULL, NULL, NULL),
(18, 9, 'CT-334455', 'Speed Sensor Unit', 'Germany', NULL, NULL, NULL),
(19, 9, 'CT-667788', 'Tire Pressure Monitor', 'France', NULL, NULL, NULL),
(20, 10, 'CM-101010', 'Turbocharger Assembly', 'USA', NULL, NULL, NULL),
(21, 10, 'CM-202020', 'Engine Control Module', 'UK', NULL, NULL, NULL),
(22, 12, 'BT-3235', 'Break oil', 'USA', 'oil is 34 octane', 'l\'huile a un indice d\'octane de 34', 'el aceite es de 34 octanos'),
(23, 13, 'BT-45222', 'Printer CNV', 'India', 'Printer print barcode', 'Code à barres d\'impression d\'imprimante', 'Código de barras de impresión de impresora');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `username` varchar(191) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('admin','user') NOT NULL DEFAULT 'user',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password_hash`, `role`, `created_at`) VALUES
(1, 'admin', '$2b$10$6BOK7lg1CGzSyAvI.TzMHuyn.c3hDCPebbHjrB5m5BvzOsmbXOV9q', 'admin', '2026-03-22 19:20:57'),
(2, 'user', '$2b$10$NeCQn6I/CJjrhAzBrlqgw.IKJ89cSBLuBRReH12ya37mhFMlfa/mG', 'user', '2026-03-22 19:20:57'),
(3, 'user1', '$2b$10$1EET0Ktlgtx5a.1tUEmcIOphrwwuYb/sTZl7jNU2AA5jUEgd9S4jG', 'user', '2026-03-22 19:22:11'),
(4, 'user2', '$2b$10$NLdzSLW0I.ZtxI5eYWHDF.HaVL9tVcfaYKrNmGoKyrqUZzck.0xcS', 'user', '2026-04-08 14:08:24'),
(5, 'admin1', '$2b$10$LgolULtRfcJaBr3oUvYMtuh2HuoaokE64oHA2Hl6LVxGoFAdnA3h6', 'admin', '2026-04-08 14:10:22');

-- --------------------------------------------------------

--
-- Table structure for table `vendors`
--

CREATE TABLE `vendors` (
  `id` int NOT NULL,
  `vendor_code` varchar(50) DEFAULT NULL,
  `vendor_name` varchar(100) DEFAULT NULL,
  `address_line1` varchar(255) DEFAULT NULL,
  `address_line2` varchar(255) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `vendors`
--

INSERT INTO `vendors` (`id`, `vendor_code`, `vendor_name`, `address_line1`, `address_line2`, `country`) VALUES
(1, '11111AA', 'PACCAR', NULL, NULL, NULL),
(2, '21676AA', 'PACCAR', NULL, NULL, NULL),
(3, '98765ZX', 'Bendix', NULL, NULL, NULL),
(4, '54321TR', 'Meritor', NULL, NULL, NULL),
(5, '77889LK', 'Dana Incorporated', NULL, NULL, NULL),
(6, '11223GH', 'Bosch Automotive', NULL, NULL, NULL),
(7, '33445YU', 'ZF Friedrichshafen', NULL, NULL, NULL),
(8, '55667OP', 'Eaton Corporation', NULL, NULL, NULL),
(9, '99887MN', 'Wabco', NULL, NULL, NULL),
(10, '66554ER', 'Continental AG', NULL, NULL, NULL),
(11, '44332QA', 'Cummins Inc.', NULL, NULL, NULL),
(12, NULL, 'main', NULL, NULL, NULL),
(13, '3432212', 'Digital Barcode', 'Raviwar Peth', 'Pune 413322', 'India');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `parts`
--
ALTER TABLE `parts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `vendor_id` (`vendor_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `vendors`
--
ALTER TABLE `vendors`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `parts`
--
ALTER TABLE `parts`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `vendors`
--
ALTER TABLE `vendors`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `parts`
--
ALTER TABLE `parts`
  ADD CONSTRAINT `parts_ibfk_1` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
