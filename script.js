"use strict";

window.addEventListener("DOMContentLoaded", start);

let popop = document.querySelector("#popup");
let closeWin = document.querySelector("#close");

let allStudents = [];
let allBlodStatus = [];
let expelledStudents = [];

const Student = {
  imageUrl: "",
  firstName: "",
  lastName: "",
  middleName: "",
  nickName: "",
  gender: "",
  house: "",
  bloodstatus: "",
  prefect: false,
  squad: false,
  expel: false,
};

// global object <-- maybe change later
const settings = {
  filter: "all",
  sortBy: " ",
  sortDir: "asc",
};

function start() {
  console.log("ready");

  // TODO: Add event-listeners to filter and sort buttons
  // Filter
  loadJSON();
  clickFilterButton();
  clickSortButttons();
  registerSearch();
  registerExpelledStudents();
}
function registerExpelledStudents() {
  document
    .querySelector("[data-filter='expelledstudents']")
    .addEventListener("click", displayExpelledStudent);
}

function registerSearch() {
  //Eventlistener på søgefelt
  document.querySelector("#search").addEventListener("input", searchStudent);
}

function clickSortButttons() {
  document
    .querySelectorAll("[data-action='sort']")
    .forEach((button) => button.addEventListener("click", selectSort));
}

// <-- might has to be changed
// toggle click on filter button.
function clickFilterButton() {
  document
    .querySelector("#filter_btn")
    .addEventListener("click", toggleFilterBtn);

  function toggleFilterBtn() {
    console.log(`The filter button has been clicked`);
    document.querySelector("#filter ul").classList.toggle("hide");
  }
  clickFilterButtons();
}

function clickFilterButtons() {
  // eventlistner for filter btn
  document
    .querySelectorAll("[data-action='filter']")
    .forEach((button) => button.addEventListener("click", selectFilter));
}

async function loadJSON() {
  console.log("loadJS");
  const response = await fetch(
    "https://petlatkea.dk/2021/hogwarts/students.json"
  );
  const jsonData = await response.json();
  const responseBlood = await fetch(
    "https://petlatkea.dk/2021/hogwarts/families.json"
  );
  const jsonDataBlood = await responseBlood.json();

  // when loaded, prepare data objects
  prepareObjects(jsonData, jsonDataBlood);
}

function prepareObjects(jsonData, jsonDataBlood) {
  console.log("prepareJSObjects");

  allStudents = jsonData.map(prepareObject);
  allBlodStatus = jsonDataBlood;

  setBloodStatus(jsonDataBlood);
  // this has to be changed to buildList
  buildList();
}

function setBloodStatus(jsonDataBlood) {
  console.log("defining bloodstatus for students");
  allStudents.forEach((student) => {
    if (jsonDataBlood.half.includes(student.lastName)) {
      student.bloodstatus = "🟡 Half-Blood";
    } else if (jsonDataBlood.pure.includes(student.lastName)) {
      student.bloodstatus = "🟢 Pure-Blood";
    } else {
      student.bloodstatus = "🔴 Muggleborn";
    }
  });
  return student;
}

