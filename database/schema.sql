CREATE DATABASE IF NOT EXISTS parking
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE parking;

CREATE TABLE vehiculo (
  id BIGINT NOT NULL AUTO_INCREMENT,
  color VARCHAR(255) DEFAULT NULL,
  placa VARCHAR(255) NOT NULL,
  tipo ENUM('CARRO','MOTO') NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_vehiculo_placa (placa)
) ENGINE=InnoDB;

CREATE TABLE espacio (
  id BIGINT NOT NULL AUTO_INCREMENT,
  estado ENUM('LIBRE','OCUPADO') NOT NULL,
  numero INT NOT NULL,
  tipo ENUM('CARRO','MOTO') NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_espacio_numero (numero)
) ENGINE=InnoDB;

CREATE TABLE ingreso (
  id BIGINT NOT NULL AUTO_INCREMENT,
  fecha_entrada DATETIME(6) NOT NULL,
  fecha_salida DATETIME(6) DEFAULT NULL,
  valor_pagado DOUBLE DEFAULT NULL,
  espacio_id BIGINT NOT NULL,
  vehiculo_id BIGINT NOT NULL,
  PRIMARY KEY (id),
  KEY idx_ingreso_espacio (espacio_id),
  KEY idx_ingreso_vehiculo (vehiculo_id),
  CONSTRAINT fk_ingreso_espacio 
    FOREIGN KEY (espacio_id) REFERENCES espacio (id),
  CONSTRAINT fk_ingreso_vehiculo 
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculo (id)
) ENGINE=InnoDB;
