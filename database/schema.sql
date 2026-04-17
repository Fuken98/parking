CREATE DATABASE IF NOT EXISTS parking
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE parking;

CREATE TABLE IF NOT EXISTS vehiculo (
  id BIGINT NOT NULL AUTO_INCREMENT,
  placa VARCHAR(255) NOT NULL,
  color VARCHAR(255) NULL,
  tipo VARCHAR(20) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_vehiculo_placa (placa),
  CONSTRAINT ck_vehiculo_tipo CHECK (tipo IN ('CARRO', 'MOTO'))
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS espacio (
  id BIGINT NOT NULL AUTO_INCREMENT,
  numero INT NOT NULL,
  tipo VARCHAR(20) NOT NULL,
  estado VARCHAR(20) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_espacio_numero (numero),
  CONSTRAINT ck_espacio_tipo CHECK (tipo IN ('CARRO', 'MOTO')),
  CONSTRAINT ck_espacio_estado CHECK (estado IN ('LIBRE', 'OCUPADO'))
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ingreso (
  id BIGINT NOT NULL AUTO_INCREMENT,
  vehiculo_id BIGINT NOT NULL,
  espacio_id BIGINT NOT NULL,
  fechaEntrada DATETIME NOT NULL,
  fechaSalida DATETIME NULL,
  valorPagado DOUBLE NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_ingreso_vehiculo FOREIGN KEY (vehiculo_id) REFERENCES vehiculo (id),
  CONSTRAINT fk_ingreso_espacio FOREIGN KEY (espacio_id) REFERENCES espacio (id)
) ENGINE=InnoDB;