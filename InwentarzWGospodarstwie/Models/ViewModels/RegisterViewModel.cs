using System.ComponentModel.DataAnnotations;

namespace InwentarzWGospodarstwie.Models.ViewModels
{
    public class RegisterViewModel
    {
        [Required(ErrorMessage = "Podaj email")]
        [EmailAddress(ErrorMessage = "Niepoprawny format adresu email")]
        [Display(Name = "Email")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Podaj hasło")]
        [DataType(DataType.Password)]
        [Display(Name = "Hasło")]
        public string Password { get; set; }

        [DataType(DataType.Password)]
        [Display(Name = "Potwierdź hasło")]
        [Compare("Password", ErrorMessage = "Hasła nie są identyczne.")]
        public string ConfirmPassword { get; set; }

        //  Właściciel vs Lekarz
        [Required(ErrorMessage = "Musisz wybrać typ konta")]
        [Display(Name = "Kim jesteś?")]
        public string TypKonta { get; set; }
    }
}