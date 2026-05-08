using InwentarzWGospodarstwie.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace InwentarzWGospodarstwie.Controllers;

[ApiController] // na podstawie apicontroller swagger identyfikuje kontroler jako endpoint API i generuje odpowiedni¹ dokumentacjê
[Route("api/animals")] //sciezka bazowa dla tego kontrolera
public class AnimalsController : ControllerBase
{
    private readonly Database _context;

    public AnimalsController(Database context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<AnimalResponse>>> GetAll()
    {
        var animals = await _context.Animals
            .AsNoTracking()
            .Select(a => ToResponse(a))
            .ToListAsync();

        return Ok(animals);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<AnimalResponse>> GetById(int id)
    {
        var animal = await _context.Animals
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == id);

        if (animal is null)
        {
            return NotFound("Animal with the specified ID was not found.");
        }

        return Ok(ToResponse(animal));
    }

    [HttpPost]
    public async Task<ActionResult<AnimalResponse>> Create([FromBody] AnimalUpsertRequest request)
    {
        var farmExists = await _context.Gospodarstwos.AnyAsync(g => g.IdGodpodarstwa == request.FarmId);
        if (!farmExists)
        {
            return BadRequest("Farm with the specified ID does not exist.");
        }

        var animal = new Animal
        {
            EarTagId = request.EarTagId,
            Breed = request.Breed,
            Age = request.Age,
            Sex = request.Sex,
            Weight = request.Weight,
            AcquisitionDate = request.AcquisitionDate,
            PurchasePrice = request.PurchasePrice,
            DepartureDate = request.DepartureDate,
            SalePrice = request.SalePrice,
            FarmId = request.FarmId
        };

        _context.Animals.Add(animal);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = animal.Id }, ToResponse(animal));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<AnimalResponse>> Update(int id, [FromBody] AnimalUpsertRequest request)
    {
        var animal = await _context.Animals.FirstOrDefaultAsync(a => a.Id == id);
        if (animal is null)
        {
            return NotFound("Animal with the specified ID was not found.");
        }

        var farmExists = await _context.Gospodarstwos.AnyAsync(g => g.IdGodpodarstwa == request.FarmId);
        if (!farmExists)
        {
            return BadRequest("Farm with the specified ID does not exist.");
        }

        animal.EarTagId = request.EarTagId;
        animal.Breed = request.Breed;
        animal.Age = request.Age;
        animal.Sex = request.Sex;
        animal.Weight = request.Weight;
        animal.AcquisitionDate = request.AcquisitionDate;
        animal.PurchasePrice = request.PurchasePrice;
        animal.DepartureDate = request.DepartureDate;
        animal.SalePrice = request.SalePrice;
        animal.FarmId = request.FarmId;

        await _context.SaveChangesAsync();
        return Ok(ToResponse(animal));
    }

    

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var animal = await _context.Animals.FirstOrDefaultAsync(a => a.Id == id);
        if (animal is null)
        {
            return NotFound("Animal with the specified ID was not found.");
        }

        _context.Animals.Remove(animal);

        try
        {
            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (DbUpdateException)
        {
            return Conflict("Cannot delete animal because it is referenced by other records.");
        }
    }

    private static AnimalResponse ToResponse(Animal animal) =>
        new(
            animal.Id,
            animal.EarTagId,
            animal.Breed,
            animal.Age,
            animal.Sex,
            animal.Weight,
            animal.AcquisitionDate,
            animal.PurchasePrice,
            animal.DepartureDate,
            animal.SalePrice,
            animal.FarmId);
}

public sealed class AnimalUpsertRequest
{
    [Range(1, int.MaxValue, ErrorMessage = "Ear tag ID is required.")]
    public int EarTagId { get; set; }

    [Required(ErrorMessage = "Breed is required.")]
    [StringLength(50, ErrorMessage = "Breed must not exceed 50 characters.")]
    public string Breed { get; set; } = string.Empty;

    public int? Age { get; set; }

    [Required(ErrorMessage = "Sex is required.")]
    [StringLength(10, ErrorMessage = "Sex must not exceed 10 characters.")]
    public string Sex { get; set; } = string.Empty;

    public float Weight { get; set; }

    public DateOnly AcquisitionDate { get; set; }

    public decimal? PurchasePrice { get; set; }

    public DateOnly? DepartureDate { get; set; }

    public decimal? SalePrice { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Farm ID is required.")]
    public int FarmId { get; set; }
}

public record AnimalResponse(
    int Id,
    int EarTagId,
    string Breed,
    int? Age,
    string Sex,
    float Weight,
    DateOnly AcquisitionDate,
    decimal? PurchasePrice,
    DateOnly? DepartureDate,
    decimal? SalePrice,
    int FarmId);
