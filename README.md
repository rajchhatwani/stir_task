# Twitter Trending Topics Scraper

This project automates the scraping of the top 5 trending topics from Twitter (X.com) using **Selenium WebDriver**. It stores the results in **MongoDB** and serves the data through an **Express.js** web server. The data can be accessed via a simple HTML interface.

---

## **ProxyMesh Issue**
Currently, **ProxyMesh** is not functioning properly due to connectivity and HTTPS restrictions. Therefore, the implementation falls back to using the **normal IP address**. To avoid detection and repeated logins, **cookies** are stored locally and reused across sessions. This reduces suspicious activity alerts and minimizes login attempts.

---

## **Setup Instructions**

### **1. MongoDB URI Setup**
1. Create a MongoDB database.  
2. Replace the `uri` in the code with your **MongoDB URI**:

```javascript
const uri = "mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
```
Replace `<username>` and `<password>` with your MongoDB credentials.

3. Create a database named **twitter_data** and a collection named **trends**. The script will automatically populate data in this collection.


### **2. ProxyMesh URI Setup (If Fixed)**
1. Obtain ProxyMesh details from your account.
2. Replace the following line in the code with your ProxyMesh URI:

```javascript
let proxy = 'USERNAME:PASSWORD@PROXY_ADDRESS:PORT';
```
Replace:
- **USERNAME** - ProxyMesh username
- **PASSWORD** - ProxyMesh password
- **PROXY_ADDRESS** - ProxyMesh proxy address (e.g., us-wa.proxymesh.com)
- **PORT** - ProxyMesh port (e.g., 31280)

3. Uncomment the proxy settings in the code if needed:
```javascript
options.addArguments(`--proxy-server=http://${proxy}`);
```
If ProxyMesh continues to fail, use the default IP without proxy.

---

## **Why CORS is Implemented?**
**CORS (Cross-Origin Resource Sharing)** is implemented to allow requests from different origins (e.g., localhost or external domains) to access the backend APIs securely. Without CORS, modern browsers block requests from different origins due to the **Same-Origin Policy**.

### **How CORS is Implemented?**
1. Install the **CORS** package:
```bash
npm install cors
```
2. Import and enable CORS in the Express server:
```javascript
const cors = require('cors');
app.use(cors());
```
3. CORS allows the HTML frontend to fetch data from the Express server running at a different origin, enabling seamless communication between client and server.

---

## **Key Features**
1. **Scraping Trends:** Logs in to Twitter, navigates to the explore page, and fetches the top 5 trending topics.
2. **Avoids Detection:** Reuses cookies to minimize suspicious activity and prevent frequent logins.
3. **MongoDB Integration:** Stores the scraped data along with a unique ID, timestamp, and IP address.
4. **Express Server:** Serves the data dynamically through an endpoint (`/get-trends`).
5. **HTML Interface:** Allows users to fetch and display results dynamically using JavaScript.

---

## **Endpoints**
1. **Run Scraper:**
```
GET http://localhost:3000/run-script
```
Runs the scraper and returns the latest data.

2. **Get Latest Trends:**
```
GET http://localhost:3000/get-trends
```
Fetches the most recent data stored in the database.

---

## **Usage**
1. Start MongoDB and the server:
```bash
mongod --dbpath ./data/db
node server.js
```
2. Open the HTML page in a browser and click **Fetch Trends** to get results.

---

## **Dependencies**
1. **selenium-webdriver** - Browser automation.
2. **mongodb** - Database integration.
3. **express** - HTTP server for data retrieval.
4. **uuid** - Unique ID generation.
5. **dns/net** - Proxy connectivity testing.
6. **fs** - File handling for cookies.
7. **cors** - Cross-origin resource sharing.

---

## **Known Issues**
1. **ProxyMesh Failure:** Current implementation bypasses ProxyMesh due to HTTPS restrictions. Replace the proxy configuration if resolved.

---

