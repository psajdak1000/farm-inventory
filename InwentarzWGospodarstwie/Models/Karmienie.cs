using System;
using System.Collections.Generic;

namespace InwentarzWGospodarstwie.Models;

public partial class Karmienie
{
    public int IdKarmienia { get; set; }

    public string Nazwa { get; set; } = null!;

    public string? Rodzaj { get; set; }

    public string Ilość { get; set; } = null!;

    public decimal Cena { get; set; }

    public DateOnly DataZakupu { get; set; }

    public int IdZwierzecia { get; set; }

    public virtual Zwierze IdZwierzeciaNavigation { get; set; } = null!;
}
