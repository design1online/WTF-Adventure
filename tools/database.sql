-- phpMyAdmin SQL Dump
-- version 4.5.4.1deb2ubuntu2
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Oct 03, 2017 at 08:58 PM
-- Server version: 5.7.19-0ubuntu0.16.04.1
-- PHP Version: 7.0.18-0ubuntu0.16.04.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `TTAEmpty`
--

-- --------------------------------------------------------

--
-- Table structure for table `ipbans`
--

CREATE TABLE `ipbans` (
  `ip` varchar(64) NOT NULL,
  `ipban` int(64) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `player_abilities`
--

CREATE TABLE `player_abilities` (
  `username` varchar(64) NOT NULL,
  `abilities` text CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `abilityLevels` text CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `shortcuts` text CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `player_achievements`
--

CREATE TABLE `player_achievements` (
  `username` varchar(64) NOT NULL,
  `ids` text CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `progress` text CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `player_bank`
--

CREATE TABLE `player_bank` (
  `username` varchar(64) NOT NULL,
  `ids` text CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `counts` text CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `abilities` text CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `abilityLevels` text CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `player_data`
--

CREATE TABLE `player_data` (
  `username` varchar(64) NOT NULL,
  `email` varchar(64) DEFAULT NULL,
  `x` int(11) DEFAULT NULL,
  `y` int(11) DEFAULT NULL,
  `experience` int(11) DEFAULT NULL,
  `kind` int(11) DEFAULT NULL,
  `rights` int(11) DEFAULT NULL,
  `poisoned` tinyint(4) DEFAULT NULL,
  `hitPoints` int(11) DEFAULT NULL,
  `mana` int(11) DEFAULT NULL,
  `pvpKills` int(11) DEFAULT NULL,
  `pvpDeaths` int(11) DEFAULT NULL,
  `playerRank` int(11) DEFAULT NULL,
  `ban` int(64) DEFAULT NULL,
  `mute` int(64) DEFAULT NULL,
  `membership` int(64) DEFAULT NULL,
  `lastLogin` int(64) DEFAULT NULL,
  `guild` varchar(64) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `player_equipment`
--

CREATE TABLE `player_equipment` (
  `username` varchar(64) NOT NULL,
  `armour` varchar(64) DEFAULT NULL,
  `weapon` varchar(64) DEFAULT NULL,
  `pendant` varchar(64) DEFAULT NULL,
  `ring` varchar(64) DEFAULT NULL,
  `boots` varchar(64) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `player_inventory`
--

CREATE TABLE `player_inventory` (
  `username` varchar(64) NOT NULL,
  `ids` text CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `counts` text CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `abilities` text CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `abilityLevels` text CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `player_quests`
--

CREATE TABLE `player_quests` (
  `username` varchar(64) NOT NULL,
  `ids` text CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `stages` text CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ipbans`
--
ALTER TABLE `ipbans`
  ADD PRIMARY KEY (`ip`);

--
-- Indexes for table `player_abilities`
--
ALTER TABLE `player_abilities`
  ADD PRIMARY KEY (`username`);

--
-- Indexes for table `player_achievements`
--
ALTER TABLE `player_achievements`
  ADD PRIMARY KEY (`username`);

--
-- Indexes for table `player_bank`
--
ALTER TABLE `player_bank`
  ADD PRIMARY KEY (`username`);

--
-- Indexes for table `player_data`
--
ALTER TABLE `player_data`
  ADD PRIMARY KEY (`username`);

--
-- Indexes for table `player_equipment`
--
ALTER TABLE `player_equipment`
  ADD PRIMARY KEY (`username`);

--
-- Indexes for table `player_inventory`
--
ALTER TABLE `player_inventory`
  ADD PRIMARY KEY (`username`);

--
-- Indexes for table `player_quests`
--
ALTER TABLE `player_quests`
  ADD PRIMARY KEY (`username`);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
