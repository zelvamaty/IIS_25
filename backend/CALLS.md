
## 1\. Registrace a Users

### \- method: "POST" - [http://127.0.0.1:8000/api/auth/registration/](http://127.0.0.1:8000/api/auth/registration/)

Registrace nového uživatele (defaultně role USER).

```json
{
    "username": "jakub_student",
    "email": "jakub@example.com",
    "first_name": "Jakub",
    "last_name": "Rotschild",
    "password1": "SuperHeslo23",
    "password2": "SuperHeslo23"
}
```

### \- method: "POST" - [http://127.0.0.1:8000/api/auth/login/](http://127.0.0.1:8000/api/auth/login/)

Přihlášení (vrátí token).

```json
{
    "username": "jakub_student",
    "password": "SuperHeslo23"
}
```

### \- method: "POST" - [http://127.0.0.1:8000/api/auth/logout/](https://www.google.com/search?q=http://127.0.0.1:8000/api/auth/logout/)

Odhlášení (zneplatní token).

### \- method: "GET" - [http://127.0.0.1:8000/api/users/](http://127.0.0.1:8000/api/users/)

Získání users. Adminovi to vrátí všechny, normálnímu userovi všechny až na admina.

### \- method: "GET" - [http://127.0.0.1:8000/api/users/me/](https://www.google.com/search?q=http://127.0.0.1:8000/api/users/me/)

Získání detailu přihlášeného uživatele.

```json
{
    "id": 1,
    "username": "testuserrr",
    "email": "test@test.cz",
    "first_name": "miluju_patchovani",
    "last_name": "Novak",
    "role": "USER"
}
```

### \- method: "PATCH" - [http://127.0.0.1:8000/api/users/](http://127.0.0.1:8000/api/users/)\<id\>/patch\_user/

Patchne to, co zadáte. Admin patchuje kohokoliv, user (pokud by měl práva) sebe.

```json
{
    "first_name": "Pavel"
}
```

### \- method: "DELETE" - [http://127.0.0.1:8000/api/users/](http://127.0.0.1:8000/api/users/)\<id\>/delete\_user/

Smaže uživatele. Může jen Admin nebo uživatel sám sebe.

### \- method: "POST" - [http://127.0.0.1:8000/api/users/change\_password/](https://www.google.com/search?q=http://127.0.0.1:8000/api/users/change_password/)

Změna hesla pro přihlášeného uživatele.

```json
{
    "old_password": "SuperHeslo23",
    "new_password1": "NoveSuperHeslo24",
    "new_password2": "NoveSuperHeslo24"
}
```

### \- method: "GET" - [http://127.0.0.1:8000/api/users/](http://127.0.0.1:8000/api/users/)\<id\>/dashboard/

Vrátí statistiky uživatele (počet garantovaných kurzů, učených kurzů, zapsaných kurzů).

-----

## 2\. Courses (Kurzy)

### \- method: "GET" - [http://127.0.0.1:8000/api/courses/](http://127.0.0.1:8000/api/courses/)

Vrátí kurzy. Admin vidí všechny, Garant své + schválené, Ostatní jen schválené.

### \- method: "POST" - [http://127.0.0.1:8000/api/courses/](http://127.0.0.1:8000/api/courses/)

Vytvoří kurz a vás to tam hodí jako garanta.

```json
{
    "code": "IIS101",
    "title": "Informační systémy",
    "description": "Nejlepší předmět ever.",
    "price": 0.00,
    "capacity": 100,
    "auto_confirm": false
}
```

### \- method: "GET" - [http://127.0.0.1:8000/api/courses/](http://127.0.0.1:8000/api/courses/)\<id\>/

Detail jednoho kurzu.

### \- method: "PATCH" - [http://127.0.0.1:8000/api/courses/](http://127.0.0.1:8000/api/courses/)\<id\>/patch\_course/

Úprava kurzu (Garant nebo Admin).

```json
{
    "description": "Změna popisu, už to není nejlepší předmět."
}
```

### \- method: "DELETE" - [http://127.0.0.1:8000/api/courses/](http://127.0.0.1:8000/api/courses/)\<id\>/delete\_course/

Smazání kurzu (Garant nebo Admin).

### \- method: "POST" - [http://127.0.0.1:8000/api/courses/](http://127.0.0.1:8000/api/courses/)\<id\>/approve/

