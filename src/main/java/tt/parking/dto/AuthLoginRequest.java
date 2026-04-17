package tt.parking.dto;

import jakarta.validation.constraints.NotBlank;

public record AuthLoginRequest(
        @NotBlank(message = "El usuario es obligatorio")
        String username,
        @NotBlank(message = "La contrasena es obligatoria")
        String password
) {
}
