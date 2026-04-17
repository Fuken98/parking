package tt.parking.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tt.parking.enums.EstadoEspacio;
import tt.parking.exception.BusinessException;
import tt.parking.model.Espacio;
import tt.parking.model.Ingreso;
import tt.parking.model.Vehiculo;
import tt.parking.repository.EspacioRepository;
import tt.parking.repository.IngresoRepository;
import tt.parking.repository.VehiculoRepository;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class IngresoService {

    // Repositorios necesarios para gestionar el movimiento completo.
    private final VehiculoRepository vehiculoRepository;
    private final EspacioRepository espacioRepository;
    private final IngresoRepository ingresoRepository;

    // Tarifa fija por hora.
    private final double TARIFA_POR_HORA = 5000;

    public List<Ingreso> listar() {
        // Lista ordenada por fecha de entrada más reciente.
        return ingresoRepository.findAllByOrderByFechaEntradaDesc();
    }

    @Transactional
    public Ingreso registrarIngreso(String placa) {

        // 1) Buscar el vehículo por placa.
        Vehiculo vehiculo = vehiculoRepository.findByPlaca(placa)
                .orElseThrow(() -> new BusinessException("Vehículo no encontrado"));

        // 2) Validar que no tenga una entrada abierta.
        ingresoRepository.findByVehiculoAndFechaSalidaIsNull(vehiculo)
                .ifPresent(i -> {
                    throw new BusinessException("El vehículo ya está dentro del parqueadero");
                });

        // 3) Buscar un espacio libre compatible con el tipo del vehículo.
        Espacio espacio = espacioRepository
                .findFirstByTipoAndEstadoOrderByNumeroAsc(vehiculo.getTipo(), EstadoEspacio.LIBRE)
                .orElseThrow(() -> new BusinessException("No hay espacios disponibles"));

        // 4) Marcar el espacio como ocupado.
        espacio.setEstado(EstadoEspacio.OCUPADO);
        espacioRepository.save(espacio);

        // 5) Crear el ingreso con fecha actual.
        Ingreso ingreso = new Ingreso();
        ingreso.setVehiculo(vehiculo);
        ingreso.setEspacio(espacio);
        ingreso.setFechaEntrada(LocalDateTime.now());

        // 6) Guardar el ingreso.
        return ingresoRepository.save(ingreso);
    }

    @Transactional
    public Ingreso registrarSalida(String placa) {

        // 1) Buscar el vehículo.
        Vehiculo vehiculo = vehiculoRepository.findByPlaca(placa)
                .orElseThrow(() -> new BusinessException("Vehículo no encontrado"));

        // 2) Buscar el ingreso que está abierto (sin fecha de salida).
        Ingreso ingreso = ingresoRepository
                .findByVehiculoAndFechaSalidaIsNull(vehiculo)
                .orElseThrow(() -> new BusinessException("El vehículo no está registrado como dentro"));

        // 3) Registrar hora de salida.
        ingreso.setFechaSalida(LocalDateTime.now());

        // 4) Calcular horas transcurridas.
        long horas = ChronoUnit.HOURS.between(
                ingreso.getFechaEntrada(),
                ingreso.getFechaSalida()
        );

        // Si sale antes de completar una hora, se cobra mínimo 1.
        if (horas == 0) {
            horas = 1;
        }

        // 5) Calcular valor a pagar.
        ingreso.setValorPagado(horas * TARIFA_POR_HORA);

        // 6) Liberar el espacio.
        Espacio espacio = ingreso.getEspacio();
        espacio.setEstado(EstadoEspacio.LIBRE);
        espacioRepository.save(espacio);

        // 7) Guardar salida y valor.
        return ingresoRepository.save(ingreso);
    }
}
