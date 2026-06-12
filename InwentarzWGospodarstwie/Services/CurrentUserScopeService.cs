using InwentarzWGospodarstwie.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace InwentarzWGospodarstwie.Services;

public class CurrentUserScopeService : ICurrentUserScopeService
{
    private static readonly StringComparer RoleComparer = StringComparer.OrdinalIgnoreCase;
    private readonly Database _context;

    public CurrentUserScopeService(Database context)
    {
        _context = context;
    }

    public async Task<CurrentUserScope> ResolveAsync(
        ClaimsPrincipal user,
        CancellationToken cancellationToken = default)
    {
        var isAdmin = IsAdmin(user);
        var email = ResolveEmail(user);

        if (isAdmin)
        {
            return new CurrentUserScope(true, email, null, Array.Empty<int>());
        }

        if (string.IsNullOrWhiteSpace(email))
        {
            return new CurrentUserScope(false, null, null, Array.Empty<int>());
        }

        var normalizedEmail = email.Trim();

        var owners = await _context.Wlasciciels
            .AsNoTracking()
            .Select(owner => new { owner.IdWlasciciela, owner.EMail })
            .ToListAsync(cancellationToken);

        var matchedOwner = owners.FirstOrDefault(owner =>
            string.Equals(owner.EMail?.Trim(), normalizedEmail, StringComparison.OrdinalIgnoreCase));

        if (matchedOwner is null)
        {
            return new CurrentUserScope(false, normalizedEmail, null, Array.Empty<int>());
        }

        var farmIds = await _context.Gospodarstwos
            .AsNoTracking()
            .Where(farm => farm.IdWlasciciela == matchedOwner.IdWlasciciela)
            .Select(farm => farm.IdGodpodarstwa)
            .ToListAsync(cancellationToken);

        return new CurrentUserScope(false, normalizedEmail, matchedOwner.IdWlasciciela, farmIds);
    }

    private static bool IsAdmin(ClaimsPrincipal user)
    {
        var roleClaims = user.FindAll(ClaimTypes.Role)
            .Concat(user.FindAll("role"))
            .Select(claim => claim.Value);

        return roleClaims.Any(role =>
            RoleComparer.Equals(role, "Admin") || RoleComparer.Equals(role, "Administrator"));
    }

    private static string? ResolveEmail(ClaimsPrincipal user)
    {
        var email = user.FindFirst("email")?.Value
            ?? user.FindFirst(ClaimTypes.Email)?.Value
            ?? user.FindFirst(ClaimTypes.Name)?.Value;

        return string.IsNullOrWhiteSpace(email) ? null : email.Trim();
    }
}
