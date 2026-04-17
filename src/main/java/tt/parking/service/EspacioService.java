package tt.parking.service;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tt.parking.enums.EstadoEspacio;
import tt.parking.exception.BusinessException;
import tt.parking.model.Espacio;
import tt.parking.repository.EspacioRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EspacioService {

    // Repositorio para persistir espacios.
    private final EspacioRepository repository;

    public Espacio crear(Espacio espacio) {

        // Un espacio nuevo siempre debe iniciar en LIBRE.
        if (espacio.getEstado() != EstadoEspacio.LIBRE) {
            throw new BusinessException("Un espacio nuevo debe crearse en estado LIBRE");
        }

        // Se valida que el número no exista repetido.
        repository.findByNumero(espacio.getNumero())
        .ifPresent(e -> {
            throw new BusinessException("El número de espacio ya existe");
        });

        // Si todo está biern, se guarda.
        return repository.save(espacio);
    }

    public List<Espacio> listar() {
        // Lista completa de espacios.
        return repository.findAll();
    }
}
