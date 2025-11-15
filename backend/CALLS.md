## 1. registrace a users


### - method: "POST" - http://127.0.0.1:8000/api/auth/registration/       
```input:
{
    "username": "testzefungujeasdjmeno",
    "first_name": "Jakub",
    "last_name": "Rotschild",
    "password1": "SuperHeslo23",
    "password2": "SuperHeslo23"
}
```
### - method: "POST" - http://127.0.0.1:8000/api/auth/login/       
```input:
{
    "username": "testzefungujeasdjmeno",
    "password": "SuperHeslo23"
}
```

### - method: "GET" - http://127.0.0.1:8000/api/users/
Získání users, adminovi to vrati vsechny, normalnimu userovi jen jeho
### - method: "GET" - http://127.0.0.1:8000/api/users/me
ziskani sebe
```output:
{
    "id": 1,
    "username": "testuserrr",
    "email": "",
    "first_name": "miluju_patchovani",
    "last_name": "",
    "role": "USER"
}
```
### - method: "PATCH" - http://127.0.0.1:8000/api/users/<id>/patch_user/       
patchne to co zadate ze chcete patchnout, admin patchuje
```input:
{
    "first_name": "testzefungujeasdjmeno"
}
```

## 2. Courses
### - method: "GET" - http://127.0.0.1:8000/api/courses/
vrati kurzy - admin vsechny, garant ty co garantuje a ty co jsou approved, zbytek vidi jen ty approved
```outnput:
{
        "id": 2,
        "code": "test",
        "title": "vetsitest",
        "description": "efwrwerwerwerewrwerwerewrwererI",
        "capacity": 30,
        "guarantee": 1,
        "approved": false
    },
    ```
### - method: "PATCH" - http://127.0.0.1:8000/api/courses/<id>/patch_course/       
patchne to co zadate ze chcete patchnout, admin/garant patchuje
```input:
{
    "code": "IIS42"
}
```
### - method: "DELETE" - http://127.0.0.1:8000/api/courses/<id>/delete_course/       
patchne to co zadate ze chcete patchnout, admin/garant patchuje
### - method: "POST" - http://127.0.0.1:8000/api/courses/
vytvori kurz a vas to da jako garanta
```input:
{
    "code": "test",
    "title": "vetsitest",
    "description": "efwrwerwerwerewrwerwerewrwererI"
}
```
### - method: "POST" - http://127.0.0.1:8000/api/courses/<id>/approve
schvaleni kurzu adminem

### - method: "POST" - http://127.0.0.1:8000/api/courses/<id>/reject
zamitnuti kurzu adminem



## 3. Rooms
### - method: "POST" - http://127.0.0.1:8000/api/rooms/
vytvori mistnost (admin muze jenom)
```input:
{
    "name": "room1",
    "capacity": "20",
    "location": "Márnice (tam skoncim brzy aaa)"
}
```