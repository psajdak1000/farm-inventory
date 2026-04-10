using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using InwentarzWGospodarstwie.Models;
using InwentarzWGospodarstwie.Models.ViewModels;
using Microsoft.AspNetCore.Authorization;

namespace InwentarzWGospodarstwie.Controllers
{
    public class AccountController : Controller
    {
        // Narzędzia do zarządzania użytkownikami (z biblioteki Identity)
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        // Twoja baza danych (do tworzenia Właścicieli/Lekarzy)
        private readonly Database _context;

        // Konstruktor - tutaj wstrzykujemy potrzebne narzędzia
        public AccountController(UserManager<User> userManager, SignInManager<User> signInManager, Database context)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _context = context;
        }

        // 1. Wyświetlenie formularza rejestracji (GET)
        [HttpGet]
        public IActionResult Register()
        {
            return View();
        }

        // 2. Obsługa wysłania formularza (POST) 
        [HttpPost]
        public async Task<IActionResult> Register(RegisterViewModel model)
        {
            if (ModelState.IsValid)
            {
                // Tworzymy obiekt użytkownika (karta wejściowa)
                var user = new User { UserName = model.Email, Email = model.Email };

                // SPRAWDZAMY KIM JEST UŻYTKOWNIK 
                if (model.TypKonta == "Wlasciciel")
                {
                    // Tworzymy pustego Właściciela w bazie
                    var nowyWlasciciel = new Wlasciciel
                    {
                        Imię = "Nowy",
                        Nazwisko = "Użytkownik",
                        Telefon = "000000000"
                    };

                    _context.Wlasciciels.Add(nowyWlasciciel);
                    await _context.SaveChangesAsync(); // Zapisujemy, żeby baza nadała ID

                    // Łączymy Usera z Właścicielem
                    user.WlascicielId = nowyWlasciciel.IdWlasciciela;
                }
                else if (model.TypKonta == "Lekarz")
                {
                    // Tworzymy pustego Lekarza w bazie
                    var nowyLekarz = new Lekarz
                    {
                        Imię = "Nowy",
                        Nazwisko = "Weterynarz",
                        Telefon = 0 // Telefon w Lekarzu  jako int
                    };

                    _context.Lekarzs.Add(nowyLekarz);
                    await _context.SaveChangesAsync(); // Zapisujemy, żeby baza nadała ID

                    // Łączymy Usera z Lekarzem
                    user.LekarzId = nowyLekarz.IdLekarza;
                }

                // FINALNE TWORZENIE KONTA
                var result = await _userManager.CreateAsync(user, model.Password);

                if (result.Succeeded)
                {
                    // Jeśli się udało, od razu logujemy użytkownika
                    await _signInManager.SignInAsync(user, isPersistent: false);

                    // I przekierowujemy na stronę główną
                    return RedirectToAction("Index", "Home");
                }

                // Jeśli były błędy (np. za słabe hasło), dodajemy je do widoku
                foreach (var error in result.Errors)
                {
                    ModelState.AddModelError("", error.Description);
                }
            }

            // Jeśli coś poszło nie tak, wyświetlamy formularz ponownie z błędami
            return View(model);
        }

        // Metoda do wylogowywania
        [HttpPost]
        public async Task<IActionResult> Logout()
        {
            await _signInManager.SignOutAsync();
            return RedirectToAction("Index", "Home");
        }

        // Wyświetlenie formularza logowania (GET)
        [HttpGet]
        public IActionResult Login()
        {
            return View();
        }

        // Obsługa logowania (POST)
        [HttpPost]
        public async Task<IActionResult> Login(LoginViewModel model)
        {
            if (ModelState.IsValid)
            {
                var result = await _signInManager.PasswordSignInAsync(model.Email, model.Password, false, false);

                if (result.Succeeded)
                {
                    return RedirectToAction("Index", "Home");
                }

                ModelState.AddModelError("", "Nieudana próba logowania");
            }

            return View(model);
        }

        // PUNKT 7 z instrukcji - Test zabezpieczeń
        [HttpGet]
        [Authorize] // To sprawia, że wejdą tu tylko zalogowani
        public IActionResult Welcome()
        {
            //  zwróci prosty widok 
            return Content("Zostałeś poprawnie zalogowany! To jest strefa chroniona.");
        }

    }
}