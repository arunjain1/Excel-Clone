let topRow = document.querySelector(".top_row");
let leftCol = document.querySelector(".left_col");
let grid = document.querySelector(".grid");
let gridContainer = document.querySelector(".grid_cont");
let addressBar = document.querySelector(".address_bar");
let menuBar = document.querySelector(".menu_bar");
let ffamilySelect = document.querySelector(".select_f_family");
let fontSizeSelect = document.querySelector(".select_f_size");
let boldButton = document.querySelector(".fa-bold");
let italicButton = document.querySelector(".fa-italic");
let underlineButton = document.querySelector(".fa-underline");
let alignment = document.querySelectorAll(".alignment_container i");
let nrow = 0;
let ncol = 1;
let db = [];
let sheets = [];
let sheetObj = {
  col: 0,
  row: 0,
  sheetDb: [],
};
sheets.push(sheetObj);
function createSheet() {
  for (; ncol <= 26; ncol++) {
    let div = document.createElement("div");
    div.setAttribute("class", "cell");
    div.textContent = String.fromCharCode(ncol + 64);
    topRow.appendChild(div);
  }
  let totalRow = nrow + 100;
  let current_nrow = nrow;
  for (; nrow < totalRow; nrow++) {
    let div = document.createElement("div");
    div.setAttribute("class", "cell");
    div.textContent = nrow;
    leftCol.appendChild(div);
  }
  let row = current_nrow;
  for (; row < totalRow; row++) {
    let gridRow = document.createElement("div");
    gridRow.setAttribute("class", "row");
    let rowArr = [];
    for (let col = 0; col < 26; col++) {
      /****************sheetCell Creation***************************/
      let cell = document.createElement("div");
      cell.setAttribute("class", "sheetcell");
      // cell.textContent = `${String.fromCharCode(65 + col)}-${row - 1}`;
      cell.setAttribute("contenteditable", "true");
      cell.setAttribute("rid", row);
      cell.setAttribute("cid", col);
      cell.addEventListener("click", function (e) {
        displayAddress(e);
      });
      cell.addEventListener("blur", (e) => {
        updateValue(e);
        reSizeCell(e);
      });
      cell.addEventListener("keydown", (e) => {
        if (e.key == "Enter") {
          e.preventDefault();
          let nextcell = document.querySelector(
            `.grid .sheetcell[rid="${
              Number(cell.getAttribute("rid")) + 1
            }"][cid="${col}"]`
          );
          nextcell.focus();
        }
      });
      gridRow.appendChild(cell);
      /************************SheetCell Property Matrix****************/
      let cellObj = {
        fontFamily: "Courier New",
        fontSize: "16",
        bold: false,
        italic: false,
        underline: false,
        align: "default",
        formula: "",
        children: [],
        value: "",
        minwidth: 80,
      };
      rowArr.push(cellObj);
    }
    grid.appendChild(gridRow);
    addDb(rowArr);
  }
}
function addDb(rowArr) {
  for (let i = 0; i < sheets.length; i++) {
    sheets[i].sheetDb.push(rowArr);
  }
}
function dbUpdate(sheetobj) {
  for (let row = 0; row < nrow; row++) {
    let rowArr = [];
    for (let col = 0; col < 26; col++) {
      let cellObj = {
        fontFamily: "Courier New",
        fontSize: "16",
        bold: false,
        italic: false,
        underline: false,
        align: "default",
        formula: "",
        children: [],
        value: "",
        minwidth: 80,
      };
      rowArr.push(cellObj);
    }
    sheetobj.sheetDb.push(rowArr);
  }
}
createSheet();
gridContainer.onscroll = function () {
  if (
    gridContainer.scrollTop + gridContainer.clientHeight >=
    gridContainer.scrollHeight
  ) {
    createSheet();
  }
};

function getSheet() {
  let ele = document.querySelector(".sheet_select");
  let id = ele.getAttribute("myId");
  let currentSheet = sheets[id - 1];
  return currentSheet;
}
/********************************address bar ********************************* */

function displayAddress(e) {
  let currentCell = e.currentTarget;
  let rid = Number(currentCell.getAttribute("rid"));
  let cid = Number(currentCell.getAttribute("cid"));
  addressBar.value = `${String.fromCharCode(65 + cid)}${rid}`;
  updateMenuBar(rid, cid);
  let obj = getSheet();
  obj.row = rid > obj.row ? rid : obj.row;
  console.log(obj.row);
  obj.col = cid > obj.col ? cid : obj.col;
  console.log(obj.col);
}

function updateValue(e) {
  let currentCell = e.currentTarget;
  let rid = Number(currentCell.getAttribute("rid"));
  let cid = Number(currentCell.getAttribute("cid"));
  let obj = getSheet();
  let dbCellObj = obj.sheetDb[rid][cid];
  if (dbCellObj.formula != "" && dbCellObj.value != currentCell.innerText) {
    let cCell = addressBar.value;
    removeFormula(dbCellObj, cCell);
  }
  dbCellObj.value = currentCell.textContent;
  evaluateChildren(dbCellObj.children);
}

