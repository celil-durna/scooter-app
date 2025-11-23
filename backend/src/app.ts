/**
 *  In dieser Datei konfigurieren wir einen Express Webserver, der es uns ermöglicht,
 *  verschiedene Routen anzugeben und zu programmieren.
 *  Hier verzichten wir auf die Klassendefinition, da diese nicht nötig ist.
 *
 *  Weiterführende Links:
 *  https://expressjs.com/en/starter/basic-routing.html
 */

import errorHandler from 'errorhandler';
import express from 'express';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { ApiController } from './api';
import { AuthController } from './auth';
import { ProductController } from './product';
import { ScooterController } from './scooter';
import { Product } from './models/product';
import { Scooter } from './models/scooter';
import Database from './database';
import { OptionController } from './option';
import { PayController } from './pay';
import { BookingController } from './booking';
import { ReviewController } from './review';

// Express server instanziieren
const app = express();

/**
 *  Express Konfiguration.
 *  Normalerweise benutzt man Port 80 für HTTP (d.h. der Server wäre unter http://localhost erreichbar),
 *  aber da Ports unter 1024 nur von Administratoren geöffnet werden können, benutzen wir hier Port 8000.
 *  D.h. der Server ist unter http://localhost:8000 erreichbar. Für das Frontend werden alle Anfragen an
 *  '/api/' automatisch an diesen Server weitergeleitet (siehe "proxy.conf.json" im Frontend Projekt).
 */
app.set('port', 8000);

// "JSON" Daten verarbeiten falls der Request zusätzliche Daten im Request hat
app.use(express.json());
// "UrlEncoded" Daten verarbeiten falls in der Request URL zusätzliche Daten stehen (normalerweise nicht nötig für Angular)
app.use(express.urlencoded({ extended: true }));
// Wir erlauben alle "Cross-Origin Requests". Normalerweise ist man hier etwas strikter, aber für den Softwareprojekt Kurs
// erlauben wir alles um eventuelle Fehler zu vermeiden.
//app.use(cors({ origin: '*' }));

app.use(
  cors({
    origin: 'http://localhost:4200', // URL Ihrer Frontend-Anwendung
    credentials: true, // CORS-Einstellung, die das Senden von Cookies erlaubt
  })
);

app.use(cookieParser());

Database.synchronizeTables();

//Zugriff auf die Scooter/Product sind dadurch über '/api/img' möglich
//'path.join' fügt Pfadsegmente zu einem einzigen Pfad zusammen
//'__dirname' ist globale Variable in Node.js, die Verzeichnis des aktuell ausgeführten Skripts enthält
//path.join(__dirname, '../img') kombiniert den aktuellen Verzeichnispfad mit '../img', um den absoluten Pfad zum img-Verzeichnis zu erstellen.
//Quelle: https://expressjs.com/en/starter/static-files.html#serving-static-files-in-express
app.use('/api/img', express.static(path.join(__dirname, '../img/products')));

/**
 *  API Routen festlegen
 *  Hier legen wir in dem "Express" Server neue Routen fest. Wir übergeben die Methoden
 *  unseres "ApiControllers", die dann aufgerufen werden sobald jemand die URL aufruft.
 *  Beispiel
 *  app.get('/api', api.getInfo);
 *       ↑     ↑          ↑
 *       |     |     Diese Methode wird aufgerufen, sobald ein Nutzer die angebene
 *       |     |     URL über einen HTTP GET Request aufruft.
 *       |     |
 *       |   Hier definieren sie die "Route", d.h. diese Route
 *       |   ist unter "http://localhost/api" verfügbar
 *       |
 *   Für diese Route erwarten wir einen GET Request.
 *   Auf derselben Route können wir auch einen POST
 *   Request angeben, für den dann eine andere Methode
 *   aufgerufen wird.
 *
 *  Weiterführende Links:
 *  - Übersicht über verschiedene HTTP Request methoden (GET / POST / PUT / DELETE) https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods
 *  - REST Architektur: https://de.wikipedia.org/wiki/Representational_State_Transfer
 *
 *  Bitte schaut euch das Tutorial zur Backend-Entwicklung an für mehr Infos bzgl. REST
 */

const auth = new AuthController();
const api = new ApiController();
const opt = new OptionController();
export const pay = new PayController();
const prod = new ProductController();
const scoot = new ScooterController();
const booking = new BookingController();
const review = new ReviewController();

//AUTH-part
//app.all('/api/*', auth.authorize.bind(auth)); // middleware //Nicht löschen
app.post('/api/login', auth.login.bind(auth));
app.get('/api/auth', auth.getAuth.bind(auth));
app.delete('/api/logout', auth.logout.bind(auth));
app.post('/api/register', auth.register.bind(auth));

