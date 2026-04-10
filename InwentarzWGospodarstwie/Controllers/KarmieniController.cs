using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;
using InwentarzWGospodarstwie.Models;

namespace InwentarzWGospodarstwie.Controllers
{
    [Authorize] // tylko zalogowani
    public class KarmieniController : Controller
    {
        private readonly UserManager<User> _userManager;
        private readonly Database _context;

        public KarmieniController(UserManager<User> userManager, Database context)
        {
            _userManager = userManager;
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> Create()
        {
            var user = await _userManager.GetUserAsync(User);

            // Tylko Właściciel może dodawać karmienia
            if (user.WlascicielId == null)
            {
                return RedirectToAction("Index", "Home");
            }

            // Przekazujemy listę zwierząt do widoku
            ViewBag.Zwierzeta = _context.Zwierzes.ToList();

            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Create(Karmienie karmienie)
        {
            var user = await _userManager.GetUserAsync(User);

            if (user.WlascicielId == null)
            {
                return RedirectToAction("Index", "Home");
            }

            if (ModelState.IsValid)
            {
                _context.Karmienies.Add(karmienie);
                await _context.SaveChangesAsync();
                return RedirectToAction("Index", "Home");
            }

            // Jeśli błąd - załaduj ponownie listę zwierząt
            ViewBag.Zwierzeta = _context.Zwierzes.ToList();
            return View(karmienie);
        }
    }
}
