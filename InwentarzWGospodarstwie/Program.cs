using Microsoft.EntityFrameworkCore;
using InwentarzWGospodarstwie.Models;
using Microsoft.AspNetCore.Identity; 

var builder = WebApplication.CreateBuilder(args);

// 1. KONFIGURACJA BAZY DANYCH
var connectionString = builder.Configuration.GetConnectionString("MojaBaza");

builder.Services.AddDbContext<Database>(options =>
    options.UseSqlServer(connectionString));

// 2. KONFIGURACJA IDENTITY (LOGOWANIA) 
// Bez tego AccountController nie zadzia³a, bo nie znajdzie UserManagera
builder.Services.AddIdentity<User, IdentityRole>()
    .AddEntityFrameworkStores<Database>()
    .AddDefaultTokenProviders();

// 3. MVC
builder.Services.AddControllersWithViews();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

// 4. URUCHOMIENIE LOGOWANIA 
app.UseAuthentication(); // Sprawdza "Kim jesteœ?" (czytuje ciasteczko)
app.UseAuthorization();  // Sprawdza "Co mo¿esz?"

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();