//OPTIONS-Part
app.post('/api/options', opt.postOption.bind(auth));
app.put('/api/options', opt.putOption.bind(auth));
app.get('/api/options', opt.getOptionById.bind(auth));

app.get('/api/userinfo', auth.getUserInfo.bind(auth));
app.put('/api/userinfo', auth.updateUserInfo.bind(auth));

//PRODUCT-Part
app.get('/api/products/:id', prod.getProductById);
app.get('/api/products/name/:name', prod.getProductByName);
app.get('/api/products', async (req, res) => {
  res.json(await Product.findAll());
});

//SCOOT-Part
app.get('/api/scooters/:id', scoot.getScooterById);

//API-Part
app.get('/api', api.getInfo);
app.get('/api/dafina-kastrati', api.getDafinaKastratiInfo);
app.get('/api/jonas-heilig', api.getJonasHeiligInfo);
app.get('/api/naser-thaqi', api.getNaserThaqiInfo);
app.get('/api/celil-durna', api.getCelilDurnaInfo);
app.get('/api/mojtaba-maleknejad', api.getMojtabaMalekNejadInfo);
app.get('/api/michael-huber', api.getMichaelHuberInfo);
app.post('/api/name/:id', api.postNameInfo);
// app.get('/api  /scooters/:id', api.getScooterInfo); // wird benötigt

// Für scooter-map
app.get('/api/scooters', async (req, res) => {
  res.json(await Scooter.findAll());
});

// Falls ein Fehler auftritt, gib den Stack trace aus
if (process.env.NODE_ENV === 'development') {
  app.use(errorHandler());
}

//PAY-Part
app.post('/api/addPayment', pay.addPayment.bind(pay));
app.get('/api/getPaymentMethods', pay.getPaymentMethods.bind(pay));
app.delete('/api/deletePayment', pay.deletePaymentMethod.bind(pay));
app.get('api/validatePayment', pay.validatePayment.bind(pay));
app.get('api/transactionPayment', pay.transactionPayment.bind(pay));

//BOOKING-Part
app.post('/api/bookings', booking.createBooking.bind(booking));
app.get('/api/available-scooters', booking.getAvailableScooters.bind(booking)); // alle nicht-gebuchten Scooter


//REVIEW-Part
app.post('/api/createReview', review.createReview.bind(review));
app.delete('/api/deleteReview', review.deleteReview.bind(review));
app.get('/api/getBookedBefore', review.getBookedBefore.bind(review));
app.get('/api/bookings', booking.getBookingsByUserId.bind(booking));
app.get('/api/hasReviewed', review.hasUserReviewed.bind(review));
app.get('/api/reviews/scooter/:scooterId', review.getReviewsByScooterId.bind(review));
app.post('/api/likeReview', review.likeReview.bind(review));
app.post('/api/unlikeReview', review.unlikeReview.bind(review));
app.get('/api/isReviewLiked', review.isReviewLiked.bind(review));
app.post('/api/updateReview', review.updateReview.bind(review));


/**
 *  Dateien aus dem "public" und "img" Ordner werden direkt herausgegeben.
 *  D.h. falls eine Datei "myFile.txt" in dem "public" Ordner liegt, schickt der Server
 *  diese Datei wenn die "http://localhost/myFile.txt" URL aufgerufen wird.
 *  Dateien, die im 'img' Ordner liegen, können über den Pfad 'http://localhost/img/'
 *  abgerufen werden.
 *
 *  Das 'frontend/' Projekt wurde so konfiguriert, dass der 'build' Befehl (bzw. 'npm run build')
 *  im Frontend Projekt die 'transpilierten' Dateien in den 'public' Ordner des backend Projekt legen.
 *  Das kann nützlich sein, falls das ganze Projekt via Docker laufbar sein soll
 *  (erst nach Aushandeln für Bonuspunkte via User Story!)
 */
app.use('/', express.static('public'));
app.use('/img', express.static('img'));

/**
 *  Hier wird die "default Route" angegeben, d.h. falls der Server nicht weiß wie er auf "/random-request" antworten soll
 *  wird diese Methode aufgerufen. Das Frontend Angular hat selbst ein eigenes Routing, weswegen wir immer die "index" Seite
 *  von Angular schicken müssen. Falls eine der zuvor angegebenen Routen passt, wird diese Methode nicht aufgerufen.
 *  Diese Route funktioniert erst, sobald der 'build' Schritt im Frontend ausgeführt wurde und ist nur von Relevanz, falls
 *  das Projekt via Docker laufbar sein soll (siehe oben).
 */
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Wir machen den konfigurierten Express Server für andere Dateien verfügbar, die diese z.B. Testen oder Starten können.
export default app;
