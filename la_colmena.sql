-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 08-12-2025 a las 06:51:26
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `la_colmena`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` int(2) NOT NULL,
  `NomCompleto` varchar(100) DEFAULT NULL,
  `Usuario` varchar(25) DEFAULT NULL,
  `Email` varchar(50) DEFAULT NULL,
  `Contrasena` varchar(250) DEFAULT NULL,
  `Telefono` varchar(10) DEFAULT NULL,
  `Direccion` varchar(50) DEFAULT NULL,
  `Cuenta` int(10) DEFAULT NULL,
  `fallos` int(2) DEFAULT NULL,
  `bloqueo_hasta` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `NomCompleto`, `Usuario`, `Email`, `Contrasena`, `Telefono`, `Direccion`, `Cuenta`, `fallos`, `bloqueo_hasta`) VALUES
(1, 'Jesus Alberto Damasco Lopez', 'Admin', '', 'YPrueba', NULL, NULL, 0, 2, '2025-12-08 03:47:36'),
(2, 'Juan Antonio Alba Cardona', 'JuanAlba', '', 'YPrueba', NULL, NULL, 0, 0, '2025-12-06 19:17:47'),
(3, 'Andrea Elizabeth Rosales Santos', 'LizRosales', '', 'LizRS_21', NULL, NULL, 0, 0, '2025-12-06 19:17:47'),
(4, 'Italia Lucero Hernández Rodríguez', 'LuceroHernandez', '', 'ItaliaHR18', NULL, NULL, 0, 0, '2025-12-06 19:17:47'),
(5, 'Oscar Santiago Diaz López', 'OscarDiaz', '', 'OscarDL_19', NULL, NULL, 0, 1, '2025-12-06 22:51:54'),
(6, NULL, 'UPrueba', '', 'YPrueba', NULL, NULL, NULL, 0, '2025-12-06 19:17:47'),
(7, 'Jesus Prueba', 'JPrueba', 'Prueba@prueba.com', 'YPrueba', '104', 'Enrique Segoviano', NULL, 0, '2025-12-06 19:17:47'),
(8, 'Administrador de La Colmena', 'Admin', 'admin@lacolmena.com', '$2b$10$nm/ptJUMRih56eOLPI', '4495602241', 'Ags', 0, 2, '2025-12-08 03:47:36'),
(9, 'Alpha', 'Alberto', 'Alpha@beta.com', '$2b$10$88ex1YSibhAG2ofjka', '4495602241', 'Ags', 0, 0, '2025-12-06 19:56:31'),
(10, 'Prueba', 'Alpha', 'al345820@edu.uaa.mx', '$2b$10$7jrniEoWX0DkACTqDF', '524', 'Ags', 0, 0, '2025-12-06 20:36:18'),
(11, 'Alpha', 'Alpha', 'Alpha', 'Alpha', '52542', 'Alpha', 0, 0, '2025-12-06 20:36:18'),
(12, 'Jesus Damasco', 'Jesus', 'damascojesus1@gmail.com', '$2b$10$u0FNkClrCZlqw08Fm6', '6354', 'Ags', 0, 2, '2025-12-06 20:33:53'),
(13, 'Liz', 'Liz', 'damascojesus1@gmail.com', '$2b$10$sRE1pUQjyysAaKjhcZ', '43524', 'Aguascalientes', NULL, 1, '2025-12-06 20:51:32'),
(14, 'Ola', 'Ola', 'ola@ola.com', '$2b$10$i0kmesb.OtRyawfT9ulg.OeZcNQ/cv43bn3qpQamuEqnCzkbd2mLG', '5424', 'Ags', NULL, 0, NULL),
(15, 'Oscar', 'Oscar', 'Oscar@q.com', '$2b$10$lgF3gCeu2HoTa4E/fgc0wOEcacTCuu4p4MA7TvCho658TKB.YCfKy', '42', 'ljk', NULL, 0, NULL),
(18, 'Italia Lucero', 'Lucero', 'lucero@gmail.com', '$2b$10$deuFVOlulYbYFyo8KwaJCelGzWNEwHvmMi4orozgjlybhMaKS6cQa', '4494312564', 'Ags', NULL, 0, NULL),
(19, 'Juan Antonio Alba Cardona', 'JuanAlba', 'jaalbacardona@gmail.com', '$2b$10$Kq9hyOOvvmxLgnR/XVsRt.CTRADLMwGiwGjfxgmFoAoSpU7Nd1jJe', '4492751157', 'Ags', NULL, 0, NULL),
(20, 'talia Lucero Hernandez Rodriguez', 'ItaliaHero', 'italiahero14@gmail.com', '$2b$10$bjQqMZSs3sGmXISPZaqSqOk1IIlfbVD9BgT4ahZxnNOaT4olJWPnS', '4495265895', 'Ags', NULL, 0, NULL),
(23, 'Admin De La Colmena ', 'AdminLC', 'admin2@lacolmena.com', '$2b$10$8HDE1Dbn9GbIKhtrqzgMDecmjM1HUpc4XAlSRp8wN20uVo6FENBGS', '4495602241', 'Ags', NULL, 0, NULL),
(24, 'Oscar Santiago Diaz Lopez', 'OscuLop', 'odlopez765@gmail.com', '$2b$10$vPhhGl1vZs7SVrJJp9uSiOFA.dOPz3FX1lkMf4tkNahYcQ8jG64/i', '4499203513', 'AGS', NULL, 0, NULL),
(25, 'Fernando', 'ferb', 'fernando@gmail.com', '$2b$10$U6JMcMCKsqiQ1/I6gJjrXOmLDtYD9RXGUK/5eT1.aSODKHP.krFf.', '4494130788', 'Ags', NULL, 0, NULL);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(2) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
