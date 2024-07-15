
# Proyecto backend

Sebastián Araus


## Correr localmente

clonar el repositorio,
ir al repositorio

Instalar las dependencias

```bash
  npm install
```

Iniciar el servicio

```bash
  npm run start
```


## API Reference

### getAllUsers
```http
  GET http://localhost:3001/api/v1/users/getAllUsers
```
### getfindUsers

```http
  GET http://localhost:3001/api/v1/users/findUsers

```
| Parameter | Type     | Description                |Ejemplo            |
| :-------- | :------- | :------------------------- |:------------------------- |
| `name` | `string` | Nombre del usuario  |o                  |
| `status` | `boolean` | Estatus del usuario |true              |
| `after` | `string` | Hayan iniciado sesión después de una fecha especificada|2024-07-3         |
| `before` | `string` | Hayan iniciado sesión antes de una fecha especificada |2024-07-1         |

### postbulkCreate

```http
   POST http://localhost:3001/api/v1/users/bulkCreate
```
#### body 
```
{
  "users": [
    {
      "name": "Tomas Roncero",
      "email": "tomas.roncer.com",
      "password": "contra123456",
      "cellphone": "+56123343454"
    },
    {
      "name": "Tony Morata",
      "email": "Tony.Morata@gmail.com",
      "password": "contra123456",
      "cellphone": "+56143433354"
    }
  ]
}

```