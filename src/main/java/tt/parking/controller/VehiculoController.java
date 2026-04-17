package tt.parking.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import tt.parking.model.Vehiculo;
import tt.parking.service.VehiculoService;

import java.util.List;

@RestController
@RequestMapping("/api/vehiculos")
@RequiredArgsConstructor
@CrossOrigin("*")
public class VehiculoController {

    // Servicio con la lógica de negocio de vehículos.
    private final VehiculoService service;

    // Crea un vehículo nuevo.
    @PostMapping
    public Vehiculo crear(@Valid @RequestBody Vehiculo vehiculo) {
        return service.crear(vehiculo);
    }

    // Lista todos los vehículos.
    @GetMapping
    public List<Vehiculo> listar() {
        return service.listar();
    }
}