// <--
function prepareObject(jsonObject) {
  // TODO: Create new object with cleaned data - and store that in the allAnimals array
  const student = Object.create(Student);
  const studentNameTrim = jsonObject.fullname.trim();

  // Split get firstName
  let studentNameSplit = studentNameTrim.split(" ");

  // FirstName first letter to Upper case
  const studentFirstName =
    studentNameSplit[0].substring(0, 1).toUpperCase() +
    studentNameSplit[0].substring(1).toLowerCase();
  student.firstName = studentFirstName;

  // Adding middlename, lastname
  // not working correctly
  // some Middle names are "" and not null (fucks with filter!!)
  if (studentNameSplit == studentNameSplit[0]) {
    const newMiddleName = studentNameSplit.push(null);
    const newLastName = studentNameSplit.push(null);
  } else if (studentNameSplit <= studentNameSplit[1]) {
    const newMiddleName = studentNameSplit.splice(1, 0, null);
  } else if (studentNameSplit >= studentNameSplit[1]) {
    const newMiddleName = studentNameSplit.splice(1, 0, null);
  }

  const studentFullName = `${studentNameSplit}`; // putting the name together

  // firstComma & lastComma
  const firstComma = studentFullName.indexOf(",");
  const lastComma = studentFullName.lastIndexOf(",");

  // NickName or middleName
  const setMiddleName = studentFullName.substring(firstComma + 1, lastComma);

  student.middleName =
    setMiddleName.substring(0, 1).toUpperCase() +
    setMiddleName.substring(1).toLowerCase();

  // NickName = middleName || nickname = null
  if (setMiddleName.includes('"')) {
    const nickName = setMiddleName.substring(
      setMiddleName.indexOf('"') + 1,
      setMiddleName.lastIndexOf('"')
    );
    student.nickName =
      nickName.substring(0, 1).toUpperCase() +
      nickName.substring(1).toLowerCase();
  } else {
    student.nickName = null;
  }

  // MiddleName includes ","
  if (setMiddleName.includes(",")) {
    const middleNameBeforeComma = setMiddleName.substring(
      setMiddleName.indexOf(",") + 1
    );
    student.middleName =
      middleNameBeforeComma.substring(0, 1).toUpperCase() +
      middleNameBeforeComma.substring(1).toLowerCase();
  }

  // removed "ernie" from middleName (quick fix)
  if (student.middleName.includes('"')) {
    student.middleName = null;
  }

  // last name
  const setLastName = studentFullName.substring(lastComma + 1);
  const lastName =
    setLastName.substring(0, 1).toUpperCase() +
    setLastName.substring(1).toLowerCase();
  student.lastName = lastName;

  //house
  const studentHouseTrim = jsonObject.house.trim();
  const studentHouse =
    studentHouseTrim.substring(0, 1).toUpperCase() +
    studentHouseTrim.substring(1).toLowerCase();
  student.house = studentHouse;

  const ifHyphens = student.lastName.indexOf("-");
  // Add imageUrl
  if (ifHyphens == -1) {
    student.imageUrl =
      student.lastName.toLowerCase() +
      `_${student.firstName.substring(0, 1).toLowerCase()}` +
      `.png`;
  } else {
    student.imageUrl =
      student.lastName.substring(ifHyphens + 1).toLowerCase() +
      `_${student.firstName.substring(0, 1).toLowerCase()}` +
      `.png`;
  }

  // <-- This has to be changed to something lige student-lastName >=2
  if (student.lastName === "Patil") {
    student.imageUrl = (
      student.lastName +
      "_" +
      student.firstName +
      ".png"
    ).toLowerCase();
  }

  // gender
  const studentGenderTrim = jsonObject.gender.trim();

  student.gender =
    studentGenderTrim.substring(0, 1).toUpperCase() +
    studentGenderTrim.substring(1).toLowerCase();

  return student;
}

function searchStudent() {
  let search = document.querySelector("#search").value.toLowerCase();
  let searchResult = allStudents.filter(filterSearch);

  function filterSearch(student) {
    //Searching firstName and lastLame
    if (
      student.firstName.toString().toLowerCase().includes(search) ||
      student.lastName.toString().toLowerCase().includes(search)
    ) {
      return true;
    } else {
      return false;
    }
  }

  if (search == " ") {
    displayList(allStudents);
  }

  displayList(searchResult);
}

// <-- Filter is working
function selectFilter(event) {
  document.querySelector("#filter ul").classList.toggle("hide");
  const filter = event.target.dataset.filter;
  //filterList(filter);
  setFilter(filter);
}

function setFilter(filter) {
  settings.filterBy = filter;
  buildList();
}

