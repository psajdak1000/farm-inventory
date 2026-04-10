using InwentarzWGospodarstwie.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace InwentarzWGospodarstwie.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GospodarstwaController : ControllerBase
{
    private readonly Database _context;

    public GospodarstwaController(Database context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<GospodarstwoResponse>>> GetAll()
    {
        var farms = await _context.Gospodarstwos
            .AsNoTracking()
            .Select(g => ToResponse(g))
            .ToListAsync();

        return Ok(farms);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<GospodarstwoResponse>> GetById(int id)
    {
        var farm = await _context.Gospodarstwos
            .AsNoTracking()
            .FirstOrDefaultAsync(g => g.IdGodpodarstwa == id);

        if (farm is null)
        {
            return NotFound();
        }

        return Ok(ToResponse(farm));
    }

    [HttpPost]
    public async Task<ActionResult<GospodarstwoResponse>> Create([FromBody] GospodarstwoUpsertRequest request)
    {
        var ownerExists = await _context.Wlasciciels.AnyAsync(w => w.IdWlasciciela == request.IdWlasciciela);
        if (!ownerExists)
        {
            return BadRequest("Nie istnieje wlasciciel o podanym IdWlasciciela.");
        }

        var farm = new Gospodarstwo
        {
            Nazwa = request.Nazwa,
            Adres = request.Adres,
            Typ = request.Typ,
            Powierzchnia = request.Powierzchnia,
            IdWlasciciela = request.IdWlasciciela
        };

        _context.Gospodarstwos.Add(farm);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = farm.IdGodpodarstwa }, ToResponse(farm));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<GospodarstwoResponse>> Update(int id, [FromBody] GospodarstwoUpsertRequest request)
    {
        var farm = await _context.Gospodarstwos.FirstOrDefaultAsync(g => g.IdGodpodarstwa == id);
        if (farm is null)
        {
            return NotFound();
        }

        var ownerExists = await _context.Wlasciciels.AnyAsync(w => w.IdWlasciciela == request.IdWlasciciela);
        if (!ownerExists)
        {
            return BadRequest("Nie istnieje wlasciciel o podanym IdWlasciciela.");
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
        var farm = await _context.Gospodarstwos.FirstOrDefaultAsync(g => g.IdGodpodarstwa == id);
        if (farm is null)
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
