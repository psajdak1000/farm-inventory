using System.ComponentModel.DataAnnotations;

namespace InwentarzWGospodarstwie.Models.ViewModels
{
    public class LoginViewModel
    {
        [Required(ErrorMessage = "Podaj email")]
        [EmailAddress]
        public string Email { get; set; }

        [Required(ErrorMessage = "Podaj hasło")]
        [DataType(DataType.Password)]
        public string Password { get; set; }
    }
}