using InwentarzWGospodarstwie.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace InwentarzWGospodarstwie.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WlascicieleController : ControllerBase
{
    private readonly Database _context;

    public WlascicieleController(Database context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<WlascicielResponse>>> GetAll()
    {
        var owners = await _context.Wlasciciels
            .AsNoTracking()
            .Select(w => ToResponse(w))
            .ToListAsync();

        return Ok(owners);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<WlascicielResponse>> GetById(int id)
    {
        var owner = await _context.Wlasciciels
            .AsNoTracking()
            .FirstOrDefaultAsync(w => w.IdWlasciciela == id);

        if (owner is null)
        {
            return NotFound();
        }

        return Ok(ToResponse(owner));
    }

    [HttpPost]
    public async Task<ActionResult<WlascicielResponse>> Create([FromBody] WlascicielUpsertRequest request)
    {
        var owner = new Wlasciciel
        {
            Imię = request.Imie,
            Nazwisko = request.Nazwisko,
            Telefon = request.Telefon,
            EMail = request.EMail
        };

        _context.Wlasciciels.Add(owner);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = owner.IdWlasciciela }, ToResponse(owner));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<WlascicielResponse>> Update(int id, [FromBody] WlascicielUpsertRequest request)
    {
        var owner = await _context.Wlasciciels.FirstOrDefaultAsync(w => w.IdWlasciciela == id);
        if (owner is null)
        {
            return NotFound();
        }

        owner.Imię = request.Imie;
        owner.Nazwisko = request.Nazwisko;
        owner.Telefon = request.Telefon;
        owner.EMail = request.EMail;

        await _context.SaveChangesAsync();

        return Ok(ToResponse(owner));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var owner = await _context.Wlasciciels.FirstOrDefaultAsync(w => w.IdWlasciciela == id);
        if (owner is null)
        {
            return NotFound();
        }

        _context.Wlasciciels.Remove(owner);

        try
        {
            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (DbUpdateException)
        {
            return Conflict("Nie mozna usunac wlasciciela, poniewaz jest powiazany z innymi rekordami.");
        }
    }

    private static WlascicielResponse ToResponse(Wlasciciel owner) =>
        new(owner.IdWlasciciela, owner.Imię, owner.Nazwisko, owner.Telefon, owner.EMail);
}

public sealed class WlascicielUpsertRequest
{
    [Required]
    [MaxLength(50)]
    public string Imie { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Nazwisko { get; set; } = string.Empty;

    [Required]
    [MaxLength(9)]
    public string Telefon { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? EMail { get; set; }
}

public record WlascicielResponse(int IdWlasciciela, string Imie, string Nazwisko, string Telefon, string? EMail);