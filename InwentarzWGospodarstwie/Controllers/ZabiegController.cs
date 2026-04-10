using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;
using InwentarzWGospodarstwie.Models;

namespace InwentarzWGospodarstwie.Controllers
{
    [Authorize] // tylko zalogowani
    public class ZabiegController : Controller
    {
        private readonly UserManager<User> _userManager;
        private readonly Database _context;

        public ZabiegController(UserManager<User> userManager, Database context)
        {
            _userManager = userManager;
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> Create()
        {
            var user = await _userManager.GetUserAsync(User);

            // Zarówno Właściciel jak i Lekarz mogą dodawać zabiegi
            if (user.WlascicielId == null && user.LekarzId == null)
            {
                return RedirectToAction("Index", "Home");
            }

            // Przekazujemy listy do widoku
            ViewBag.Zwierzeta = _context.Zwierzes.ToList();
            ViewBag.Lekarze = _context.Lekarzs.ToList();

            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Create(Zabieg zabieg)
        {
            var user = await _userManager.GetUserAsync(User);

            if (user.WlascicielId == null && user.LekarzId == null)
            {
                return RedirectToAction("Index", "Home");
            }

            if (ModelState.IsValid)
            {
                _context.Zabiegs.Add(zabieg);
                await _context.SaveChangesAsync();
                return RedirectToAction("Index", "Home");
            }

            // Jeśli błąd - załaduj ponownie listy
            ViewBag.Zwierzeta = _context.Zwierzes.ToList();
            ViewBag.Lekarze = _context.Lekarzs.ToList();
            return View(zabieg);
        }
    }
}
