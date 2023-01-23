# StorySurf 

Социальная сеть "StorySerf".

Предназначена для агрегации постов. Позволяет пользователям:
- создавать свои посты с текстом и изображениями;
- оценивать чужие посты;
- искать посты и пользователей социальной сети;
- подписываться на пользователей с целью:
    - получения уведомлений о их новых постах;
    - получения списка постов от подписанных пользователей;

# BackEnd: стэк:

- платформа сервера: NodeJS + Express
- база данных: MongoDB
- модули для авторизации: JSONWebToken, bcrypt, cookieParser
- прочее: CORS, Nodemon

# BackEnd: описание
Данный API разработан для соединениея пользовательского интерфейса и базы данных. База данных хранить в себе данные о пользователях, постах и токенах.
Загрузка изображений также осуществляется в базу данных в кодировке Base64 с предварительным сжатием до JPEG.
Авторизация пользователя происходит с помощью REFRESH_TOKEN и ACCESS_TOKEN. С помощью них же происходит подтверждение возможности пользователя изменять свои данные.
В параметрах окружения Environment храятся:
- порт сервера
- URL с данными авторизации для подключения к базе данных
- ключ JWT аксесс-токена
- ключ JWT рефреш-токена
- доверенный URL приложения пользовательского интерфейса

# BackEnd: API:
API_URL = https://storysurf-api.onrender.com/api

- AUTHORIZATION:
    - POST API_URL/auth/register
    - POST API_URL/auth/login
    - POST API_URL/auth/logout
    - POST API_URL/auth/refresh 
- POSTS:
    - POST: API_URL/posts/add
    - PUT: API_URL/posts/like/:id
    - PUT: API_URL/posts/like/:id
    - DELETE: API_URL/posts/delete/:id
    - POST: API_URL/posts/get_posts
- USERS:
    - GET: API_URL/users/get_one/:id
    - GET: API_URL/users/get_one_avatar/:id
    - POST: API_URL/users/get_many
    - PUT: API_URL/users/update/:id
    - DELETE: API_URL/users/delete/:id
    - PUT: API_URL/users/follow/:id
    - PUT: API_URL/users/unfollow/:id
    - POST: API_URL/users/togglePostBookmark

# Дальнейшие улучшения:
- добавление уведомлений о их новых постах;
- добавление системы мессенджера;
- добавление системы комментариев;


