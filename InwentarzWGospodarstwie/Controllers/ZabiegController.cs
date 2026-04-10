using InwentarzWGospodarstwie.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace InwentarzWGospodarstwie.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ZabiegiController : ControllerBase
{
    private readonly Database _context;

    public ZabiegiController(Database context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ZabiegResponse>>> GetAll()
    {
        var procedures = await _context.Zabiegs
            .AsNoTracking()
            .Select(z => ToResponse(z))
            .ToListAsync();

        return Ok(procedures);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ZabiegResponse>> GetById(int id)
    {
        var procedure = await _context.Zabiegs
            .AsNoTracking()
            .FirstOrDefaultAsync(z => z.IdZabiegu == id);

        if (procedure is null)
        {
            return NotFound();
        }

        return Ok(ToResponse(procedure));
    }

    [HttpPost]
    public async Task<ActionResult<ZabiegResponse>> Create([FromBody] ZabiegUpsertRequest request)
    {
        var animalExists = await _context.Zwierzes.AnyAsync(z => z.IdZwierzecia == request.IdZwierzecia);
        if (!animalExists)
        {
            return BadRequest("Nie istnieje zwierze o podanym IdZwierzecia.");
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
            IdLekarza = request.IdLekarza
        };

        _context.Zabiegs.Add(procedure);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = procedure.IdZabiegu }, ToResponse(procedure));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ZabiegResponse>> Update(int id, [FromBody] ZabiegUpsertRequest request)
    {
        var procedure = await _context.Zabiegs.FirstOrDefaultAsync(z => z.IdZabiegu == id);
        if (procedure is null)
        {
            return NotFound();
        }

        var animalExists = await _context.Zwierzes.AnyAsync(z => z.IdZwierzecia == request.IdZwierzecia);
        if (!animalExists)
        {
            return BadRequest("Nie istnieje zwierze o podanym IdZwierzecia.");
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
        var procedure = await _context.Zabiegs.FirstOrDefaultAsync(z => z.IdZabiegu == id);
        if (procedure is null)
        {
            return NotFound();
        }

        _context.Zabiegs.Remove(procedure);
        await _context.SaveChangesAsync();
        return NoContent();
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
