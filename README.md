# Binioufous

#### To install first:

```
composer require symfony/webpack-encore-bundle
rm -rf node_modules
npm install
```

#### To compile and launch:

* PHP Symfony server
```
php -S localhost:8000 -t public
```

* Webpack Encore (Assets)
```
yarn encore dev --watch
```
