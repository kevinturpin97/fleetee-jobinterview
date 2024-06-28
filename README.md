# Où en étais-je ?

Youtube Demo: [https://youtu.be/z96DM3MTYpg](https://youtu.be/z96DM3MTYpg)

## 1. Requirements
- PHP version 8+
- Composer version 2+
- Symfony 7+ (flex usage)
- MariaDB 10.5+
- NPM 9+
- React 18+ (create without Webpack, using Vite for faster builds)

## 2. Installation
1. Clone the repository
2. Install dependencies
    - `cd symfony && composer install`
    - `cd react && npm install`
3. Edit the `.env` file in the `symfony` directory to configure the database connection
4. Create the database
    - `cd symfony && php bin/console make:migration && php bin/console d:m:m`
5. Bonus: load fixtures
    - `cd symfony && php bin/console d:f:l`
6. Start the server
    - Symfony
        - using CLI
            - `cd symfony && symfony server:start`
        - using vanilla
            - `cd symfony/public && php -S localhost:8000`
    - React
        - First, edit `src/assets/js/constants.js` to set the API URL
        - Then build or run the dev server
            - `cd react && npm run build && php -S localhost:8001 -t dist`
            - `cd react && npm run dev`

## 3. Fixtures:
Ensure to load the fixtures to have some data to work with.

- User: 
    - email: `demo@test.fr`, password: `demo`