using System;
using System.Collections.Generic;

namespace InwentarzWGospodarstwie.Models;

public partial class Gospodarstwo
{
    public int IdGodpodarstwa { get; set; }

    public string Nazwa { get; set; } = null!;

    public string Adres { get; set; } = null!;

    public string Typ { get; set; } = null!;

    public decimal Powierzchnia { get; set; }

    public int IdWlasciciela { get; set; }

    public virtual Wlasciciel IdWlascicielaNavigation { get; set; } = null!;

    public virtual ICollection<Zwierze> Zwierzes { get; set; } = new List<Zwierze>();
}
