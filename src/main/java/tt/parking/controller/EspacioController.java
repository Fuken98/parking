package tt.parking.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import tt.parking.model.Espacio;
import tt.parking.service.EspacioService;

import java.util.List;

@RestController
@RequestMapping("/api/espacios")
@RequiredArgsConstructor
@CrossOrigin("*")
public class EspacioController {

    // Servicio que maneja la lógica de espacios.
    private final EspacioService service;

    // Crea un nuevo espacio de parqueo.
    @PostMapping
    public Espacio crear(@Valid @RequestBody Espacio espacio) {
        return service.crear(espacio);
    }

    // Retorna la lista de espacios.
    @GetMapping
    public List<Espacio> listar() {
        return service.listar();
    }
}
