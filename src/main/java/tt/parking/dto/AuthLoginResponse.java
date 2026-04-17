package tt.parking.dto;

public record AuthLoginResponse(
        String token,
        String username
) {
}
