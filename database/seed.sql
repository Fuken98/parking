USE parking;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE ingreso;
TRUNCATE TABLE espacio;
TRUNCATE TABLE vehiculo;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO vehiculo (placa, color, tipo) VALUES
  ('ABC123', 'Rojo', 'CARRO'),
  ('XYZ987', 'Negro', 'MOTO'),
  ('JKL456', 'Blanco', 'CARRO');

INSERT INTO espacio (numero, tipo, estado) VALUES
  (1, 'CARRO', 'OCUPADO'),
  (2, 'CARRO', 'LIBRE'),
  (3, 'MOTO', 'LIBRE'),
  (4, 'MOTO', 'LIBRE');

INSERT INTO ingreso (vehiculo_id, espacio_id, fechaEntrada, fechaSalida, valorPagado) VALUES
  (1, 1, NOW() - INTERVAL 30 MINUTE, NULL, NULL),
  (2, 3, NOW() - INTERVAL 2 HOUR, NOW() - INTERVAL 1 HOUR, 5000);