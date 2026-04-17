package tt.parking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import tt.parking.model.Espacio;
import tt.parking.enums.EstadoEspacio;
import tt.parking.enums.TipoVehiculo;

import jakarta.persistence.LockModeType;
import java.util.Optional;
import java.util.List;

public interface EspacioRepository extends JpaRepository<Espacio, Long> {

    Optional<Espacio> findByNumero(Integer numero);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Espacio> findFirstByTipoAndEstadoOrderByNumeroAsc(
            TipoVehiculo tipo,
            EstadoEspacio estado
    );

    List<Espacio> findByEstado(EstadoEspacio estado);
}
