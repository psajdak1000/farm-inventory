using System;
using System.Collections.Generic;

namespace InwentarzWGospodarstwie.Models;

public partial class Wlasciciel
{
    public int IdWlasciciela { get; set; }

    public string Imię { get; set; } = null!;

    public string Nazwisko { get; set; } = null!;

    public string Telefon { get; set; } = null!;

    public string? EMail { get; set; }

    public virtual ICollection<Gospodarstwo> Gospodarstwos { get; set; } = new List<Gospodarstwo>();
}
