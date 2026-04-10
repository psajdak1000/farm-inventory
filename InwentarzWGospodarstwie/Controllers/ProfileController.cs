using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;
using InwentarzWGospodarstwie.Models;

namespace InwentarzWGospodarstwie.Controllers
{
    [Authorize] // tylko zalogowani
    public class ProfileController : Controller
    {
        private readonly UserManager<User> _userManager;
        private readonly Database _context;

        public ProfileController(UserManager<User> userManager, Database context)
        {
            _userManager = userManager;
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> EditProfile()
        {
            var user = await _userManager.GetUserAsync(User);

            if (user.WlascicielId != null)
            {
                var w = await _context.Wlasciciels.FindAsync(user.WlascicielId);
                if (w != null)
                {
                    ViewBag.Imie = w.Imię;
                    ViewBag.Nazwisko = w.Nazwisko;
                    ViewBag.Telefon = w.Telefon;
                    ViewBag.EMail = w.EMail;
                }
            }
            else if (user.LekarzId != null)
            {
                var l = await _context.Lekarzs.FindAsync(user.LekarzId);
                if (l != null)
                {
                    ViewBag.Imie = l.Imię;
                    ViewBag.Nazwisko = l.Nazwisko;
                    ViewBag.Telefon = l.Telefon;
                }
            }

            return View();
        }

        // POST - zapis dla Właściciela
        [HttpPost]
        public async Task<IActionResult> EditWlasciciel(string Imie, string Nazwisko, string Telefon, string EMail)
        {
            var user = await _userManager.GetUserAsync(User);
            var w = await _context.Wlasciciels.FindAsync(user.WlascicielId);

            if (w != null)
            {
                w.Imię = Imie;
                w.Nazwisko = Nazwisko;
                w.Telefon = Telefon;
                w.EMail = EMail;
                await _context.SaveChangesAsync();
            }

            return RedirectToAction("Index", "Home");
        }

        // POST - zapis dla Lekarza
        [HttpPost]
        public async Task<IActionResult> EditLekarz(string Imie, string Nazwisko, int Telefon)
        {
            var user = await _userManager.GetUserAsync(User);
            var l = await _context.Lekarzs.FindAsync(user.LekarzId);

            if (l != null)
            {
                l.Imię = Imie;
                l.Nazwisko = Nazwisko;
                l.Telefon = Telefon;
                await _context.SaveChangesAsync();
            }

            return RedirectToAction("Index", "Home");
        }
    }
}
