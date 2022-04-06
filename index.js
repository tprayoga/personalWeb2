const express = require("express");
const app = express();
const port = 8800;

const db = require("./connection/db");

app.set("view engine", "hbs");

app.use("/public", express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: false }));

let projects = [
  {
    title: "contoh",
    descr: "Teguh",
    duration: [],
  },
];

app.get("/", function (req, res) {
  res.send("hello");
});

app.get("/home", function (req, res) {
  console.log(projects);

  db.connect(function (err, client, done) {
    if (err) throw err;

    client.query("SELECT * FROM tb_project", function (err, result) {
      if (err) throw err;
      let data = result.rows;

      data = data.map(function (item) {
        return {
          ...item,
          title: item.title,
          descr: item.description,
          start: item.startDate,
          end: item.endDate,
          duration: getDuration(item.startDate, item.endDate),
          node: checkboxes(item.technologies[0]),
          react: checkboxes(item.technologies[1]),
          next: checkboxes(item.technologies[2]),
          type: checkboxes(item.technologies[3]),
        };
      });
      res.render("index", { projects: data });
      console.log(data);
    });
  });

  // res.render("index", { projects: data });
});

app.get("/add-project", function (req, res) {
  res.render("add-project");
});

app.post("/add-project", function (req, res) {
  let data = req.body;

  data = {
    title: data.projectName,
    descr: data.inputDesc,
    start: data.inputDateStart,
    end: data.inputDateEnd,
    duration: getDuration(data.inputDateStart, data.inputDateEnd),
    node: checkboxes(data.inputNode),
    react: checkboxes(data.inputReact),
    next: checkboxes(data.inputNext),
    type: checkboxes(data.inputType),
  };

  projects.push(data);
  console.log(projects);
  res.redirect("/home");
});

app.get("/contact", function (req, res) {
  res.render("contact");
});

app.get("/edit-project/:index", function (req, res) {
  res.render("edit-project");
  let index = req.params.index;
  let dataProject = projects[index];

  res.render("edit-project", { project: dataProject, index });
});

app.post("/edit-project/:index", function (req, res) {
  let data = req.body;
  let index = req.params.index;

  projects[index].title = data.projectName;
  projects[index].descr = data.inputDesc;
  projects[index].start = data.inputDateStart;
  projects[index].end = data.inputDateEnd;
  projects[index].duration = getDuration(data.inputDateStart, data.inputDateEnd);
  projects[index].node = checkboxes(data.inputNode);
  projects[index].react = checkboxes(data.inputReact);
  projects[index].next = checkboxes(data.inputNext);
  projects[index].type = checkboxes(data.inputType);

  res.redirect("/home");
});

app.get("/project-detail/:index", function (req, res) {
  res.render("project-detail");
  let index = req.params.index;
  let detail = projects[index];

  res.render("project-detail", detail);
});

app.get("/delete-project/:index", function (req, res) {
  console.log(req.params.index);

  let index = req.params.index;

  projects.splice(index, 1);

  res.redirect("/home");
});

app.listen(port, function () {
  console.log(`server listen on port ${port}`);
});

function getDuration(start, end) {
  let sdate = new Date(start);
  let edate = new Date(end);
  let duration = edate.getTime() - sdate.getTime();
  let month = Math.ceil(duration / (1000 * 3600 * 24 * 30));
  let day = duration / (1000 * 3600 * 24);

  if (day < 30) {
    return day + " Hari";
  } else if (day > 30 && day <= 30) {
    return day + " bulan";
  } else if (month < 12) {
    return month + " Bulan";
  }
}

function checkboxes(condition) {
  if (condition === "on") {
    return true;
  } else {
    return false;
  }
}
