# COLORS – LAMP Stack Web App

COLORS is a small web application built for COP 4331 (Processes for Object-Oriented Software Development) at UCF. A user logs in, then can **add** color names to their personal list and **search** the colors they have saved. It is a minimal example of a full LAMP stack: a static HTML/CSS/JavaScript frontend that calls a PHP JSON API, which reads and writes a MySQL database.

## Technologies

| Layer    | Technology |
|----------|------------|
| OS       | Linux (Ubuntu, DigitalOcean LAMP droplet) |
| Web server | Apache 2 |
| Database | MySQL |
| Backend  | PHP (with `mysqli` and prepared statements) |
| Frontend | HTML5, CSS3, vanilla JavaScript (`XMLHttpRequest`, JSON) |

## Repository structure

```
LampStack/
├── api/                    # PHP API endpoints (deployed to /var/www/html/LAMPAPI)
│   ├── Login.php           # POST {login, password} -> {id, firstName, lastName, error}
│   ├── AddColor.php        # POST {color, userId}   -> {error}
│   ├── SearchColors.php    # POST {search, userId}  -> {results[], error}
│   └── config.example.php  # Template for database credentials
├── public/                 # Static frontend (deployed to /var/www/html)
│   ├── index.html          # Login page
│   ├── color.html          # Add / search colors page
│   ├── css/styles.css
│   ├── js/code.js          # Calls the API and manages the session cookie
│   ├── js/md5.js           # MD5 helper for optional password hashing
│   └── images/
├── .gitignore
├── LICENSE.md
└── README.md
```

## Setup

These steps assume a Linux server with Apache, MySQL and PHP installed (for example the DigitalOcean "LAMP" marketplace droplet).

### 1. Create the database

Log in to MySQL (`mysql -u root -p`) and run:

```sql
CREATE DATABASE COP4331;
USE COP4331;

CREATE TABLE Users (
  ID        INT NOT NULL AUTO_INCREMENT,
  FirstName VARCHAR(50) NOT NULL DEFAULT '',
  LastName  VARCHAR(50) NOT NULL DEFAULT '',
  Login     VARCHAR(50) NOT NULL DEFAULT '',
  Password  VARCHAR(50) NOT NULL DEFAULT '',
  PRIMARY KEY (ID)
) ENGINE = InnoDB;

CREATE TABLE Colors (
  ID     INT NOT NULL AUTO_INCREMENT,
  Name   VARCHAR(50) NOT NULL DEFAULT '',
  UserID INT NOT NULL DEFAULT 0,
  PRIMARY KEY (ID)
) ENGINE = InnoDB;

-- Sample user for testing
INSERT INTO Users (FirstName, LastName, Login, Password) VALUES ('Test', 'User', 'TestUser', 'Test');
```

Then create a MySQL user for the API (choose your own username and password):

```sql
CREATE USER 'your_db_user' IDENTIFIED BY 'your_db_password';
GRANT ALL PRIVILEGES ON COP4331.* TO 'your_db_user'@'%';
```

### 2. Configure the API

Credentials are **not** stored in this repository. Create a local config file from the template:

```bash
cp api/config.example.php api/config.php
```

Edit `api/config.php` and set `DB_USER`, `DB_PASSWORD` (and `DB_HOST` / `DB_NAME` if different). `config.php` is ignored by Git.

### 3. Deploy the files

Copy the frontend to Apache's web root and the API to a `LAMPAPI` folder inside it:

```bash
sudo cp -r public/* /var/www/html/
sudo mkdir -p /var/www/html/LAMPAPI
sudo cp api/*.php /var/www/html/LAMPAPI/
```

The resulting layout on the server is:

```
/var/www/html/
├── index.html, color.html, css/, js/, images/
└── LAMPAPI/  Login.php, AddColor.php, SearchColors.php, config.php
```

The frontend calls the API through the relative path `/LAMPAPI` (see `urlBase` in `public/js/code.js`), so it works on any domain or IP address without code changes.

## Running and accessing the app

1. Open `http://<your-server-ip-or-domain>/` in a browser.
2. Log in with a user from the `Users` table (e.g. `TestUser` / `Test`).
3. On the colors page, type a color name and click **Add Color**, or type part of a name and click **Search Color** to list matching colors you have saved.
4. Click **Log Out** to end the session.

The API can also be tested directly with a tool such as Postman or `curl`:

```bash
curl -X POST http://<server>/LAMPAPI/Login.php \
     -H "Content-Type: application/json" \
     -d '{"login":"TestUser","password":"Test"}'
```

## Assumptions and limitations

- Users must be inserted into the database manually; there is no sign-up page.
- Passwords are stored and compared in plain text. `md5.js` is included and the hashing call is present but commented out in `code.js`; MD5 is also not a secure password hash, so this app should not be used with real credentials.
- The logged-in session is kept in a browser cookie that expires after 20 minutes; it is not validated by the server.
- API responses are built with string concatenation, so special characters (such as `"`) in names are not escaped.
- The app is served over plain HTTP unless HTTPS is configured separately on Apache.
- There is no update or delete functionality for colors.

## AI usage

The application code (frontend and PHP API) comes from the COP 4331 COLORS lab. An AI assistant (Claude Code, by Anthropic) was used to help organize this repository for submission: moving the files into the `api/` and `public/` structure, moving hard-coded database credentials into a Git-ignored `config.php`, replacing the hard-coded server IP with a relative API path, and drafting this README, the `.gitignore`, and the commit breakdown. All changes were reviewed by the author.

## License

This project is released under the MIT License. See [LICENSE.md](LICENSE.md).
