-- SafeHer Database Schema
-- Run this in MySQL to create the database and tables

CREATE DATABASE IF NOT EXISTS safeher_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE safeher_db;

-- Users
CREATE TABLE IF NOT EXISTS users (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Locations
CREATE TABLE IF NOT EXISTS locations (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    latitude   DOUBLE NOT NULL,
    longitude  DOUBLE NOT NULL,
    area_name  VARCHAR(255)
);

-- Crime data
CREATE TABLE IF NOT EXISTS crime_data (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    location_id  INT NOT NULL,
    crime_index  DOUBLE NOT NULL COMMENT '0=safe 10=dangerous',
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
);

-- Lighting data
CREATE TABLE IF NOT EXISTS lighting_data (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    location_id     INT NOT NULL,
    lighting_score  DOUBLE NOT NULL COMMENT '0=dark 10=well lit',
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
);

-- Traffic data
CREATE TABLE IF NOT EXISTS traffic_data (
    id                     INT AUTO_INCREMENT PRIMARY KEY,
    location_id            INT NOT NULL,
    traffic_activity_score DOUBLE NOT NULL COMMENT '0=empty 10=busy',
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
);

-- Police stations
CREATE TABLE IF NOT EXISTS police_stations (
    id        INT AUTO_INCREMENT PRIMARY KEY,
    name      VARCHAR(255) NOT NULL,
    latitude  DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL
);

-- Bus stops
CREATE TABLE IF NOT EXISTS bus_stops (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    name           VARCHAR(255) NOT NULL,
    latitude       DOUBLE NOT NULL,
    longitude      DOUBLE NOT NULL,
    lighting_score DOUBLE DEFAULT 5.0,
    crowd_level    VARCHAR(50) DEFAULT 'moderate'
);

-- Safety reports (crowdsourced)
CREATE TABLE IF NOT EXISTS safety_reports (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    latitude    DOUBLE NOT NULL,
    longitude   DOUBLE NOT NULL,
    report_type VARCHAR(100) NOT NULL,
    description TEXT,
    timestamp   DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_id     INT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Route safety cache
CREATE TABLE IF NOT EXISTS route_safety (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    route_id      VARCHAR(100) NOT NULL,
    safety_score  DOUBLE,
    distance_km   DOUBLE,
    time_minutes  DOUBLE
);

-- Indexes for performance
CREATE INDEX idx_locations_coords ON locations(latitude, longitude);
CREATE INDEX idx_reports_timestamp ON safety_reports(timestamp);
CREATE INDEX idx_reports_coords ON safety_reports(latitude, longitude);
