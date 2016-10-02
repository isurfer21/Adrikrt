# Adrikrt
अद्रिकृत refers to cloud-service, i.e., made to serve web-services to the app via REST based API.

**Setup**

```
$ npm install
```

**Run**

```
$ node app.js
```

**Usage**

_Login_

```
$ curl --data 'pl={"email":"abachan@gmail.com","password":"a1b2c3"}&cb=cors&ak=' http://localhost:3000/login/   
```

_Forgot_

```
$ curl --data 'pl={"email":"abachan@gmail.com","dob":"1947-08-15"}&cb=cors&ak=' http://localhost:3000/forgot/   
```

_Register_

```
$ curl --data 'pl={"firstname":"Amitabh","lastname":"Bachan","email":"abachan@gmail.com","password":"a1b2c3","dob":"1947-08-15"}&cb=cors&ak=' http://localhost:3000/register/   
```