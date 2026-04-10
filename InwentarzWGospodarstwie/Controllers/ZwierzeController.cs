using InwentarzWGospodarstwie.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace InwentarzWGospodarstwie.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ZwierzetaController : ControllerBase
{
    private readonly Database _context;

    public ZwierzetaController(Database context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ZwierzeResponse>>> GetAll()
    {
        var animals = await _context.Zwierzes
            .AsNoTracking()
            .Select(z => ToResponse(z))
            .ToListAsync();

        return Ok(animals);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ZwierzeResponse>> GetById(int id)
    {
        var animal = await _context.Zwierzes
            .AsNoTracking()
            .FirstOrDefaultAsync(z => z.IdZwierzecia == id);

        if (animal is null)
        {
            return NotFound();
        }

        return Ok(ToResponse(animal));
    }

    [HttpPost]
    public async Task<ActionResult<ZwierzeResponse>> Create([FromBody] ZwierzeUpsertRequest request)
    {
        var farmExists = await _context.Gospodarstwos.AnyAsync(g => g.IdGodpodarstwa == request.IdGospodarstwa);
        if (!farmExists)
        {
            return BadRequest("Nie istnieje gospodarstwo o podanym IdGospodarstwa.");
        }

        var animal = new Zwierze
        {
            IdentyfikatorKolczyka = request.IdentyfikatorKolczyka,
            Rasa = request.Rasa,
            Wiek = request.Wiek,
            Płeć = request.Plec,
            Waga = request.Waga,
            DataZakupuUrodzenia = request.DataZakupuUrodzenia,
            CenaZakupu = request.CenaZakupu,
            DataSprzedażyŚmierci = request.DataSprzedazySmierci,
            CenaSprzedaży = request.CenaSprzedazy,
            IdGospodarstwa = request.IdGospodarstwa
        };

        _context.Zwierzes.Add(animal);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = animal.IdZwierzecia }, ToResponse(animal));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ZwierzeResponse>> Update(int id, [FromBody] ZwierzeUpsertRequest request)
    {
        var animal = await _context.Zwierzes.FirstOrDefaultAsync(z => z.IdZwierzecia == id);
        if (animal is null)
        {
            return NotFound();
        }

        var farmExists = await _context.Gospodarstwos.AnyAsync(g => g.IdGodpodarstwa == request.IdGospodarstwa);
        if (!farmExists)
        {
            return BadRequest("Nie istnieje gospodarstwo o podanym IdGospodarstwa.");
        }

        animal.IdentyfikatorKolczyka = request.IdentyfikatorKolczyka;
        animal.Rasa = request.Rasa;
        animal.Wiek = request.Wiek;
        animal.Płeć = request.Plec;
        animal.Waga = request.Waga;
        animal.DataZakupuUrodzenia = request.DataZakupuUrodzenia;
        animal.CenaZakupu = request.CenaZakupu;
        animal.DataSprzedażyŚmierci = request.DataSprzedazySmierci;
        animal.CenaSprzedaży = request.CenaSprzedazy;
        animal.IdGospodarstwa = request.IdGospodarstwa;

        await _context.SaveChangesAsync();
        return Ok(ToResponse(animal));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var animal = await _context.Zwierzes.FirstOrDefaultAsync(z => z.IdZwierzecia == id);
        if (animal is null)
        {
            return NotFound();
        }

        _context.Zwierzes.Remove(animal);

        try
        {
            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (DbUpdateException)
        {
            return Conflict("Nie mozna usunac zwierzecia, poniewaz jest powiazane z innymi rekordami.");
        }
    }

    private static ZwierzeResponse ToResponse(Zwierze animal) =>
        new(
            animal.IdZwierzecia,
            animal.IdentyfikatorKolczyka,
            animal.Rasa,
            animal.Wiek,
            animal.Płeć,
            animal.Waga,
            animal.DataZakupuUrodzenia,
            animal.CenaZakupu,
            animal.DataSprzedażyŚmierci,
            animal.CenaSprzedaży,
            animal.IdGospodarstwa);
}

public sealed class ZwierzeUpsertRequest
{
    public int IdentyfikatorKolczyka { get; set; }

    [Required]
    [MaxLength(50)]
    public string Rasa { get; set; } = string.Empty;

    public int? Wiek { get; set; }

    [Required]
    [MaxLength(10)]
    public string Plec { get; set; } = string.Empty;

    public float Waga { get; set; }

    public DateOnly DataZakupuUrodzenia { get; set; }

    public decimal? CenaZakupu { get; set; }

    public DateOnly? DataSprzedazySmierci { get; set; }

    public decimal? CenaSprzedazy { get; set; }

    [Range(1, int.MaxValue)]
    public int IdGospodarstwa { get; set; }
}

public record ZwierzeResponse(
    int IdZwierzecia,
    int IdentyfikatorKolczyka,
    string Rasa,
    int? Wiek,
    string Plec,
    float Waga,
    DateOnly DataZakupuUrodzenia,
    decimal? CenaZakupu,
    DateOnly? DataSprzedazySmierci,
    decimal? CenaSprzedazy,
    int IdGospodarstwa);
