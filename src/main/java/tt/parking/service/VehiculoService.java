package tt.parking.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import tt.parking.exception.BusinessException;
import tt.parking.model.Vehiculo;
import tt.parking.repository.VehiculoRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VehiculoService {

    // Repositorio para operaciones de base de datos de vehículo.
    private final VehiculoRepository repository;

    public Vehiculo crear(Vehiculo vehiculo) {

        // Se valida que no exista la misma placa.
        repository.findByPlaca(vehiculo.getPlaca())
                .ifPresent(v -> {
                    throw new BusinessException("La placa ya está registrada");
                });

        // Si la placa es nueva, se guarda el vehículo.
        return repository.save(vehiculo);
    }

    public List<Vehiculo> listar() {
        // Retorna todos los vehículos de la tabla.
        return repository.findAll();
    }
}
