using Microsoft.EntityFrameworkCore;
using InwentarzWGospodarstwie.Models;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("MojaBaza");

builder.Services.AddDbContext<Database>(options =>
    options.UseSqlServer(connectionString));

// API + Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

app.UseRouting();

app.MapControllers();
app.MapGet("/", () => Results.Redirect("/swagger"));

app.Run();