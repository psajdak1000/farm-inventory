using System.Security.Claims;

namespace InwentarzWGospodarstwie.Services;

public interface ICurrentUserScopeService
{
    Task<CurrentUserScope> ResolveAsync(ClaimsPrincipal user, CancellationToken cancellationToken = default);
}

public sealed record CurrentUserScope(
    bool IsAdmin,
    string? Email,
    int? OwnerId,
    IReadOnlyList<int> FarmIds)
{
    public bool CanAccessFarm(int farmId)
    {
        if (IsAdmin)
        {
            return true;
        }

        return FarmIds.Contains(farmId);
    }
}