// filter the list by animal type or name
function filterList(filteredList) {
  // let filteredList = allStudents;
  if (settings.filterBy === "gryffindor") {
    // create a filterede list of only Gryffindor
    filteredList = allStudents.filter(filterGryffindor);
  } else if (settings.filterBy === "slytherin") {
    // create a filterede list of only Slytherin
    filteredList = allStudents.filter(filterSlytherin);
  } else if (settings.filterBy === "hufflepuff") {
    // create a filtered list of only Hyfflepuff
    filteredList = allStudents.filter(filterHufflepuff);
  } else if (settings.filterBy === "ravenclaw") {
    filteredList = allStudents.filter(filterRavenclaw);
  } else if (settings.filterBy === "resposibilities") {
    filteredList = allStudents.filter(filterResponsibilities);
  }
  return filteredList;
}

// filter by Gryffindor
function filterGryffindor(student) {
  console.log("filter gryffindor");
  return student.house === "Gryffindor";
}

// filter by Slytherin
function filterSlytherin(student) {
  console.log("filter slytherin");
  return student.house === "Slytherin";
}

// filter by hufflepuff
function filterHufflepuff(student) {
  console.log("filter hufflepuff");
  return student.house === "Hufflepuff";
}

// filter by ravenclaw
function filterRavenclaw(student) {
  console.log("filter ravenclaw");
  return student.house === "Ravenclaw";
}

// filter by ravenclaw
function filterResponsibilities(student) {
  console.log("filter prefect");
  return student.prefect === true;
}

function displayExpelledStudent() {
  console.log("Show expelled students");
  displayList(expelledStudents);
}

// <-- sort doesn't work (classlist of null(.sortby))
// <-- problem with sort nickName
// select the filter for the clicked button
function selectSort(event) {
  console.log("hej");
  const sortBy = event.target.dataset.sort;
  const sortDir = event.target.dataset.sortDirection;

  // find old sort by elemen, and remove .sortBy
  // const oldElement = document.querySelector(`[data-sort='${settings.sortBy}']`);
  //oldElement.classList.remove(".sortby");
  // indicate active sort
  //event.target.classList.add(".sortby");

  // toggle the direction
  if (sortDir === "asc") {
    event.target.dataset.sortDirection = "desc";
  } else {
    event.target.dataset.sortDirection = "asc";
  }
  setSort(sortBy, sortDir);
}

function setSort(sortBy, sortDir) {
  settings.sortBy = sortBy;
  settings.sortDir = sortDir;

  buildList();
}

// Sort the list by ...
function sortList(sortedList) {
  let direction = 1;
  if (settings.sortDir === "desc") {
    direction = -1;
  } else {
    settings.direction = 1;
  }

  // sort the list by property
  sortedList = sortedList.sort(sortByProperty);

  function sortByProperty(studentA, studentB) {
    if (studentA[settings.sortBy] < studentB[settings.sortBy]) {
      return -1 * direction;
    } else {
      return 1 * direction;
    }
  }
  return sortedList;
}

// build the new/current list
function buildList() {
  const currentList = filterList(allStudents);
  const sortedList = sortList(currentList);

  displayList(currentList);
  displayExpelledList(expelledStudents);
}

function displayList(students) {
  // clear the list
  document.querySelector("#list #active").innerHTML = "";

  // build a new list
  students.forEach(displayStudents);
  displayNumbers(students);
}

function displayExpelledList(students) {
  document.querySelector("#list #expelled");

  students.forEach(displayExpelledStudents);
}

function displayExpelledStudents() {
  console.log("");
  const clone = document
    .querySelector("template#expelled_student")
    .content.cloneNode(true);
}

