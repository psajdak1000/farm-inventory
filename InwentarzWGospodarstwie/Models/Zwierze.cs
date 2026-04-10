using System;
using System.Collections.Generic;

namespace InwentarzWGospodarstwie.Models;

public partial class Zwierze
{
    public int IdZwierzecia { get; set; }

    public int IdentyfikatorKolczyka { get; set; }

    public string Rasa { get; set; } = null!;

    public int? Wiek { get; set; }

    public string Płeć { get; set; } = null!;

    public float Waga { get; set; }

    public DateOnly DataZakupuUrodzenia { get; set; }

    public decimal? CenaZakupu { get; set; }

    public DateOnly? DataSprzedażyŚmierci { get; set; }

    public decimal? CenaSprzedaży { get; set; }

    public int IdGospodarstwa { get; set; }

    public virtual Gospodarstwo IdGospodarstwaNavigation { get; set; } = null!;

    public virtual ICollection<Karmienie> Karmienies { get; set; } = new List<Karmienie>();

    public virtual ICollection<Zabieg> Zabiegs { get; set; } = new List<Zabieg>();
}