function reSizeCell(e) {
  let width = window
    .getComputedStyle(e.currentTarget)
    .getPropertyValue("width");
  width = Number(width.substring(0, width.length - 2));
  let obj = getSheet();
  if (width > 80) {
    let cid = e.currentTarget.getAttribute("cid");
    for (let i = 0; i < nrow; i++) {
      document.querySelector(
        `.grid .sheetcell[rid="${i}"][cid="${cid}"]`
      ).style["min-width"] = `${width}px`;
      obj.sheetDb[i][cid].minwidth = width;
    }
    document.querySelectorAll(".cell")[cid].style.width = `${width}px`;
  }
}
/*********************************Menu Bar Functionality**************************/
ffamilySelect.addEventListener("change", (e) => {
  let family = ffamilySelect.value;
  let { rid, cid } = cellAddress();
  let cell = document.querySelector(
    `.grid .sheetcell[rid="${rid}"][cid="${cid}"]`
  );
  cell.style.fontFamily = family;
  let obj = getSheet();
  let dbCellObj = obj.sheetDb[rid][cid];
  dbCellObj.fontFamily = family;
});

fontSizeSelect.addEventListener("change", (e) => {
  let size = fontSizeSelect.value;
  let { rid, cid } = cellAddress();
  let cell = document.querySelector(
    `.grid .sheetcell[rid="${rid}"][cid="${cid}"]`
  );
  cell.style.fontSize = size + "px";
  let obj = getSheet();
  let dbCellObj = obj.sheetDb[rid][cid];
  dbCellObj.fontSize = size;
});
function cellAddress() {
  let val = addressBar.value;
  let cid = val.charAt(0);
  cid = Number(cid.charCodeAt(0)) - 65;
  let rid = val.substring(1);
  return { rid, cid };
}

boldButton.addEventListener("click", function (e) {
  fontStyling(e, "fontWeight", "bold");
});
italicButton.addEventListener("click", function (e) {
  fontStyling(e, "fontStyle", "italic");
});
underlineButton.addEventListener("click", function (e) {
  fontStyling(e, "textDecoration", "underline");
});

function fontStyling(e, property, value) {
  let param = e.currentTarget;
  let isSelected = param.classList[2];
  let { rid, cid } = cellAddress();
  let cell = document.querySelector(
    `.grid .sheetcell[rid="${rid}"][cid="${cid}"]`
  );
  let obj = getSheet();
  let dbCellObj = obj.sheetDb[rid][cid];

  if (isSelected == "selected") {
    param.classList.remove("selected");
    cell.style[property] = "normal";
    dbCellObj[value] = false;
  } else {
    param.classList.add("selected");
    cell.style[property] = value;
    dbCellObj[value] = true;
  }
}

for (let i = 0; i < alignment.length; i++) {
  alignment[i].addEventListener("click", (e) => {
    let flag = false;
    for (let j = 0; j < alignment.length; j++) {
      if (alignment[i].classList[3] == "selected") {
        flag = true;
      }
      alignment[j].classList.remove("selected");
    }
    let { rid, cid } = cellAddress();
    let cell = document.querySelector(
      `.grid .sheetcell[rid="${rid}"][cid="${cid}"]`
    );
    let obj = getSheet();
    let dbCellObj = obj.sheetDb[rid][cid];
    if (flag) {
      alignment[i].classList.remove("selected");
      cell.style.textAlign = "center";
      dbCellObj.align = "default";
    } else {
      alignment[i].classList.add("selected");
      cell.style.textAlign = alignment[i].classList[2];
      dbCellObj.align = alignment[i].classList[2];
    }
  });
}
/**********************************sheetCell And Menu Bar Update***********************/

function updateMenuBar(rid, cid) {
  let obj = getSheet();
  let cellObj = obj.sheetDb[rid][cid];
  let val = cellObj.align;
  if (cellObj.bold) {
    boldButton.classList.add("selected");
  } else {
    boldButton.classList.remove("selected");
  }
  if (cellObj.italic) {
    italicButton.classList.add("selected");
  } else {
    italicButton.classList.remove("selected");
  }
  if (cellObj.underline) {
    underlineButton.classList.add("selected");
  } else {
    underlineButton.classList.remove("selected");
  }
  fontSizeSelect.value = cellObj.fontSize;
  ffamilySelect.value = cellObj.fontFamily;

  for (let i = 0; i < alignment.length; i++) {
    alignment[i].classList.remove("selected");
  }
  if (cellObj.align != "default") {
    for (let i = 0; i < alignment.length; i++) {
      if (alignment[i].classList[2] == val) {
        alignment[i].classList.add("selected");
        break;
      }
    }
  }
  formulaBar.value = cellObj.formula;
}
