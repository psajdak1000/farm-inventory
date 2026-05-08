using InwentarzWGospodarstwie.Models;

namespace InwentarzWGospodarstwie.Services;

public interface IJwtTokenService
{
    JwtTokenResult GenerateToken(User user, string? role = null);
}

public record JwtTokenResult(string AccessToken, int ExpiresInMinutes, string TokenType = "Bearer");
