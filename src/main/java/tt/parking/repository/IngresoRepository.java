package tt.parking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tt.parking.model.Ingreso;
import tt.parking.model.Vehiculo;

import java.util.List;
import java.util.Optional;

public interface IngresoRepository extends JpaRepository<Ingreso, Long> {

    Optional<Ingreso> findByVehiculoAndFechaSalidaIsNull(Vehiculo vehiculo);

    List<Ingreso> findAllByOrderByFechaEntradaDesc();
}
