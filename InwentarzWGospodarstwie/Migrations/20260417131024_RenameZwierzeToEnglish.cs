using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InwentarzWGospodarstwie.Migrations
{
    /// <inheritdoc />
    public partial class RenameZwierzeToEnglish : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_karmienie_zwierze_ID_Zwierzecia",
                table: "karmienie");

            migrationBuilder.DropForeignKey(
                name: "FK_zabieg_zwierze_ID_Zwierzecia",
                table: "zabieg");

            migrationBuilder.DropForeignKey(
                name: "FK_zwierze_gospodarstwo_ID_Gospodarstwa",
                table: "zwierze");

            migrationBuilder.DropPrimaryKey(
                name: "PK_zwierze",
                table: "zwierze");

            migrationBuilder.RenameTable(
                name: "zwierze",
                newName: "animals");

            migrationBuilder.RenameColumn(
                name: "ID_Zwierzecia",
                table: "animals",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "ID_Gospodarstwa",
                table: "animals",
                newName: "FarmId");

            migrationBuilder.RenameColumn(
                name: "Identyfikator kolczyka",
                table: "animals",
                newName: "EarTagId");

            migrationBuilder.RenameColumn(
                name: "Rasa",
                table: "animals",
                newName: "Breed");

            migrationBuilder.RenameColumn(
                name: "Wiek",
                table: "animals",
                newName: "Age");

            migrationBuilder.RenameColumn(
                name: "Płeć",
                table: "animals",
                newName: "Sex");

            migrationBuilder.RenameColumn(
                name: "Waga",
                table: "animals",
                newName: "Weight");

            migrationBuilder.RenameColumn(
                name: "Data zakupu/urodzenia",
                table: "animals",
                newName: "AcquisitionDate");

            migrationBuilder.RenameColumn(
                name: "Cena zakupu",
                table: "animals",
                newName: "PurchasePrice");

            migrationBuilder.RenameColumn(
                name: "Data sprzedaży/śmierci",
                table: "animals",
                newName: "DepartureDate");

            migrationBuilder.RenameColumn(
                name: "Cena sprzedaży",
                table: "animals",
                newName: "SalePrice");

            migrationBuilder.RenameIndex(
                name: "IX_zwierze_ID_Gospodarstwa",
                table: "animals",
                newName: "IX_animals_FarmId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_animals",
                table: "animals",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_animals_gospodarstwo_FarmId",
                table: "animals",
                column: "FarmId",
                principalTable: "gospodarstwo",
                principalColumn: "ID_Godpodarstwa");

            migrationBuilder.AddForeignKey(
                name: "FK_karmienie_animals_ID_Zwierzecia",
                table: "karmienie",
                column: "ID_Zwierzecia",
                principalTable: "animals",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_zabieg_animals_ID_Zwierzecia",
                table: "zabieg",
                column: "ID_Zwierzecia",
                principalTable: "animals",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_karmienie_animals_ID_Zwierzecia",
                table: "karmienie");

            migrationBuilder.DropForeignKey(
                name: "FK_zabieg_animals_ID_Zwierzecia",
                table: "zabieg");

            migrationBuilder.DropForeignKey(
                name: "FK_animals_gospodarstwo_FarmId",
                table: "animals");

            migrationBuilder.DropPrimaryKey(
                name: "PK_animals",
                table: "animals");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "animals",
                newName: "ID_Zwierzecia");

            migrationBuilder.RenameColumn(
                name: "FarmId",
                table: "animals",
                newName: "ID_Gospodarstwa");

            migrationBuilder.RenameColumn(
                name: "EarTagId",
                table: "animals",
                newName: "Identyfikator kolczyka");

            migrationBuilder.RenameColumn(
                name: "Breed",
                table: "animals",
                newName: "Rasa");

            migrationBuilder.RenameColumn(
                name: "Age",
                table: "animals",
                newName: "Wiek");

            migrationBuilder.RenameColumn(
                name: "Sex",
                table: "animals",
                newName: "Płeć");

            migrationBuilder.RenameColumn(
                name: "Weight",
                table: "animals",
                newName: "Waga");

            migrationBuilder.RenameColumn(
                name: "AcquisitionDate",
                table: "animals",
                newName: "Data zakupu/urodzenia");

            migrationBuilder.RenameColumn(
                name: "PurchasePrice",
                table: "animals",
                newName: "Cena zakupu");

            migrationBuilder.RenameColumn(
                name: "DepartureDate",
                table: "animals",
                newName: "Data sprzedaży/śmierci");

            migrationBuilder.RenameColumn(
                name: "SalePrice",
                table: "animals",
                newName: "Cena sprzedaży");

            migrationBuilder.RenameIndex(
                name: "IX_animals_FarmId",
                table: "animals",
                newName: "IX_zwierze_ID_Gospodarstwa");

            migrationBuilder.RenameTable(
                name: "animals",
                newName: "zwierze");

            migrationBuilder.AddPrimaryKey(
                name: "PK_zwierze",
                table: "zwierze",
                column: "ID_Zwierzecia");

            migrationBuilder.AddForeignKey(
                name: "FK_zwierze_gospodarstwo_ID_Gospodarstwa",
                table: "zwierze",
                column: "ID_Gospodarstwa",
                principalTable: "gospodarstwo",
                principalColumn: "ID_Godpodarstwa");

            migrationBuilder.AddForeignKey(
                name: "FK_karmienie_zwierze_ID_Zwierzecia",
                table: "karmienie",
                column: "ID_Zwierzecia",
                principalTable: "zwierze",
                principalColumn: "ID_Zwierzecia");

            migrationBuilder.AddForeignKey(
                name: "FK_zabieg_zwierze_ID_Zwierzecia",
                table: "zabieg",
                column: "ID_Zwierzecia",
                principalTable: "zwierze",
                principalColumn: "ID_Zwierzecia");
        }
    }
}