Schválení kurzu adminem (aby byl vidět pro ostatní).

### \- method: "POST" - [http://127.0.0.1:8000/api/courses/](http://127.0.0.1:8000/api/courses/)\<id\>/reject/

Zamítnutí kurzu adminem.

-----

## 3\. Course People (Lektoři a Studenti)

### \- method: "POST" - [http://127.0.0.1:8000/api/courses/](http://127.0.0.1:8000/api/courses/)\<id\>/add\_lecturer/

Přidá lektora do kurzu (Garant/Admin).

```json
{
    "lecturer_id": 5
}
```

### \- method: "POST" - [http://127.0.0.1:8000/api/courses/](http://127.0.0.1:8000/api/courses/)\<id\>/remove\_lecturer/

Odebere lektora z kurzu.

```json
{
    "lecturer_id": 5
}
```

### \- method: "DELETE" - [http://127.0.0.1:8000/api/courses/](http://127.0.0.1:8000/api/courses/)\<id\>/delete\_student/

Smazání studenta z kurzu (Garant nebo Admin).

### \- method: "POST" - [http://127.0.0.1:8000/api/courses/](http://127.0.0.1:8000/api/courses/)\<id\>/enroll/

Přihlášení studenta na kurz. Pokud je `auto_confirm` true, rovnou schváleno, jinak PENDING.

### \- method: "POST" - [http://127.0.0.1:8000/api/courses/](http://127.0.0.1:8000/api/courses/)\<id\>/approve\_enrollment/

Garant schválí studenta v kurzu.

```json
{
    "enrollment_id": 12
}
```

### \- method: "POST" - [http://127.0.0.1:8000/api/courses/](http://127.0.0.1:8000/api/courses/)\<id\>/reject\_enrollment/

Garant zamítne studenta.

```json
{
    "enrollment_id": 12
}
```

### \- method: "GET" - [http://127.0.0.1:8000/api/courses/](http://127.0.0.1:8000/api/courses/)\<id\>/list\_students/

Vrátí seznam studentů v kurzu (vidí Garant, Admin a Lektoři).

```json
[
    {
        "id": 1,
        "username": "testuserrr",
        "first_name": "miluju_patchovani",
        "last_name": "miluju_patchovaniprijmeni",
        "role": "APPROVED"
    },
    {
        "id": 5,
        "username": "testzefungujejmeno",
        "first_name": "",
        "last_name": "",
        "role": "PENDING"
    }
]
```

### \- method: "GET" - [http://127.0.0.1:8000/api/courses/](http://127.0.0.1:8000/api/courses/)\<id\>/my\_courses/

Vrátí seznam zapsaných kurzů.

```json
[
    {
        "id": 2,
        "code": "test",
        "title": "vetsitest",
        "guarantee": "testuserrr",
        "role": "APPROVED"
    }
]
```

-----

## 4\. Rooms (Místnosti)

### \- method: "GET" - [http://127.0.0.1:8000/api/rooms/](http://127.0.0.1:8000/api/rooms/)

Seznam všech místností.

```json
[
    {
        "id": 1,
        "name": "room1",
        "capacity": 20,
        "location": "Márnice (tam skoncim brzy aaa)"
    }
]
```

### \- method: "POST" - [http://127.0.0.1:8000/api/rooms/](http://127.0.0.1:8000/api/rooms/)

Vytvoří místnost (jen Admin).

```json
{
    "name": "A112",
    "capacity": 50,
    "location": "Božetěchova, 1. patro"
}
```

### \- method: "PATCH" - [http://127.0.0.1:8000/api/rooms/](http://127.0.0.1:8000/api/rooms/)\<id\>/patch\_room/

Upraví místnost (Admin).

### \- method: "DELETE" - [http://127.0.0.1:8000/api/rooms/](http://127.0.0.1:8000/api/rooms/)\<id\>/delete\_room/

Smaže místnost (Admin).

-----

## 5\. Terms (Výuka - Lekce/Zkoušky)

### \- method: "GET" - [http://127.0.0.1:8000/api/terms/](https://www.google.com/search?q=http://127.0.0.1:8000/api/terms/)

Seznam všech termínů výuky.

