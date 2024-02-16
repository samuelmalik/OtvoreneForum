<h1>Angular with ASP.NET Core</h1>

Projekt pozostáva z 2 oddelených častí. Zložka angular-project reprezentuje frontend (FE). Zložka AspNetWebAPI reprezentuje backend (BE).
Projekt má slúžiť ako štartovací bod pre ďalší vývoj. Obsahuje funkčnú registráciu a login s použitím JSON Web Token (JWT).
<br><br>
Všetky súbory môžu byť upravované podľa potreby.

<h2>angular-project</h2>
Projekt je vytvorený v Angular verzii 17 ako standalone, tzn. že každý component je definovaný ako standalone a v projekte nenájdete žiadny modul.
<br><br>

V priečinku s názvom `api-authorization` sa nachádza všetko súvisiace s registráciou a prihlasovaním používateľov.
Okrem toho projekt obsahuje component `main-nav`, ktorý obsahuje jednoduché menu aplikácie, a component `dashboard`, ktorý slúži ako príklad aj spolu s `TestService`.
Design aplikácie je veľmi jednoduchý zostavený pomocou knižnice Angular Material.
<br><br>
Navigovať na domovskú stránku (napr. https://localhost:4200) vám aplikácia dovolí len ak ste prihlásení. V opačnom prípade budete presmerovaný na login (/login) stránku.


<h2>AspNetWebAPI</h2>
Projekt používa .NET verziu 7 s MSSQL databázou.
<br><br>
Všetko čo súvisí s registráciou a prihlasovaním používateľov na BE nájdete v priečinku Authentication. Okrem toho BE obsahuje len jeden endpoint (/home) v triede HomeController prístupný len pre prihlásených používateľov ako príklad.
<br><br>
Aplikácia je nakonfigurovaná (súbor Program.cs) tak, že pri lokálnom spustení sa vám otvorí nástroj s názvom Swagger (kľudne si vygooglite, popozerajte), ktorý služí na príjemné testovanie vašich BE endpointov. BE je zároveň prístupný aj pre vaše volania z FE aplikácie.

<h3>Databáza</h3>
Aplikácia používa MSSQL databázu. <b>Je potrebné aby ste si v súbore appsettings.Development.json upravili hodnotu DefaultConnection na connection string pre vašu lokálnu MSSQL databázu!</b>
