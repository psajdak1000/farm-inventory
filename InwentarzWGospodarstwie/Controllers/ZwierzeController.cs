using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;
using InwentarzWGospodarstwie.Models;

namespace InwentarzWGospodarstwie.Controllers
{
    [Authorize] // tylko zalogowani
    public class ZwierzeController : Controller
    {
        private readonly UserManager<User> _userManager;
        private readonly Database _context;

        public ZwierzeController(UserManager<User> userManager, Database context)
        {
            _userManager = userManager;
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> Create()
        {
            var user = await _userManager.GetUserAsync(User);

            // Tylko Właściciel może dodawać zwierzęta
            if (user.WlascicielId == null)
            {
                return RedirectToAction("Index", "Home");
            }

            // Przekazujemy listę gospodarstw do widoku
            ViewBag.Gospodarstwa = _context.Gospodarstwos.ToList();

            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Create(Zwierze zwierze)
        {
            var user = await _userManager.GetUserAsync(User);

            if (user.WlascicielId == null)
            {
                return RedirectToAction("Index", "Home");
            }

            if (ModelState.IsValid)
            {
                _context.Zwierzes.Add(zwierze);
                await _context.SaveChangesAsync();
                return RedirectToAction("Index", "Home");
            }

            // Jeśli błąd - załaduj ponownie listę gospodarstw
            ViewBag.Gospodarstwa = _context.Gospodarstwos.ToList();
            return View(zwierze);
        }
    }
}
