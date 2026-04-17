package tt.parking.service;

import org.springframework.stereotype.Service;
import tt.parking.config.AppAuthProperties;
import tt.parking.dto.AuthLoginRequest;
import tt.parking.dto.AuthLoginResponse;
import tt.parking.exception.BusinessException;

import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {

    // Prefijo esperado para el token tipo Bearer.
    private static final String TOKEN_PREFIX = "Bearer ";

    // Usuario/clave configurados en properties.
    private final String configuredUsername;
    private final String configuredPassword;
    // Lista en memoria de tokens activos.
    private final Set<String> activeTokens = ConcurrentHashMap.newKeySet();

    public AuthService(AppAuthProperties authProperties) {
        // Se cargan las credenciales desde configuración.
        this.configuredUsername = authProperties.getUsername();
        this.configuredPassword = authProperties.getPassword();
    }

    public AuthLoginResponse login(AuthLoginRequest request) {
        // Normalizamos usuario y tomamos password tal cual
        String username = request.username().trim();
        String password = request.password();

        // Si no coincide, se lanza error.
        if (!configuredUsername.equals(username) || !configuredPassword.equals(password)) {
            throw new BusinessException("Usuario o contrasena incorrectos");
        }

        // Si sale bien, se crea token nuevo y se guarda como activo.
        String token = UUID.randomUUID().toString();
        activeTokens.add(token);
        return new AuthLoginResponse(token, username);
    }

    public void logout(String authorizationHeader) {
        // En logout se remueve el token actual de la lista activa.
        activeTokens.remove(extractToken(authorizationHeader));
    }

    public boolean isAuthorized(String authorizationHeader) {
        // Si no viene header, no está autorizado.
        if (authorizationHeader == null || authorizationHeader.isBlank()) {
            return false;
        }
        // Se valida si el token existe en memoria.
        return activeTokens.contains(extractToken(authorizationHeader));
    }

    private String extractToken(String authorizationHeader) {
        // Si viene con Bearer, quitamos el prefijo.
        if (authorizationHeader.startsWith(TOKEN_PREFIX)) {
            return authorizationHeader.substring(TOKEN_PREFIX.length()).trim();
        }
        // Si no, usamos el valor directo.
        return authorizationHeader.trim();
    }
}
