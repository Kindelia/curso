const express = require('express');
const app = express();
const port = 12345;
const fs = require("fs").promises;
const bodyParser = require("body-parser");
const exec = require("promise-exec");

(async () => {
  console.log(await hvm("(Main) = (S (S Z))"));
})();


async function hvm(code) {
  try {
    var file = "./tmp/" + (Math.floor(Math.random() * (2 ** 48))) + ".hvm";
    await fs.writeFile(file, code);
    var result = (await exec("/Users/v/.cargo/bin/hvm r " + file))[0];
    var result = result.split("\n");
    var result = result[result.length - 2];
    return result;
  } catch (e) {
    return null;
  }
}

async function get_problem() {
  var numb = (await fs.readFile("./../problem/!show", "utf8")).replace(/\n/g,"");
  var file = await fs.readFile("./../problem/"+numb+".hvm", "utf8");
  return file;
}

function filter_problem(problem) {
  return problem.split("\n").filter(x => x.slice(0,3) !== "//~").join("\n");
}

function extract_tests(problem) {
  var tests = [];
  var lines = problem.split("\n");
  for (var i = 0; i < lines.length; ++i) {
    var line = lines[i];
    if (line.slice(0,3) === "//-" || line.slice(0,3) === "//~") {
      var split = line.indexOf("=");
      var input = line.slice(4, split - 1).trim();
      var output = line.slice(split + 1).trim();
      tests.push([input, output]);
    }
  }
  return tests;
}

app.use(bodyParser.json());

app.get('/', async (req, res) => {
  var file = await fs.readFile("./index.html", "utf8");
  res.send(file);
});

app.get('/problem', async (req, res) => {
  res.send(filter_problem(await get_problem()));
});

app.post('/answer', async (req, res) => {
  function ease(x) {
    return x.replace(/[()]/g,"");
  }
  
  var answer = req.body.answer;

  var problem = await get_problem();

  var tests = extract_tests(problem);
  var correct = true;
  for (var i = 0; i < tests.length; ++i) {
    var code = problem + "\n" + answer + "\nMain = " + tests[i][0];
    var result = await hvm(code);
    //console.log("Equal:");
    //console.log("- " + ease(tests[i][1]))
    //console.log("- " + ease(result));
    if (ease(tests[i][1]) !== ease(result)) {
      correct = false;
    }
  }

  res.send({correct});
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});
