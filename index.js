const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const path = require("path");
const { exec } = require("child_process");

const app = express();
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/register", (req, res) => {
	const { msg } = req.body;
    const { remoteAddress: ip } = req.connection;

	exec(`nmap -sn ${ip} | grep "MAC Address" | sed "s/MAC Address\: //"`, (err, stdout_, stderr) => {
        if (err != null) {
			console.error(err);
			return res.status(500).send("Something went wrong.");
		}

		const [ mac ] = stdout_.toString().split(" ");

		res.send(`Registered message ${msg} for mac address ${mac}`);
	});
});

app.listen(8080);
