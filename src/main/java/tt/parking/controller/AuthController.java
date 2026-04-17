package tt.parking.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tt.parking.dto.AuthLoginRequest;
import tt.parking.dto.AuthLoginResponse;
import tt.parking.service.AuthService;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    // Servicio que tiene la lógica de login y logout.
    private final AuthService authService;

    // Endpoint para iniciar sesión.
    @PostMapping("/login")
    public AuthLoginResponse login(@Valid @RequestBody AuthLoginRequest request) {
        // Se delega todo al servicio para mantener el controller simple.
        return authService.login(request);
    }

    // Endpoint para cerrar sesión.
    @PostMapping("/logout")
    public Map<String, String> logout(HttpServletRequest request) {
        // Se toma el token desde el header Authorization.
        authService.logout(request.getHeader("Authorization"));
        return Map.of("message", "Sesion cerrada");
    }
}
