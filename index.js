// Import required modules
const { Builder, By, Key, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const { MongoClient } = require("mongodb");
const express = require("express");
const { v4: uuidv4 } = require("uuid"); // For generating unique IDs
const dns = require("dns");
const net = require("net");
const fs = require("fs");
const os = require("os");
const cors = require("cors");
// Proxy configuration - Verify proxy connectivity
// let proxy = "rajchhatwani39:rajchhatwani39@us-ca.proxymesh.com:31280"; // Replace with your ProxyMesh details
// async function testProxy(proxyAddress) {
//   const [host, port] = proxyAddress.split(":");
//   return new Promise((resolve, reject) => {
//     const socket = net.createConnection({ host, port: parseInt(port) }, () => {
//       console.log("Proxy connection successful");
//       socket.end();
//       resolve(true);
//     });
//     socket.on("error", (err) => {
//       console.error("Proxy connection failed:", err);
//       reject(false);
//     });
//   });
// }

// Validate Proxy before proceeding
// (async () => {
//   try {
//     await testProxy(proxy.split("@")[1]);
//   } catch (error) {
//     console.error("Proxy validation failed. Exiting script.");
//     process.exit(1);
//   }
// })();

let options = new chrome.Options();
// options.addArguments(`--proxy-server=https://${proxy}`);

// MongoDB connection details
const uri = "your_mongo_uri"; // Replace with your MongoDB URI
const client = new MongoClient(uri);

// for ip address

let ipAddress;
const networkInterfaces = os.networkInterfaces();

for (const interfaceName in networkInterfaces) {
  const interfaces = networkInterfaces[interfaceName];

  for (const iface of interfaces) {
    if (iface.family === "IPv4" && !iface.internal) {
      ipAddress = iface.address;
    }
  }
}
// Scrape Twitter Trends
async function scrapeTrends() {
  let driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();
  let uniqueID = uuidv4();
  let ipAddress = proxy.split("@")[1].split(":")[0]; // Extract IP address

  try {
    // Load cookies if available
    const cookiesPath = "./cookies.json";
    if (fs.existsSync(cookiesPath)) {
      const cookies = JSON.parse(fs.readFileSync(cookiesPath));
      await driver.get("https://x.com"); // Open Twitter to set cookies
      for (let cookie of cookies) {
        await driver.manage().addCookie(cookie);
      }
      await driver.navigate().refresh();
    } else {
      // Open Twitter login page
      await driver.get("https://x.com/login");

      // Log in to Twitter
      await driver
        .wait(until.elementLocated(By.name("text")), 10000)
        .sendKeys("Your_email", Key.RETURN);
      await driver.sleep(2000);

      // Check if 'password' field is valid and try alternate locator strategy if needed
      let passwordField;
      try {
        passwordField = await driver.wait(
          until.elementLocated(By.name("password")),
          10000
        );
      } catch (error) {
        console.warn(
          "Failed to locate password field by name. Trying alternate locator."
        );
        passwordField = await driver.wait(
          until.elementLocated(By.css('input[type="password"]')),
          10000
        );
      }
      await passwordField.sendKeys("your-password", Key.RETURN);

      await driver.wait(
        until.elementLocated(By.css('[aria-label="Home"]')),
        10000
      );

      // Save cookies for future use
      const cookies = await driver.manage().getCookies();
      fs.writeFileSync(cookiesPath, JSON.stringify(cookies));
    }

    // Navigate to trending section
    await driver.get("https://x.com/explore/tabs/trending");
    await driver.wait(
      until.elementLocated(
        By.css('[aria-label="Timeline: Explore"] div span[dir="ltr"]')
      ),
      10000
    );

    // Scrape data with aria-label="Timeline: Explore" and dir='ltr'
    let trends = await driver.findElements(
      By.css('[aria-label="Timeline: Explore"] div span[dir="ltr"]')
    );
    let trendingTopics = [];
    for (let trend of trends) {
      let text = await trend.getText();
      if (text) trendingTopics.push(text);
    }

    let finalData = trendingTopics.slice(0, 5);
    console.log("Top 5 Trending Topics:", finalData);
    await saveToDB(uniqueID, finalData, ipAddress);
    return { uniqueID, finalData, ipAddress, timestamp: new Date() };
  } catch (error) {
    console.error("Error during scraping:", error);
  } finally {
    await driver.quit();
  }
}

// Save results to MongoDB
async function saveToDB(uniqueID, data) {
  try {
    await client.connect();
    const database = client.db("twitter_data");
    const collection = database.collection("trends");

    let result = await collection.insertOne({
      _id: uniqueID,
      trends: data,
      timestamp: new Date(),
      ip: ipAddress,
    });

    console.log("Data saved:", result.insertedId);
  } catch (error) {
    console.error("Database Error:", error);
  } finally {
    await client.close();
  }
}

// Express Server for Display
const app = express();
const port = 3000;
app.use(cors());
app.get("/run-script", async (req, res) => {
  const result = await scrapeTrends();
  result["ipAddress"] = ipAddress;
  res.json(result);
});

app.get("/get-trends", async (req, res) => {
  try {
    await client.connect();
    const database = client.db("twitter_data");
    const collection = database.collection("trends");
    const data = await collection
      .find({})
      .sort({ timestamp: -1 })
      .limit(1)
      .toArray();

    if (data.length > 0) {
      res.json(data[0]);
    } else {
      res.json({ message: "No data found." });
    }
  } catch (error) {
    res.status(500).send("Error fetching data.");
  } finally {
    await client.close();
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
