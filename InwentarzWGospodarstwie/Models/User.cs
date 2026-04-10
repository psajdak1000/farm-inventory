using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations.Schema;

namespace InwentarzWGospodarstwie.Models
{
 
    public class User : IdentityUser
    {
        // --- Relacja: Użytkownik może być Właścicielem ---
        public int? WlascicielId { get; set; }

        [ForeignKey("WlascicielId")]
        public virtual Wlasciciel? Wlasciciel { get; set; }

        // --- Relacja: Użytkownik może być Lekarzem ---
        public int? LekarzId { get; set; }

        [ForeignKey("LekarzId")]
        public virtual Lekarz? Lekarz { get; set; }
    }
}