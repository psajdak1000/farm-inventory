using System;
using System.Collections.Generic;

namespace InwentarzWGospodarstwie.Models;

public partial class Lekarz
{
    public int IdLekarza { get; set; }

    public string Imię { get; set; } = null!;

    public string Nazwisko { get; set; } = null!;

    public int Telefon { get; set; }

    public virtual ICollection<Zabieg> Zabiegs { get; set; } = new List<Zabieg>();
}