function displayStudents(student) {
  // create clone
  const clone = document
    .querySelector("template#student")
    .content.cloneNode(true);

  // set clone data
  clone.querySelector("[data-field=first_name]").textContent =
    student.firstName;
  clone.querySelector("[data-field=middle_name]").textContent =
    student.middleName;
  clone.querySelector("[data-field=last_name]").textContent = student.lastName;
  clone.querySelector("[data-field=nick_name]").textContent = student.nickName;
  clone.querySelector("[data-field=house]").textContent = student.house;
  clone.querySelector("[data-field=blood_type]").textContent =
    student.bloodstatus;
  clone.querySelector(
    "[data-field=image] img"
  ).src = `images/${student.imageUrl}`;
  clone
    .querySelector(".student_profile_image")
    .addEventListener("click", () => showPopOp(student));

  // set display studen prefect
  if (student.prefect === true) {
    clone.querySelector("[data-field=prefect]").textContent = "🟢";
  } else {
    clone.querySelector("[data-field=prefect]").textContent = "◯";
  }

  // set display studen prefect
  if (student.squad === true) {
    clone.querySelector("[data-field=squad]").textContent = "🟢";
  } else {
    clone.querySelector("[data-field=squad]").textContent = "◯";
  }

  // set display student expelled
  if (student.expel === true) {
    clone.querySelector("[data-field=expel]").textContent = "🔴";
  } else {
    clone.querySelector("[data-field=expel]").textContent = "◯";
    clone
      .querySelector("[data-field=expel]")
      .addEventListener("click", clickExpel);
  }

  // Expelled
  function clickExpel() {
    student.expel = true;
    expelTheStudent(student);

    buildList();
  }

  // Prefects
  clone
    .querySelector("[data-field=prefect]")
    .addEventListener("click", clickPrefect);

  function clickPrefect() {
    if (student.prefect === true) {
      student.prefect = false;
    } else {
      tryToMakeAPrefect(student);
    }
    buildList();
  }

  // Squad
  clone
    .querySelector("[data-field=squad]")
    .addEventListener("click", clickSquad);
  function clickSquad() {
    if (student.squad === true) {
      student.squad = false;
    } else {
      tryToBeINSquad(student);
    }
    buildList();
  }

  // append clone to list
  document.querySelector("#list tbody").appendChild(clone);

  // click popup
  closeWin.addEventListener("click", () => (popop.style.display = "none"));
}

