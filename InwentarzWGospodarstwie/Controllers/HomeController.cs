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
public class GospodarstwaController : ControllerBase
{
    private readonly Database _context;
    private readonly ICurrentUserScopeService _currentUserScopeService;

    public GospodarstwaController(Database context, ICurrentUserScopeService currentUserScopeService)
    {
        _context = context;
        _currentUserScopeService = currentUserScopeService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<GospodarstwoResponse>>> GetAll()
    {
        var scope = await _currentUserScopeService.ResolveAsync(User);

        IQueryable<Gospodarstwo> query = _context.Gospodarstwos.AsNoTracking();

        if (!scope.IsAdmin)
        {
            if (scope.OwnerId is null)
            {
                return Ok(Array.Empty<GospodarstwoResponse>());
            }

            query = query.Where(farm => farm.IdWlasciciela == scope.OwnerId.Value);
        }

        var farms = await query
            .Select(farm => ToResponse(farm))
            .ToListAsync();

        return Ok(farms);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<GospodarstwoResponse>> GetById(int id)
    {
        var scope = await _currentUserScopeService.ResolveAsync(User);

        var farm = await _context.Gospodarstwos
            .AsNoTracking()
            .FirstOrDefaultAsync(g => g.IdGodpodarstwa == id);

        if (farm is null)
        {
            return NotFound();
        }

        if (!scope.CanAccessFarm(farm.IdGodpodarstwa))
        {
            return NotFound();
        }

        return Ok(ToResponse(farm));
    }

    [HttpPost]
    public async Task<ActionResult<GospodarstwoResponse>> Create([FromBody] GospodarstwoUpsertRequest request)
    {
        var scope = await _currentUserScopeService.ResolveAsync(User);

        var ownerExists = await _context.Wlasciciels.AnyAsync(owner => owner.IdWlasciciela == request.IdWlasciciela);
        if (!ownerExists)
        {
            return BadRequest("Nie istnieje wlasciciel o podanym IdWlasciciela.");
        }

        if (!scope.IsAdmin)
        {
            if (scope.OwnerId is null || request.IdWlasciciela != scope.OwnerId.Value)
            {
                return StatusCode(403, "Nie masz dostepu do wskazanego wlasciciela.");
            }
        }

        var farm = new Gospodarstwo
        {
            Nazwa = request.Nazwa,
            Adres = request.Adres,
            Typ = request.Typ,
            Powierzchnia = request.Powierzchnia,
            IdWlasciciela = request.IdWlasciciela,
        };

        _context.Gospodarstwos.Add(farm);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = farm.IdGodpodarstwa }, ToResponse(farm));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<GospodarstwoResponse>> Update(int id, [FromBody] GospodarstwoUpsertRequest request)
    {
        var scope = await _currentUserScopeService.ResolveAsync(User);

        var farm = await _context.Gospodarstwos.FirstOrDefaultAsync(g => g.IdGodpodarstwa == id);
        if (farm is null)
        {
            return NotFound();
        }

        if (!scope.CanAccessFarm(farm.IdGodpodarstwa))
        {
            return NotFound();
        }

        var ownerExists = await _context.Wlasciciels.AnyAsync(owner => owner.IdWlasciciela == request.IdWlasciciela);
        if (!ownerExists)
        {
            return BadRequest("Nie istnieje wlasciciel o podanym IdWlasciciela.");
        }

        if (!scope.IsAdmin)
        {
            if (scope.OwnerId is null || request.IdWlasciciela != scope.OwnerId.Value)
            {
                return StatusCode(403, "Nie masz dostepu do wskazanego wlasciciela.");
            }
        }

        farm.Nazwa = request.Nazwa;
        farm.Adres = request.Adres;
        farm.Typ = request.Typ;
        farm.Powierzchnia = request.Powierzchnia;
        farm.IdWlasciciela = request.IdWlasciciela;

        await _context.SaveChangesAsync();
        return Ok(ToResponse(farm));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var scope = await _currentUserScopeService.ResolveAsync(User);

        var farm = await _context.Gospodarstwos.FirstOrDefaultAsync(g => g.IdGodpodarstwa == id);
        if (farm is null)
        {
            return NotFound();
        }

        if (!scope.CanAccessFarm(farm.IdGodpodarstwa))
        {
            return NotFound();
        }

        _context.Gospodarstwos.Remove(farm);

        try
        {
            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (DbUpdateException)
        {
            return Conflict("Nie mozna usunac gospodarstwa, poniewaz jest powiazane z innymi rekordami.");
        }
    }

    private static GospodarstwoResponse ToResponse(Gospodarstwo farm) =>
        new(farm.IdGodpodarstwa, farm.Nazwa, farm.Adres, farm.Typ, farm.Powierzchnia, farm.IdWlasciciela);
}

public sealed class GospodarstwoUpsertRequest
{
    [Required]
    [MaxLength(100)]
    public string Nazwa { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Adres { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Typ { get; set; } = string.Empty;

    [Range(typeof(decimal), "0", "99999999")]
    public decimal Powierzchnia { get; set; }

    [Range(1, int.MaxValue)]
    public int IdWlasciciela { get; set; }
}

public record GospodarstwoResponse(
    int IdGospodarstwa,
    string Nazwa,
    string Adres,
    string Typ,
    decimal Powierzchnia,
    int IdWlasciciela);
