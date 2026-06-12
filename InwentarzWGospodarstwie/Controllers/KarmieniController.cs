using InwentarzWGospodarstwie.Models;
using InwentarzWGospodarstwie.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace InwentarzWGospodarstwie.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class KarmieniaController : ControllerBase
{
    private readonly Database _context;
    private readonly ICurrentUserScopeService _currentUserScopeService;

    public KarmieniaController(Database context, ICurrentUserScopeService currentUserScopeService)
    {
        _context = context;
        _currentUserScopeService = currentUserScopeService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<KarmienieResponse>>> GetAll()
    {
        var scope = await _currentUserScopeService.ResolveAsync(User);

        IQueryable<Karmienie> query = _context.Karmienies.AsNoTracking();

        if (!scope.IsAdmin)
        {
            if (scope.FarmIds.Count == 0)
            {
                return Ok(Array.Empty<KarmienieResponse>());
            }

            var allowedAnimalIdsQuery = _context.Animals
                .AsNoTracking()
                .Where(animal => scope.FarmIds.Contains(animal.FarmId))
                .Select(animal => animal.Id);

            query = query.Where(feeding => allowedAnimalIdsQuery.Contains(feeding.IdZwierzecia));
        }

        var feedings = await query
            .Select(feeding => ToResponse(feeding))
            .ToListAsync();

        return Ok(feedings);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<KarmienieResponse>> GetById(int id)
    {
        var scope = await _currentUserScopeService.ResolveAsync(User);

        var feeding = await _context.Karmienies
            .AsNoTracking()
            .FirstOrDefaultAsync(k => k.IdKarmienia == id);

        if (feeding is null)
        {
            return NotFound();
        }

        var hasAnimalAccess = await CanAccessAnimalAsync(scope, feeding.IdZwierzecia);
        if (!hasAnimalAccess)
        {
            return NotFound();
        }

        return Ok(ToResponse(feeding));
    }

    [HttpPost]
    public async Task<ActionResult<KarmienieResponse>> Create([FromBody] KarmienieUpsertRequest request)
    {
        var scope = await _currentUserScopeService.ResolveAsync(User);

        var animal = await _context.Animals
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == request.IdZwierzecia);

        if (animal is null)
        {
            return BadRequest("Nie istnieje zwierze o podanym IdZwierzecia.");
        }

        if (!scope.CanAccessFarm(animal.FarmId))
        {
            return StatusCode(403, "Nie masz dostepu do wskazanego zwierzecia.");
        }

        var feeding = new Karmienie
        {
            Nazwa = request.Nazwa,
            Rodzaj = request.Rodzaj,
            Ilość = request.Ilosc,
            Cena = request.Cena,
            DataZakupu = request.DataZakupu,
            IdZwierzecia = request.IdZwierzecia,
        };

        _context.Karmienies.Add(feeding);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = feeding.IdKarmienia }, ToResponse(feeding));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<KarmienieResponse>> Update(int id, [FromBody] KarmienieUpsertRequest request)
    {
        var scope = await _currentUserScopeService.ResolveAsync(User);

        var feeding = await _context.Karmienies.FirstOrDefaultAsync(k => k.IdKarmienia == id);
        if (feeding is null)
        {
            return NotFound();
        }

        var canAccessCurrentAnimal = await CanAccessAnimalAsync(scope, feeding.IdZwierzecia);
        if (!canAccessCurrentAnimal)
        {
            return NotFound();
        }

        var animal = await _context.Animals
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == request.IdZwierzecia);

        if (animal is null)
        {
            return BadRequest("Nie istnieje zwierze o podanym IdZwierzecia.");
        }

        if (!scope.CanAccessFarm(animal.FarmId))
        {
            return StatusCode(403, "Nie masz dostepu do wskazanego zwierzecia.");
        }

        feeding.Nazwa = request.Nazwa;
        feeding.Rodzaj = request.Rodzaj;
        feeding.Ilość = request.Ilosc;
        feeding.Cena = request.Cena;
        feeding.DataZakupu = request.DataZakupu;
        feeding.IdZwierzecia = request.IdZwierzecia;

        await _context.SaveChangesAsync();
        return Ok(ToResponse(feeding));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var scope = await _currentUserScopeService.ResolveAsync(User);

        var feeding = await _context.Karmienies.FirstOrDefaultAsync(k => k.IdKarmienia == id);
        if (feeding is null)
        {
            return NotFound();
        }

        var hasAnimalAccess = await CanAccessAnimalAsync(scope, feeding.IdZwierzecia);
        if (!hasAnimalAccess)
        {
            return NotFound();
        }

        _context.Karmienies.Remove(feeding);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    private async Task<bool> CanAccessAnimalAsync(CurrentUserScope scope, int animalId)
    {
        if (scope.IsAdmin)
        {
            return true;
        }

        if (scope.FarmIds.Count == 0)
        {
            return false;
        }

        var animalFarmId = await _context.Animals
            .AsNoTracking()
            .Where(animal => animal.Id == animalId)
            .Select(animal => (int?)animal.FarmId)
            .FirstOrDefaultAsync();

        return animalFarmId.HasValue && scope.FarmIds.Contains(animalFarmId.Value);
    }

    private static KarmienieResponse ToResponse(Karmienie feeding) =>
        new(
            feeding.IdKarmienia,
            feeding.Nazwa,
            feeding.Rodzaj,
            feeding.Ilość,
            feeding.Cena,
            feeding.DataZakupu,
            feeding.IdZwierzecia);
}

public sealed class KarmienieUpsertRequest
{
    [Required]
    [MaxLength(50)]
    public string Nazwa { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? Rodzaj { get; set; }

    [Required]
    [MaxLength(50)]
    public string Ilosc { get; set; } = string.Empty;

    [Range(typeof(decimal), "0", "99999999")]
    public decimal Cena { get; set; }

    public DateOnly DataZakupu { get; set; }

    [Range(1, int.MaxValue)]
    public int IdZwierzecia { get; set; }
}

public record KarmienieResponse(
    int IdKarmienia,
    string Nazwa,
    string? Rodzaj,
    string Ilosc,
    decimal Cena,
    DateOnly DataZakupu,
    int IdZwierzecia);
