using InwentarzWGospodarstwie.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace InwentarzWGospodarstwie.Controllers;

[ApiController]
[Route("api/[controller]")]
public class KarmieniaController : ControllerBase
{
    private readonly Database _context;

    public KarmieniaController(Database context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<KarmienieResponse>>> GetAll()
    {
        var feedings = await _context.Karmienies
            .AsNoTracking()
            .Select(k => ToResponse(k))
            .ToListAsync();

        return Ok(feedings);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<KarmienieResponse>> GetById(int id)
    {
        var feeding = await _context.Karmienies
            .AsNoTracking()
            .FirstOrDefaultAsync(k => k.IdKarmienia == id);

        if (feeding is null)
        {
            return NotFound();
        }

        return Ok(ToResponse(feeding));
    }

    [HttpPost]
    public async Task<ActionResult<KarmienieResponse>> Create([FromBody] KarmienieUpsertRequest request)
    {
        var animalExists = await _context.Animals.AnyAsync(a => a.Id == request.IdZwierzecia);
        if (!animalExists)
        {
            return BadRequest("Nie istnieje zwierze o podanym IdZwierzecia.");
        }

        var feeding = new Karmienie
        {
            Nazwa = request.Nazwa,
            Rodzaj = request.Rodzaj,
            Ilość = request.Ilosc,
            Cena = request.Cena,
            DataZakupu = request.DataZakupu,
            IdZwierzecia = request.IdZwierzecia
        };

        _context.Karmienies.Add(feeding);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = feeding.IdKarmienia }, ToResponse(feeding));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<KarmienieResponse>> Update(int id, [FromBody] KarmienieUpsertRequest request)
    {
        var feeding = await _context.Karmienies.FirstOrDefaultAsync(k => k.IdKarmienia == id);
        if (feeding is null)
        {
            return NotFound();
        }

        var animalExists = await _context.Animals.AnyAsync(a => a.Id == request.IdZwierzecia);
        if (!animalExists)
        {
            return BadRequest("Nie istnieje zwierze o podanym IdZwierzecia.");
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
        var feeding = await _context.Karmienies.FirstOrDefaultAsync(k => k.IdKarmienia == id);
        if (feeding is null)
        {
            return NotFound();
        }

        _context.Karmienies.Remove(feeding);
        await _context.SaveChangesAsync();
        return NoContent();
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
