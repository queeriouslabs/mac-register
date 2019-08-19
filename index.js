const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const path = require("path");
const shellscape = require("shell-escape");

const ip6addr = require("ip6addr");
const { exec } = require("child_process");


const app = express();
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/register", (req, res) => {
    const { msg, name } = req.body;
    const { remoteAddress: ip } = req.connection;
    const addr = ip6addr.parse(ip);
    const ipv4 = addr.toString({ format: "v4" });

    exec(`nmap -sn ${ipv4} | grep "MAC Address" | sed "s/MAC Address\: //"`, (err, stdout_, stderr) => {
        if (err != null) {
            console.error(err);
            return res.status(500).send("Something went wrong.");
        }

        const out = stdout_.toString();
        console.log(ipv4, out);
        const [ mac ] = out.split(" ");

        const obj = { name, msg, mac };
        const str = shellscape([JSON.stringify(obj)]);

        exec(`echo ${str} >> people.txt`, (err, stdout_, stderr) => {
            if (err != null) {
                console.log(err);
                return res.status(500).send("Something went wrong.");
            }

            res.send(`Registered message ${msg} for mac address ${mac}`);
        });
    });
});

console.log("Server starting");
app.listen(8080, () => {
    console.log("Server listening on port 8080");
});
