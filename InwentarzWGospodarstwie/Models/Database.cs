using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore; 

namespace InwentarzWGospodarstwie.Models;

//  Dziedziczymy po IdentityDbContext<User>, a nie zwykłym DbContext
public partial class Database : IdentityDbContext<User>
{
    public Database()
    {
    }

    public Database(DbContextOptions<Database> options)
        : base(options)
    {
    }

    //  tabele
    public virtual DbSet<Gospodarstwo> Gospodarstwos { get; set; }
    public virtual DbSet<Karmienie> Karmienies { get; set; }
    public virtual DbSet<Lekarz> Lekarzs { get; set; }
    public virtual DbSet<Wlasciciel> Wlasciciels { get; set; }
    public virtual DbSet<Zabieg> Zabiegs { get; set; }
    public virtual DbSet<Zwierze> Zwierzes { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // tworzy tabele do logowania (AspNetUsers itp.)
        // Musi być NA POCZĄTKU metody!
        base.OnModelCreating(modelBuilder);

       

        modelBuilder.Entity<Gospodarstwo>(entity =>
        {
            entity.ToTable("gospodarstwo");
            entity.HasKey(e => e.IdGodpodarstwa);

            entity.Property(e => e.IdGodpodarstwa).HasColumnName("ID_Godpodarstwa");
            entity.Property(e => e.Nazwa).HasMaxLength(100);
            entity.Property(e => e.Adres).HasMaxLength(100);
            entity.Property(e => e.Typ).HasMaxLength(50);
            entity.Property(e => e.Powierzchnia).HasPrecision(10, 2);
            entity.Property(e => e.IdWlasciciela).HasColumnName("ID_Wlasciciela");

            entity.HasOne(d => d.IdWlascicielaNavigation)
                .WithMany(p => p.Gospodarstwos)
                .HasForeignKey(d => d.IdWlasciciela)
                .OnDelete(DeleteBehavior.ClientSetNull);
        });

        modelBuilder.Entity<Karmienie>(entity =>
        {
            entity.ToTable("karmienie");
            entity.HasKey(e => e.IdKarmienia);

            entity.Property(e => e.IdKarmienia).HasColumnName("ID_Karmienia");
            entity.Property(e => e.Nazwa).HasMaxLength(50);
            entity.Property(e => e.Rodzaj).HasMaxLength(20);
            entity.Property(e => e.Ilość).HasMaxLength(50);
            entity.Property(e => e.Cena).HasPrecision(10, 2);
            entity.Property(e => e.DataZakupu).HasColumnName("Data zakupu");
            entity.Property(e => e.IdZwierzecia).HasColumnName("ID_Zwierzecia");

            entity.HasOne(d => d.IdZwierzeciaNavigation)
                .WithMany(p => p.Karmienies)
                .HasForeignKey(d => d.IdZwierzecia)
                .OnDelete(DeleteBehavior.ClientSetNull);
        });

        modelBuilder.Entity<Lekarz>(entity =>
        {
            entity.ToTable("lekarz");
            entity.HasKey(e => e.IdLekarza);

            entity.Property(e => e.IdLekarza).HasColumnName("ID_Lekarza");
            entity.Property(e => e.Imię).HasMaxLength(50);
            entity.Property(e => e.Nazwisko).HasMaxLength(50);
            entity.Property(e => e.Telefon);
        });

        modelBuilder.Entity<Wlasciciel>(entity =>
        {
            entity.ToTable("wlasciciel");
            entity.HasKey(e => e.IdWlasciciela);

            entity.Property(e => e.IdWlasciciela).HasColumnName("ID_Wlasciciela");
            entity.Property(e => e.Imię).HasMaxLength(50);
            entity.Property(e => e.Nazwisko).HasMaxLength(50);
            entity.Property(e => e.Telefon).HasMaxLength(9);
            entity.Property(e => e.EMail).HasMaxLength(50).HasColumnName("E-mail");
        });

        modelBuilder.Entity<Zabieg>(entity =>
        {
            entity.ToTable("zabieg");
            entity.HasKey(e => e.IdZabiegu);

            entity.Property(e => e.IdZabiegu).HasColumnName("ID_Zabiegu");
            entity.Property(e => e.Nazwa).HasMaxLength(50);
            entity.Property(e => e.Opis).HasMaxLength(300);
            entity.Property(e => e.Koszt).HasPrecision(10, 2);
            entity.Property(e => e.IdZwierzecia).HasColumnName("ID_Zwierzecia");
            entity.Property(e => e.IdLekarza).HasColumnName("ID_Lekarza");

            entity.HasOne(d => d.IdLekarzaNavigation)
                .WithMany(p => p.Zabiegs)
                .HasForeignKey(d => d.IdLekarza)
                .OnDelete(DeleteBehavior.ClientSetNull);

            entity.HasOne(d => d.IdZwierzeciaNavigation)
                .WithMany(p => p.Zabiegs)
                .HasForeignKey(d => d.IdZwierzecia)
                .OnDelete(DeleteBehavior.ClientSetNull);
        });

        modelBuilder.Entity<Zwierze>(entity =>
        {
            entity.ToTable("zwierze");
            entity.HasKey(e => e.IdZwierzecia);

            entity.Property(e => e.IdZwierzecia).HasColumnName("ID_Zwierzecia");
            entity.Property(e => e.IdentyfikatorKolczyka).HasColumnName("Identyfikator kolczyka");
            entity.Property(e => e.Rasa).HasMaxLength(50);
            entity.Property(e => e.Wiek);
            entity.Property(e => e.Płeć).HasMaxLength(10);
            entity.Property(e => e.Waga);
            entity.Property(e => e.DataZakupuUrodzenia).HasColumnName("Data zakupu/urodzenia");
            entity.Property(e => e.CenaZakupu).HasPrecision(10, 2).HasColumnName("Cena zakupu");
            entity.Property(e => e.DataSprzedażyŚmierci).HasColumnName("Data sprzedaży/śmierci");
            entity.Property(e => e.CenaSprzedaży).HasPrecision(10, 2).HasColumnName("Cena sprzedaży");
            entity.Property(e => e.IdGospodarstwa).HasColumnName("ID_Gospodarstwa");

            entity.HasOne(d => d.IdGospodarstwaNavigation)
                .WithMany(p => p.Zwierzes)
                .HasForeignKey(d => d.IdGospodarstwa)
                .OnDelete(DeleteBehavior.ClientSetNull);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}