// popup function
function showPopOp(student) {
  console.log(student);

  closeWin.style.display = "";

  // add data to the popop
  popop.style.display = "";
  popop.classList.remove("hide");
  popop.querySelector(
    ".full_name"
  ).textContent = ` ${student.firstName} ${student.middleName} ${student.lastName}`;

  popop.querySelector(
    ".nick_name"
  ).textContent = `Nick name : ${student.nickName}`;
  popop.querySelector(".house").textContent = `House : ${student.house}`;
  popop.querySelector(".gender").textContent = `Gender : ${student.gender}`;
  popop.querySelector(".student_image").src = `images/${student.imageUrl}`;
  popop.querySelector(
    ".blood_type"
  ).textContent = `Blood status : ${student.bloodstatus}`;

  // Prefect student
  if (student.prefect === true) {
    popop.querySelector(".prefect").textContent = `Prefect : 🟢 Is prefect`;
  } else {
    popop.querySelector(".prefect").textContent = `Prefect : ◯ Not Prefect`;
  }

  // Squad Student
  if (student.squad === true) {
    popop.querySelector(
      ".squad"
    ).textContent = `inquisitorial squad : 🟢 Is member`;
  } else {
    popop.querySelector(
      ".squad"
    ).textContent = `inquisitorial squad : ◯ Not member`;
  }

  // expell student
  if (student.expel === true) {
    popop.querySelector(".expel_status").textContent = `Expelled : 🔴 Expelled`;
  } else {
    popop.querySelector(
      ".expel_status"
    ).textContent = `Expelled : ◯ Not expelled`;
    // Add Expelled in popup
    document.querySelector(".clickexpel").addEventListener("click", clickExpel);
  }

  document.querySelector(".addsquad").addEventListener("click", clickAddSquad);
  document
    .querySelector(".removesquad")
    .addEventListener("click", clickRemoveSquad);

  function clickAddSquad() {
    document
      .querySelector(".addsquad")
      .removeEventListener("click", clickAddSquad);
    if (student.squad === true) {
      student.squad = false;
    } else {
      tryToBeINSquad(student);
    }
    buildList();
  }

  function clickRemoveSquad() {
    document
      .querySelector(".removesquad")
      .removeEventListener("click", clickRemoveSquad);
    student.squad = false;
    document.querySelector(
      ".squad"
    ).textContent = `inquisitorial squad : ◯ Not member`;
    buildList();
  }

  // Add Prefect in popup
  popop.querySelector(".addprefect").addEventListener("click", clickAddPrefect);

  // Remove prefect in popup
  popop
    .querySelector(".removeprefect")
    .addEventListener("click", clickRemovePrefect);

  function clickAddPrefect() {
    document
      .querySelector(".addprefect")
      .removeEventListener("click", clickAddPrefect);
    if (student.prefect === true) {
      student.prefect = false;
    } else {
      tryToMakeAPrefect(student);
    }
    buildList();
  }

  function clickRemovePrefect() {
    document
      .querySelector(".removeprefect")
      .removeEventListener("click", clickRemovePrefect);
    student.prefect = false;
    document.querySelector(".prefect").textContent = `Prefect : ◯ Not Prefect`;
    buildList();
  }

  function clickExpel() {
    student.expel = true;

    popop.querySelector(".expel_status").textContent = `Expelled : 🔴 Expelled`;
    document
      .querySelector(".clickexpel")
      .removeEventListener("click", clickExpel);
    expelTheStudent(student);

    buildList();
  }

  // set the color and crest to the house color
  if (student.house === "Gryffindor") {
    document.querySelector("#popup_box").style.backgroundColor = "#981c1c";
    document.querySelector("#column_top").style.backgroundColor = "#981c1c";
    closeWin.style.backgroundColor = "#981c1c";
    document.querySelector("#column_top img").src = `my_images/gryffindor.png`;
  } else if (student.house === "Slytherin") {
    document.querySelector("#popup_box").style.backgroundColor = "#0e6351";
    document.querySelector("#column_top").style.backgroundColor = "#0e6351";
    closeWin.style.backgroundColor = "#0e6351";
    document.querySelector("#column_top img").src = `my_images/slytherin.png`;
  } else if (student.house === "Hufflepuff") {
    document.querySelector("#popup_box").style.backgroundColor = "#c68a00";
    document.querySelector("#column_top").style.backgroundColor = "#c68a00";
    closeWin.style.backgroundColor = "#c68a00";
    document.querySelector("#column_top img").src = `my_images/hufflepuff.png`;
  } else {
    document.querySelector("#popup_box").style.backgroundColor = "#024b86";
    document.querySelector("#column_top").style.backgroundColor = "#024b86";
    closeWin.style.backgroundColor = "#024b86";
    document.querySelector("#column_top img").src = `my_images/ravenclaw.png`;
  }
}

function expelTheStudent(student) {
  console.log("Expel the student");
  allStudents.splice(allStudents.indexOf(student), 1);
  expelledStudents.push(student);
}

function tryToBeINSquad(selectedStudent) {
  if (selectedStudent.house === "Slytherin") {
    addToSquad(selectedStudent);
  } else if (selectedStudent.bloodstatus === "🟢 Pure-Blood") {
    addToSquad(selectedStudent);
  } else {
    selectedStudent.squad = false;
    tryAgain();
  }

  function addToSquad(selectedStudent) {
    selectedStudent.squad = true;
    document.querySelector(
      ".squad"
    ).textContent = `inquisitorial squad : 🟢 Is member`;
  }

  function tryAgain() {
    document.querySelector("#can_not_add").classList.remove("hide");
    document
      .querySelector("#can_not_add .close_warning")
      .addEventListener("click", closeDialog);
    document
      .querySelector("#can_not_add #removeother")
      .addEventListener("click", closeDialog);

    //if ignore - do nothing
    function closeDialog() {
      document.querySelector("#can_not_add").classList.add("hide");
      document
        .querySelector("#can_not_add .close_warning")
        .removeEventListener("click", closeDialog);
      document
        .querySelector("#can_not_add #removeother")
        .removeEventListener("click", closeDialog);
    }
  }
}

