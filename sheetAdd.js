let sheetCont = document.querySelector(".sheets_container");
let addButton = document.querySelector(".add_sheet");
let firstSheet = document.querySelector(".sheet");
let prevSheet = 0;
firstSheet.addEventListener("click", (e) => {
  sheetDisplay(e);
});
addButton.addEventListener("click", (e) => {
  let sheet = document.querySelectorAll(".sheet");
  let lastEle = sheet[sheet.length - 1];
  let id = Number(lastEle.getAttribute("myId"));
  let div = document.createElement("div");
  div.setAttribute("class", "sheet");
  div.setAttribute("myId", `${id + 1}`);
  div.innerText = `Sheet ${id + 1}`;
  div.setAttribute("contenteditable", "true");
  sheetCont.appendChild(div);
  div.addEventListener("click", (e) => {
    sheetDisplay(e);
  });
  let sheetObj = {
    col: 0,
    row: 0,
    sheetDb: [],
  };
  sheets.push(sheetObj);
  dbUpdate(sheets[id]);
});
function sheetDisplay(e) {
  let prevSelected = document.querySelector(".sheet_select");
  prevSelected.classList.remove("sheet_select");
  let currentEle = e.currentTarget;
  currentEle.classList.add("sheet_select");
  let id = currentEle.getAttribute("myId");
  setUI(sheets[id - 1], id - 1);
}
function setUI(sheetObj, id) {
  let tRow =
    sheetObj.row > sheets[prevSheet].row ? sheetObj.row : sheets[prevSheet].row;
  let tCol =
    sheetObj.col > sheets[prevSheet].col ? sheetObj.col : sheets[prevSheet].col;
  for (let rid = 0; rid <= tRow; rid++) {
    for (let cid = 0; cid <= tCol; cid++) {
      let cellObj = sheetObj.sheetDb[rid][cid];
      let uiCell = document.querySelector(
        `.grid .sheetcell[rid="${rid}"][cid="${cid}"]`
      );
      uiCell.style.fontFamily = cellObj.fontFamily;
      uiCell.style.fontSize = cellObj.fontSize + "px";
      uiCell.style.fontStyle = cellObj.italic == true ? "italic" : "normal";
      uiCell.style.fontWeight = cellObj.bold == true ? "bold" : "normal";
      uiCell.style.textDecoration =
        cellObj.underline == true ? "underline" : "none";
      uiCell.style.textAlign = cellObj.align;
      uiCell.textContent = cellObj.value;
      uiCell.style["min-width"] = `${cellObj.minwidth}px`;
      if (rid == 0) {
        document.querySelectorAll(".cell")[
          cid
        ].style.width = `${cellObj.minwidth}px`;
      }
    }
  }
  prevSheet = id;
}
