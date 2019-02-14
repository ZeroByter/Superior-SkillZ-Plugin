const readline = require("readline");
const path = require("path");
const fs = require("fs");
const watch = require("node-watch");
const https = require("https");
const socket = require("socket.io");

const isDirectory = source => fs.lstatSync(source).isDirectory();
const getDirectories = source =>
  fs
    .readdirSync(source)
    .map(name => path.join(source, name))
    .filter(isDirectory);

//setup certificates
const privateKey =
  "-----BEGIN RSA PRIVATE KEY-----\nMIICXAIBAAKBgQDHuz6myrzBGVkcxPhYU8kPHSoie9+pTPOKChmBiuoaFjsPfZii\nnlea0WxNC91NWekR9MubJ1cXJlq4/6gphGbwZmR3iwVwW9nNLXGCxUSxCSDbgay7\neMci4O/hLfF4SSp9ZA2fTfXpMuAiVZGFMsOvvIeytut240t9o90OXz7iSQIDAQAB\nAoGAUTZ5yyg0h+/epCwTLxcicdrR/yOPVi/L9x0UMfBiMClJ6oqPPdBUnsb42nsw\niPs+Ieb/wx7D8s3NpduObRNBJ1Xn1rRA5klxoF0/aKF4gssKJxBHnAL884DahF+D\ni0f850Ky+/xgsZXidOS1RCflRknGFvCtsJ0kApdKQvHQ4mECQQD9S2cXSrrYKTD6\n3J+jEUXKz+cC5MtmFM9HtxLukZLMJ3R+j6RuUONFU33mVK8T2Z972cutmTHG8t/W\n9PNv9hf7AkEAyd1hpbAn2bCrbOpyJmq2cv2MaW2rkkO/mWUF8nHadtyddWru0E5G\nWFZbWsYWyDWg0uPY1I4gbJ0sLcXOlGgHiwJAMD/gz2sI1IxkLCVCs4lixhN8aeyz\nYiqsoXiaPp+0WvdZFZK/O9RktpwE649OGnXmD22ZguQfu0ogoY3foYA7aQJBAMMR\nHOUhfsDMCjurqjcZc8lW3jKa+erTcPjoOID6KGQn+DiY5sGAglWmzYzAUw+RUyG3\nb7amyQpsL17kASZECNUCQAcjn5CeYUS5Qo48n3acsyzM0ljW2v2MtWNAPCJgkRZt\nE7TA+f7UQ0I/nwN7zLG8tKiT9yqCxaLEUOnauxQc1KU=\n-----END RSA PRIVATE KEY-----";
const certificate =
  "-----BEGIN CERTIFICATE-----\nMIICATCCAWoCCQCMoU6Sw9HYRjANBgkqhkiG9w0BAQsFADBFMQswCQYDVQQGEwJB\nVTETMBEGA1UECAwKU29tZS1TdGF0ZTEhMB8GA1UECgwYSW50ZXJuZXQgV2lkZ2l0\ncyBQdHkgTHRkMB4XDTE3MDkwNDEzNDc1MFoXDTE4MDkwNDEzNDc1MFowRTELMAkG\nA1UEBhMCQVUxEzARBgNVBAgMClNvbWUtU3RhdGUxITAfBgNVBAoMGEludGVybmV0\nIFdpZGdpdHMgUHR5IEx0ZDCBnzANBgkqhkiG9w0BAQEFAAOBjQAwgYkCgYEAx7s+\npsq8wRlZHMT4WFPJDx0qInvfqUzzigoZgYrqGhY7D32Yop5XmtFsTQvdTVnpEfTL\nmydXFyZauP+oKYRm8GZkd4sFcFvZzS1xgsVEsQkg24Gsu3jHIuDv4S3xeEkqfWQN\nn0316TLgIlWRhTLDr7yHsrbrduNLfaPdDl8+4kkCAwEAATANBgkqhkiG9w0BAQsF\nAAOBgQBNaRc76ptzHbQw+Pnrz5Yt0pgGDer3S88fuMpQqrgr6wKRE0zSiYh0Vz4S\nDo5LRC+T60/kAQkcKJK5oD3/T2X22Vfxu8iiOSceobjK97Bs3zxoaNzBYQX6nOtY\nfoW7kf5paa3WvsZAJa2yn70J1QnC7xrJxkUB8JA3T6w4xY+GUw==\n-----END CERTIFICATE-----\n";

const credentials = { key: privateKey, cert: certificate };

//setup readline
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let config = {};

function AskUsedLanguage() {
  rl.question(
    "What language do you code in? (possible options: py/cs/js/java) ",
    answer => {
      if (
        answer === "py" ||
        answer === "cs" ||
        answer === "js" ||
        answer === "java"
      ) {
        //write new config
        config = { language: answer };
        fs.writeFileSync("./config.json", JSON.stringify(config), {
          flag: "w"
        });

        StartServer();
      } else {
        console.log("That is not a correct language/file ending!");
        AskUsedLanguage();
      }
    }
  );
}