function tryToMakeAPrefect(selectedStudent) {
  const allPrefects = allStudents.filter((student) => student.prefect);
  const prefects = allPrefects.filter(
    (prefect) => prefect.house === selectedStudent.house
  );

  const other = prefects
    .filter(
      (prefects) =>
        prefects.house === selectedStudent.house &&
        prefects.gender === selectedStudent.gender
    )
    .shift();

  // if there is another of the same type, house && gender
  if (other !== undefined) {
    console.log("there can only be one prefect of each type");
    removeOther(other);
  } else {
    makePrefect(selectedStudent);
  }

  function removeOther(other) {
    // ask the user to ignore or remove the other
    document.querySelector("#remove_other").classList.remove("hide");
    document
      .querySelector("#remove_other .close_warning")
      .addEventListener("click", closeDialog);
    document
      .querySelector("#remove_other #removeother")
      .addEventListener("click", clickRemoveOther);

    document.querySelector(
      "#remove_other [data-field=otherprefect]"
    ).textContent = other.firstName;

    //if ignore - do nothing
    function closeDialog() {
      document.querySelector("#remove_other").classList.add("hide");
      document
        .querySelector("#remove_other .close_warning")
        .removeEventListener("click", closeDialog);
      document
        .querySelector("#remove_other #removeother")
        .removeEventListener("click", clickRemoveOther);
    }

    //if remove other:
    function clickRemoveOther() {
      removePrefect(other);
      makePrefect(selectedStudent);
      buildList();
      closeDialog();
    }
  }

  function removePrefect(prefectStudent) {
    prefectStudent.prefect = false;
    popop.querySelector(".prefect").textContent = `Prefect : ◯ Not Prefect`;
  }

  function makePrefect(student) {
    student.prefect = true;
    document.querySelector(".prefect").textContent = `Prefect : 🟢 Is prefect`;
  }
}

function displayNumbers(students) {
  // displayed students
  document.querySelector(
    "#displayed_students"
  ).textContent = `Displayed_students : ${students.length}`;

  // avtive students
  document.querySelector(
    "#total_students"
  ).textContent = `Active students : ${allStudents.length}`;

  // expelled students
  document.querySelector(
    "#notactive_students"
  ).textContent = `Expelled students : ${expelledStudents.length}`;

  /* Number of students in different houses 
  <--- NOT working
  // students of gryffindor
  if (students.house === "Gryffindor") {
    const studentsOfGryffindor = students.length;
    document.querySelector(
      "#gryffindor_students"
    ).textContent = `Gryffindor : ${studentsOfGryffindor}`;
  } else if (students.house === "Slytherin") {
    const studentsOfSlytherin = students.length;
    document.querySelector(
      "#slytherin_students"
    ).textContent = `Slytherin : ${studentsOfSlytherin}`;
  } else if (students.house === "Hufflepuff") {
    const studentsOfHufflepuff = students.length;
    document.querySelector(
      "#hyfflepuff_students"
    ).textContent = `Hufflepuff : ${studentsOfHufflepuff}`;
  } else {
    const studentsOfRacenclaw = students.length;
    document.querySelector(
      "#ravenclaw_students"
    ).textContent = `Ravenclaw : ${studentsOfRacenclaw}`;
  }
  */
}

// hackTheSystem - not completed
function hackTheSystem() {
  console.log("the system is being hacked");

  const newStudent = Object.create(Student);

  newStudent.firstName = "Siw";
  newStudent.middleName = "Mehlin Højland";
  newStudent.lastName = "Pedersen";
  newStudent.house = "Gryffindor";
  newStudent.bloodstatus = "🟢 Pure-Blood";
  allStudents.push(newStudent);

  displayHacking();
  buildList();
}

function displayHacking() {
  document.querySelector("#school_crest").classList.add("hacking");
}

// prevent user to expell newStudent

// add person to squad (setTimeOut)

// reset bloodstatus
// pureBlood = math.random
// if student.bloodstatus = halfblood || student.bloodstatus = muggle --> set blodstatus = pureblood
