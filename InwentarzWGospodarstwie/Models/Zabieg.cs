using System;
using System.Collections.Generic;

namespace InwentarzWGospodarstwie.Models;

public partial class Zabieg
{
    public int IdZabiegu { get; set; }

    public string Nazwa { get; set; } = null!;

    public DateOnly Data { get; set; }

    public string? Opis { get; set; }

    public decimal Koszt { get; set; }

    public int IdZwierzecia { get; set; }

    public int IdLekarza { get; set; }

    public virtual Lekarz IdLekarzaNavigation { get; set; } = null!;

    public virtual Zwierze IdZwierzeciaNavigation { get; set; } = null!;
}
