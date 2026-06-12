using InwentarzWGospodarstwie.Models;
using InwentarzWGospodarstwie.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;

namespace InwentarzWGospodarstwie.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly Database _context;
    private readonly IPasswordService _passwordService;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly ICurrentUserScopeService _currentUserScopeService;

    public AuthController(
        Database context,
        IPasswordService passwordService,
        IJwtTokenService jwtTokenService,
        ICurrentUserScopeService currentUserScopeService)
    {
        _context = context;
        _passwordService = passwordService;
        _jwtTokenService = jwtTokenService;
        _currentUserScopeService = currentUserScopeService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthUserResponse>> Register([FromBody] RegisterRequest request)
    {
        var email = request.Email.Trim();

        var emailExists = await _context.Users.AnyAsync(u => u.Email == email);
        if (emailExists)
        {
            return Conflict("User with the specified email already exists.");
        }

        var user = new User
        {
            UserName = email,
            Email = email,
            PasswordHash = _passwordService.HashPassword(request.Password)
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok(new AuthUserResponse(user.Id, user.UserName ?? string.Empty, user.Email ?? string.Empty));
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginSuccessResponse>> Login([FromBody] LoginRequest request)
    {
        var email = request.Email.Trim();

        var user = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Email == email);

        if (user is null || string.IsNullOrWhiteSpace(user.PasswordHash))
        {
            return Unauthorized("Invalid email or password.");
        }

        var isValidPassword = _passwordService.VerifyPassword(request.Password, user.PasswordHash);
        if (!isValidPassword)
        {
            return Unauthorized("Invalid email or password.");
        }

        var role = string.Equals(user.Email, "adminadmin@system.pl", StringComparison.OrdinalIgnoreCase)
            ? "Admin"
            : "User";

        var roles = new[] { role };
        var tokenResult = _jwtTokenService.GenerateToken(user, role);

        var userResponse = new LoginUserResponse(
            user.Id,
            user.UserName ?? string.Empty,
            user.Email ?? string.Empty,
            roles);

        return Ok(new LoginSuccessResponse(
            "Login successful.",
            tokenResult.TokenType,
            tokenResult.AccessToken,
            tokenResult.ExpiresInMinutes,
            userResponse));
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<AuthMeResponse>> Me()
    {
        var userId = User.FindFirst("userId")?.Value ?? string.Empty;
        var userName = User.FindFirst("userName")?.Value ?? User.Identity?.Name ?? string.Empty;
        var email = User.FindFirst("email")?.Value ?? User.FindFirst(ClaimTypes.Email)?.Value ?? string.Empty;
        var scope = await _currentUserScopeService.ResolveAsync(User);

        var roles = User.FindAll(ClaimTypes.Role).Select(role => role.Value).ToArray();
        if (roles.Length == 0)
        {
            roles = User.FindAll("role").Select(role => role.Value).ToArray();
        }

        return Ok(new AuthMeResponse(
            "Authorized access.",
            userId,
            userName,
            email,
            roles,
            scope.OwnerId,
            scope.FarmIds));
    }
}

public sealed class RegisterRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(8)]
    public string Password { get; set; } = string.Empty;
}

public sealed class LoginRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}

public record AuthUserResponse(string UserId, string UserName, string Email);
public record LoginUserResponse(string Id, string UserName, string Email, string[] Roles);
public record LoginSuccessResponse(
    string Message,
    string TokenType,
    string AccessToken,
    int ExpiresInMinutes,
    LoginUserResponse User);
public record AuthMeResponse(
    string Message,
    string UserId,
    string UserName,
    string Email,
    string[] Roles,
    int? WlascicielId,
    IReadOnlyList<int> FarmIds);
