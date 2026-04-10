using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InwentarzWGospodarstwie.Migrations
{
    /// <inheritdoc />
    public partial class Init : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AspNetRoles",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "lekarz",
                columns: table => new
                {
                    ID_Lekarza = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Imię = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Nazwisko = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Telefon = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_lekarz", x => x.ID_Lekarza);
                });

            migrationBuilder.CreateTable(
                name: "wlasciciel",
                columns: table => new
                {
                    ID_Wlasciciela = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Imię = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Nazwisko = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Telefon = table.Column<string>(type: "nvarchar(9)", maxLength: 9, nullable: false),
                    Email = table.Column<string>(name: "E-mail", type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wlasciciel", x => x.ID_Wlasciciela);
                });

            migrationBuilder.CreateTable(
                name: "AspNetRoleClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoleId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ClaimType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClaimValue = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoleClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetRoleClaims_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUsers",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    WlascicielId = table.Column<int>(type: "int", nullable: true),
                    LekarzId = table.Column<int>(type: "int", nullable: true),
                    UserName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedUserName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    EmailConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SecurityStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumberConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    TwoFactorEnabled = table.Column<bool>(type: "bit", nullable: false),
                    LockoutEnd = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    LockoutEnabled = table.Column<bool>(type: "bit", nullable: false),
                    AccessFailedCount = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUsers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetUsers_lekarz_LekarzId",
                        column: x => x.LekarzId,
                        principalTable: "lekarz",
                        principalColumn: "ID_Lekarza");
                    table.ForeignKey(
                        name: "FK_AspNetUsers_wlasciciel_WlascicielId",
                        column: x => x.WlascicielId,
                        principalTable: "wlasciciel",
                        principalColumn: "ID_Wlasciciela");
                });

            migrationBuilder.CreateTable(
                name: "gospodarstwo",
                columns: table => new
                {
                    ID_Godpodarstwa = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nazwa = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Adres = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Typ = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Powierzchnia = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    ID_Wlasciciela = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_gospodarstwo", x => x.ID_Godpodarstwa);
                    table.ForeignKey(
                        name: "FK_gospodarstwo_wlasciciel_ID_Wlasciciela",
                        column: x => x.ID_Wlasciciela,
                        principalTable: "wlasciciel",
                        principalColumn: "ID_Wlasciciela");
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ClaimType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClaimValue = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetUserClaims_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserLogins",
                columns: table => new
                {
                    LoginProvider = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ProviderKey = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ProviderDisplayName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserLogins", x => new { x.LoginProvider, x.ProviderKey });
                    table.ForeignKey(
                        name: "FK_AspNetUserLogins_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserRoles",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    RoleId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserRoles", x => new { x.UserId, x.RoleId });
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserTokens",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    LoginProvider = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserTokens", x => new { x.UserId, x.LoginProvider, x.Name });
                    table.ForeignKey(
                        name: "FK_AspNetUserTokens_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "zwierze",
                columns: table => new
                {
                    ID_Zwierzecia = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Identyfikatorkolczyka = table.Column<int>(name: "Identyfikator kolczyka", type: "int", nullable: false),
                    Rasa = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Wiek = table.Column<int>(type: "int", nullable: true),
                    Płeć = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Waga = table.Column<float>(type: "real", nullable: false),
                    Datazakupuurodzenia = table.Column<DateOnly>(name: "Data zakupu/urodzenia", type: "date", nullable: false),
                    Cenazakupu = table.Column<decimal>(name: "Cena zakupu", type: "decimal(10,2)", precision: 10, scale: 2, nullable: true),
                    Datasprzedażyśmierci = table.Column<DateOnly>(name: "Data sprzedaży/śmierci", type: "date", nullable: true),
                    Cenasprzedaży = table.Column<decimal>(name: "Cena sprzedaży", type: "decimal(10,2)", precision: 10, scale: 2, nullable: true),
                    ID_Gospodarstwa = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_zwierze", x => x.ID_Zwierzecia);
                    table.ForeignKey(
                        name: "FK_zwierze_gospodarstwo_ID_Gospodarstwa",
                        column: x => x.ID_Gospodarstwa,
                        principalTable: "gospodarstwo",
                        principalColumn: "ID_Godpodarstwa");
                });

            migrationBuilder.CreateTable(
                name: "karmienie",
                columns: table => new
                {
                    ID_Karmienia = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nazwa = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Rodzaj = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Ilość = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Cena = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    Datazakupu = table.Column<DateOnly>(name: "Data zakupu", type: "date", nullable: false),
                    ID_Zwierzecia = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_karmienie", x => x.ID_Karmienia);
                    table.ForeignKey(
                        name: "FK_karmienie_zwierze_ID_Zwierzecia",
                        column: x => x.ID_Zwierzecia,
                        principalTable: "zwierze",
                        principalColumn: "ID_Zwierzecia");
                });

            migrationBuilder.CreateTable(
                name: "zabieg",
                columns: table => new
                {
                    ID_Zabiegu = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nazwa = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Data = table.Column<DateOnly>(type: "date", nullable: false),
                    Opis = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    Koszt = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    ID_Zwierzecia = table.Column<int>(type: "int", nullable: false),
                    ID_Lekarza = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_zabieg", x => x.ID_Zabiegu);
                    table.ForeignKey(
                        name: "FK_zabieg_lekarz_ID_Lekarza",
                        column: x => x.ID_Lekarza,
                        principalTable: "lekarz",
                        principalColumn: "ID_Lekarza");
                    table.ForeignKey(
                        name: "FK_zabieg_zwierze_ID_Zwierzecia",
                        column: x => x.ID_Zwierzecia,
                        principalTable: "zwierze",
                        principalColumn: "ID_Zwierzecia");
                });

            migrationBuilder.CreateIndex(
                name: "IX_AspNetRoleClaims_RoleId",
                table: "AspNetRoleClaims",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "RoleNameIndex",
                table: "AspNetRoles",
                column: "NormalizedName",
                unique: true,
                filter: "[NormalizedName] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserClaims_UserId",
                table: "AspNetUserClaims",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserLogins_UserId",
                table: "AspNetUserLogins",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserRoles_RoleId",
                table: "AspNetUserRoles",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "EmailIndex",
                table: "AspNetUsers",
                column: "NormalizedEmail");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_LekarzId",
                table: "AspNetUsers",
                column: "LekarzId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_WlascicielId",
                table: "AspNetUsers",
                column: "WlascicielId");

            migrationBuilder.CreateIndex(
                name: "UserNameIndex",
                table: "AspNetUsers",
                column: "NormalizedUserName",
                unique: true,
                filter: "[NormalizedUserName] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_gospodarstwo_ID_Wlasciciela",
                table: "gospodarstwo",
                column: "ID_Wlasciciela");

            migrationBuilder.CreateIndex(
                name: "IX_karmienie_ID_Zwierzecia",
                table: "karmienie",
                column: "ID_Zwierzecia");

            migrationBuilder.CreateIndex(
                name: "IX_zabieg_ID_Lekarza",
                table: "zabieg",
                column: "ID_Lekarza");

            migrationBuilder.CreateIndex(
                name: "IX_zabieg_ID_Zwierzecia",
                table: "zabieg",
                column: "ID_Zwierzecia");

            migrationBuilder.CreateIndex(
                name: "IX_zwierze_ID_Gospodarstwa",
                table: "zwierze",
                column: "ID_Gospodarstwa");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AspNetRoleClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserLogins");

            migrationBuilder.DropTable(
                name: "AspNetUserRoles");

            migrationBuilder.DropTable(
                name: "AspNetUserTokens");

            migrationBuilder.DropTable(
                name: "karmienie");

            migrationBuilder.DropTable(
                name: "zabieg");

            migrationBuilder.DropTable(
                name: "AspNetRoles");

            migrationBuilder.DropTable(
                name: "AspNetUsers");

            migrationBuilder.DropTable(
                name: "zwierze");

            migrationBuilder.DropTable(
                name: "lekarz");

            migrationBuilder.DropTable(
                name: "gospodarstwo");

            migrationBuilder.DropTable(
                name: "wlasciciel");
        }
    }
}