//Starting basic HTTPS server (socket.io server isn't started yet, it starts in StartServer)

const app = require("express")(); //launch express

const httpsServer = https.createServer(credentials, app);

httpsServer.listen(50000);

if (fs.existsSync("./config.json")) {
  config = JSON.parse(fs.readFileSync("./config.json"));

  StartServer();
} else {
  console.log("No 'config.json' file detected! Entering first time setup...");
  AskUsedLanguage();
}

//Force https
app.use(function(req, res, next) {
  if (!req.secure) {
    return res.redirect(["https://", req.get("Host"), req.url].join(""));
  }
  next();
});

app.get("/", function(_, res) {
  res.sendFile(__dirname + "/index.html");
});

function StartServer() {
  console.log(`Using language '${config.language}' files`);
  console.log(`Using '${config.directory}' directory`);

  const watcher = watch(`./${config.directory}`, { recursive: true });

  const walkSync = function(dir, fileEnding, filelist) {
    const path = path || require("path");
    const fs = fs || require("fs"),
      files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function(file) {
      if (fs.statSync(path.join(dir, file)).isDirectory()) {
        filelist = walkSync(path.join(dir, file), fileEnding, filelist);
      } else {
        if (file.endsWith(fileEnding)) {
          filelist.push(path.join(dir, file));
        }
      }
    });
    return filelist;
  };

  function UploadFiles() {
    let filesData = {};

    const allFilePaths = walkSync(
      `./${config.directory || ""}`,
      `.${config.language}`
    );
    allFilePaths.forEach(function(filePath) {
      const fileName = path.basename(filePath);
      if (
        !filePath.startsWith(`${config.directory}/elf_kingdom/`) &&
        !filePath.startsWith(`${config.directory}/__init__.py`) &&
        !filePath.startsWith(`${config.directory}/.vscode/`)
      ) {
        if (
          !fileName.startsWith("TemporaryGeneratedFile_") &&
          fileName !== "AssemblyInfo.cs"
        ) {
          filesData[fileName] = fs.readFileSync(filePath, "utf8");
        }
      }
    });

    io.emit("upLoadDir", filesData);
  }

  let enableFileWatcher = true;

  watcher.on("change", function(_, filename) {
    if (enableFileWatcher && filename.endsWith(`.${config.language}`)) {
      //if the user is still connected
      console.log("Detected file change, uploading to webkit...");

      UploadFiles();

      enableFileWatcher = false;

      setTimeout(function() {
        enableFileWatcher = true;
      }, 500);
    }
  });

  const io = socket(httpsServer);

  io.on("connection", function(socket) {
    //console.log("a user connected")

    let madeAllowDownloadDecision = false;
    let allowDownload = false;

    currentId = socket.id;

    //emit to user the current dir
    io.emit("showDirs", {
      dirs: ["Source (location of the .exe)", ...getDirectories("./")]
    });

    //emit the config data
    io.emit("GetConfig", config);

    //if the web client has set a new language
    socket.on("SetLanguage", function(data) {
      config.language = data;
      fs.writeFileSync("./config.json", JSON.stringify(config), { flag: "w" });

      console.log(`Now using language '${config.language}' files`);
    });

    //once the user confirms the dir he chose, we send it back to him
    socket.on("dirWasSet", function(data) {
      //io.sockets.connected[currentId].emit("dirWasSet", {dirName: [JSON.parse(data).dirName]})
      io.emit("dirWasSet", { dirName: [JSON.parse(data).dirName] });

      config.directory = JSON.parse(data).dirName;
      fs.writeFileSync("./config.json", JSON.stringify(config), { flag: "w" });
      console.log(`Now using folder '${config.directory}'`);
    });

    //here the user chooses whether to upload or download the code, we handle these events
    //user wants to upload files from the working station to the webkit
    socket.on("upLoadDir", function(data) {
      if (!madeAllowDownloadDecision) {
        madeAllowDownloadDecision = true;
        allowDownload = false;
      }

      UploadFiles();
    });

    //user wants to download files from the webkit to our working station
    socket.on("downLoadDir", function(data) {
      if (!madeAllowDownloadDecision) {
        madeAllowDownloadDecision = true;
        allowDownload = true;
      }

      //console.log(`got downLoadDir, allowDownload = ${allowDownload}`);
      if (allowDownload) {
        data = JSON.parse(data);

        Object.keys(data).forEach(function(key) {
          const val = data[key];

          fs.appendFileSync(`./${config.directory || ""}` + key, val, {
            flag: "w"
          });
        });
      }
    });
  });
}
