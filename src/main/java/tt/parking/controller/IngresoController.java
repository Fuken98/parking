package tt.parking.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import tt.parking.model.Ingreso;
import tt.parking.service.IngresoService;

import java.util.List;

@RestController
@RequestMapping("/api/ingresos")
@RequiredArgsConstructor
@CrossOrigin("*")
public class IngresoController {

    // Servicio con la lógica de entradas y salidas.
    private final IngresoService service;

    // Lista todos los movimientos entradas/salidas
    @GetMapping
    public List<Ingreso> listar() {
        return service.listar();
    }

    // Registra la entrada de un vehículo por placa.
    @PostMapping("/entrada/{placa}")
    public Ingreso registrarEntrada(@PathVariable String placa) {
        return service.registrarIngreso(placa);
    }

    // Registra la salida de un vehículo por placa.
    @PostMapping("/salida/{placa}")
    public Ingreso registrarSalida(@PathVariable String placa) {
        return service.registrarSalida(placa);
    }
}
