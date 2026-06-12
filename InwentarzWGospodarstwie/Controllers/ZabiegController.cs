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
public class ZabiegiController : ControllerBase
{
    private readonly Database _context;
    private readonly ICurrentUserScopeService _currentUserScopeService;

    public ZabiegiController(Database context, ICurrentUserScopeService currentUserScopeService)
    {
        _context = context;
        _currentUserScopeService = currentUserScopeService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ZabiegResponse>>> GetAll()
    {
        var scope = await _currentUserScopeService.ResolveAsync(User);

        IQueryable<Zabieg> query = _context.Zabiegs.AsNoTracking();

        if (!scope.IsAdmin)
        {
            if (scope.FarmIds.Count == 0)
            {
                return Ok(Array.Empty<ZabiegResponse>());
            }

            var allowedAnimalIdsQuery = _context.Animals
                .AsNoTracking()
                .Where(animal => scope.FarmIds.Contains(animal.FarmId))
                .Select(animal => animal.Id);

            query = query.Where(procedure => allowedAnimalIdsQuery.Contains(procedure.IdZwierzecia));
        }

        var procedures = await query
            .Select(procedure => ToResponse(procedure))
            .ToListAsync();

        return Ok(procedures);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ZabiegResponse>> GetById(int id)
    {
        var scope = await _currentUserScopeService.ResolveAsync(User);

        var procedure = await _context.Zabiegs
            .AsNoTracking()
            .FirstOrDefaultAsync(z => z.IdZabiegu == id);

        if (procedure is null)
        {
            return NotFound();
        }

        var hasAnimalAccess = await CanAccessAnimalAsync(scope, procedure.IdZwierzecia);
        if (!hasAnimalAccess)
        {
            return NotFound();
        }

        return Ok(ToResponse(procedure));
    }

    [HttpPost]
    public async Task<ActionResult<ZabiegResponse>> Create([FromBody] ZabiegUpsertRequest request)
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

        var doctorExists = await _context.Lekarzs.AnyAsync(l => l.IdLekarza == request.IdLekarza);
        if (!doctorExists)
        {
            return BadRequest("Nie istnieje lekarz o podanym IdLekarza.");
        }

        var procedure = new Zabieg
        {
            Nazwa = request.Nazwa,
            Data = request.Data,
            Opis = request.Opis,
            Koszt = request.Koszt,
            IdZwierzecia = request.IdZwierzecia,
            IdLekarza = request.IdLekarza,
        };

        _context.Zabiegs.Add(procedure);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = procedure.IdZabiegu }, ToResponse(procedure));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ZabiegResponse>> Update(int id, [FromBody] ZabiegUpsertRequest request)
    {
        var scope = await _currentUserScopeService.ResolveAsync(User);

        var procedure = await _context.Zabiegs.FirstOrDefaultAsync(z => z.IdZabiegu == id);
        if (procedure is null)
        {
            return NotFound();
        }

        var canAccessCurrentAnimal = await CanAccessAnimalAsync(scope, procedure.IdZwierzecia);
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

        var doctorExists = await _context.Lekarzs.AnyAsync(l => l.IdLekarza == request.IdLekarza);
        if (!doctorExists)
        {
            return BadRequest("Nie istnieje lekarz o podanym IdLekarza.");
        }

        procedure.Nazwa = request.Nazwa;
        procedure.Data = request.Data;
        procedure.Opis = request.Opis;
        procedure.Koszt = request.Koszt;
        procedure.IdZwierzecia = request.IdZwierzecia;
        procedure.IdLekarza = request.IdLekarza;

        await _context.SaveChangesAsync();
        return Ok(ToResponse(procedure));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var scope = await _currentUserScopeService.ResolveAsync(User);

        var procedure = await _context.Zabiegs.FirstOrDefaultAsync(z => z.IdZabiegu == id);
        if (procedure is null)
        {
            return NotFound();
        }

        var hasAnimalAccess = await CanAccessAnimalAsync(scope, procedure.IdZwierzecia);
        if (!hasAnimalAccess)
        {
            return NotFound();
        }

        _context.Zabiegs.Remove(procedure);
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

    private static ZabiegResponse ToResponse(Zabieg procedure) =>
        new(
            procedure.IdZabiegu,
            procedure.Nazwa,
            procedure.Data,
            procedure.Opis,
            procedure.Koszt,
            procedure.IdZwierzecia,
            procedure.IdLekarza);
}

public sealed class ZabiegUpsertRequest
{
    [Required]
    [MaxLength(50)]
    public string Nazwa { get; set; } = string.Empty;

    public DateOnly Data { get; set; }

    [MaxLength(300)]
    public string? Opis { get; set; }

    [Range(typeof(decimal), "0", "99999999")]
    public decimal Koszt { get; set; }

    [Range(1, int.MaxValue)]
    public int IdZwierzecia { get; set; }

    [Range(1, int.MaxValue)]
    public int IdLekarza { get; set; }
}

public record ZabiegResponse(
    int IdZabiegu,
    string Nazwa,
    DateOnly Data,
    string? Opis,
    decimal Koszt,
    int IdZwierzecia,
    int IdLekarza);