```json
[
    {
        "id": 1,
        "course": {
            "id": 3,
            "code": "testkurz3",
            "title": "vetsitest",
            "type": "",
            "description": "efwrwerwerwerewrwerwerewrwererI",
            "capacity": 30,
            "guarantee": {
                "id": 2,
                "username": "testadmina",
                "email": "",
                "first_name": "",
                "last_name": "",
                "role": "USER"
            },
            "approved": true,
            "price": "0.00",
            "lecturers": [],
            "auto_confirm": false,
            "enrolled_count": 2
        },
        "type": "LECTURE",
        "requires_registration": true,
        "capacity": 50,
        "room": 1,
        "start_time": "2023-10-01T10:00:00Z",
        "end_time": "2023-10-01T12:00:00Z"
    }
]
```

### \- method: "POST" - [http://127.0.0.1:8000/api/terms/](https://www.google.com/search?q=http://127.0.0.1:8000/api/terms/)

Vytvoření termínu (Garant/Admin). Kontroluje kolizi místnosti a času.

```json
{
    "course_id": 2,
    "room": 1,
    "type": "LECTURE",
    "start_time": "2025-11-21T10:00:00Z",
    "end_time": "2025-11-21T12:00:00Z",
    "capacity": 50,
    "requires_registration": true
}
```

### \- method: "PATCH" - [http://127.0.0.1:8000/api/terms/](https://www.google.com/search?q=http://127.0.0.1:8000/api/terms/)\<id\>/patch\_term/

Úprava termínu (Admin).

### \- method: "DELETE" - [http://127.0.0.1:8000/api/terms/](https://www.google.com/search?q=http://127.0.0.1:8000/api/terms/)\<id\>/delete\_term/

Smazání termínu (Admin).

### \- method: "GET" - [http://127.0.0.1:8000/api/terms/schedule/](https://www.google.com/search?q=http://127.0.0.1:8000/api/terms/schedule/)

Rozvrh přihlášeného studenta (vrátí termíny, na které je registrován).

-----

## 6\. Registrations (Registrace na konkrétní termíny)

### \- method: "GET" - [http://127.0.0.1:8000/api/registrations/](https://www.google.com/search?q=http://127.0.0.1:8000/api/registrations/)

Vrátí seznam mých registrací na termíny.

```json
[
    {
        "id": 2,
        "user": 3,
        "user_id": 3,
        "term": 1,
        "registered_at": "2025-11-20T16:06:32.067271Z",
        "grade": {
            "id": 1,
            "registration": 2,
            "registration_id": 2,
            "value": "90.50",
            "graded_at": "2025-11-20T16:12:58.218017Z",
            "graded_by": 2
        },
        "graded_by": [
            "testadmina"
        ]
    }
]
```

### \- method: "POST" - [http://127.0.0.1:8000/api/registrations/](https://www.google.com/search?q=http://127.0.0.1:8000/api/registrations/)

Registrace na konkrétní termín (lekci/zkoušku). Musíte být schválený student kurzu.

```json
{
    "term_id": 5
}
```

### \- method: "DELETE" - [http://127.0.0.1:8000/api/registrations/](https://www.google.com/search?q=http://127.0.0.1:8000/api/registrations/)\<id\>/delete\_registration/

Odhlášení z termínu.

-----

## 7\. Grades (Známky)

### \- method: "GET" - [http://127.0.0.1:8000/api/grades/](https://www.google.com/search?q=http://127.0.0.1:8000/api/grades/)

Admin vidí vše, Lektor své kurzy, Student své známky.

```json
[
    {
        "id": 1,
        "registration": 2,
        "registration_id": 2,
        "value": "90.50",
        "graded_at": "2025-11-20T16:12:58.218017Z",
        "graded_by": 2
    }
]
```

### \- method: "POST" - [http://127.0.0.1:8000/api/grades/](https://www.google.com/search?q=http://127.0.0.1:8000/api/grades/)

Lektor/Garant zadá známku studentovi (přes ID registrace na termín).

```json
{
    "registration": 15,
    "value": 95.50
}
```

### \- method: "PATCH" - [http://127.0.0.1:8000/api/grades/](https://www.google.com/search?q=http://127.0.0.1:8000/api/grades/)\<id\>/patch\_grade/

Oprava známky (Lektor/Garant).

```json
{
    "value": 100.00
}
```
