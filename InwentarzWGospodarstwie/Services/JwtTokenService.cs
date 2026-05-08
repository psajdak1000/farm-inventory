using InwentarzWGospodarstwie.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace InwentarzWGospodarstwie.Services;

public class JwtTokenService : IJwtTokenService
{
    private readonly string _issuer;
    private readonly string _audience;
    private readonly string _key;
    private readonly int _expirationMinutes;

    public JwtTokenService(IConfiguration configuration)
    {
        var jwtSection = configuration.GetSection("Jwt");

        _issuer = jwtSection["Issuer"] ?? throw new InvalidOperationException("Jwt:Issuer is missing.");
        _audience = jwtSection["Audience"] ?? throw new InvalidOperationException("Jwt:Audience is missing.");
        _key = jwtSection["Key"] ?? throw new InvalidOperationException("Jwt:Key is missing.");

        if (!int.TryParse(jwtSection["ExpirationMinutes"], out _expirationMinutes) || _expirationMinutes <= 0)
        {
            _expirationMinutes = 60;
        }
    }

    public JwtTokenResult GenerateToken(User user, string? role = null)
    {
        var roleToUse = string.IsNullOrWhiteSpace(role) ? "User" : role;

        var claims = new List<Claim>
        {
            new("userId", user.Id),
            new("email", user.Email ?? string.Empty),
            new("userName", user.UserName ?? string.Empty),
            new("role", roleToUse),
            new(ClaimTypes.Role, roleToUse)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_key));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _issuer,
            audience: _audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_expirationMinutes),
            signingCredentials: credentials);

        var tokenValue = new JwtSecurityTokenHandler().WriteToken(token);

        return new JwtTokenResult(tokenValue, _expirationMinutes);
    }
}
