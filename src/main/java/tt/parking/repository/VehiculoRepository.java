package tt.parking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tt.parking.model.Vehiculo;

import java.util.Optional;

public interface VehiculoRepository extends JpaRepository<Vehiculo, Long> {

    Optional<Vehiculo> findByPlaca(String placa);

}
