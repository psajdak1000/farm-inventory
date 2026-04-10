using InwentarzWGospodarstwie.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace InwentarzWGospodarstwie.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LekarzeController : ControllerBase
{
    private readonly Database _context;

    public LekarzeController(Database context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<LekarzResponse>>> GetAll()
    {
        var doctors = await _context.Lekarzs
            .AsNoTracking()
            .Select(l => ToResponse(l))
            .ToListAsync();

        return Ok(doctors);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<LekarzResponse>> GetById(int id)
    {
        var doctor = await _context.Lekarzs
            .AsNoTracking()
            .FirstOrDefaultAsync(l => l.IdLekarza == id);

        if (doctor is null)
        {
            return NotFound();
        }

        return Ok(ToResponse(doctor));
    }

    [HttpPost]
    public async Task<ActionResult<LekarzResponse>> Create([FromBody] LekarzUpsertRequest request)
    {
        var doctor = new Lekarz
        {
            Imię = request.Imie,
            Nazwisko = request.Nazwisko,
            Telefon = request.Telefon
        };

        _context.Lekarzs.Add(doctor);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = doctor.IdLekarza }, ToResponse(doctor));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<LekarzResponse>> Update(int id, [FromBody] LekarzUpsertRequest request)
    {
        var doctor = await _context.Lekarzs.FirstOrDefaultAsync(l => l.IdLekarza == id);
        if (doctor is null)
        {
            return NotFound();
        }

        doctor.Imię = request.Imie;
        doctor.Nazwisko = request.Nazwisko;
        doctor.Telefon = request.Telefon;

        await _context.SaveChangesAsync();
        return Ok(ToResponse(doctor));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var doctor = await _context.Lekarzs.FirstOrDefaultAsync(l => l.IdLekarza == id);
        if (doctor is null)
        {
            return NotFound();
        }

        _context.Lekarzs.Remove(doctor);

        try
        {
            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (DbUpdateException)
        {
            return Conflict("Nie mozna usunac lekarza, poniewaz jest powiazany z innymi rekordami.");
        }
    }

    private static LekarzResponse ToResponse(Lekarz doctor) =>
        new(doctor.IdLekarza, doctor.Imię, doctor.Nazwisko, doctor.Telefon);
}

public sealed class LekarzUpsertRequest
{
    [Required]
    [MaxLength(50)]
    public string Imie { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Nazwisko { get; set; } = string.Empty;

    public int Telefon { get; set; }
}

public record LekarzResponse(int IdLekarza, string Imie, string Nazwisko, int Telefon);
