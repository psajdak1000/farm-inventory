using System;
using System.Collections.Generic;

namespace InwentarzWGospodarstwie.Models;

public partial class Animal
{
    public int Id { get; set; }

    public int EarTagId { get; set; }

    public string Breed { get; set; } = null!;

    public int? Age { get; set; }

    public string Sex { get; set; } = null!;

    public float Weight { get; set; }

    public DateOnly AcquisitionDate { get; set; }

    public decimal? PurchasePrice { get; set; }

    public DateOnly? DepartureDate { get; set; }

    public decimal? SalePrice { get; set; }

    public int FarmId { get; set; }

    public virtual Gospodarstwo Farm { get; set; } = null!;

    public virtual ICollection<Karmienie> Feedings { get; set; } = new List<Karmienie>();

    public virtual ICollection<Zabieg> Procedures { get; set; } = new List<Zabieg>();
}
