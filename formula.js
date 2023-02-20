function evaluateChildren(children) {
  for (let i = 0; i < children.length; i++) {
    let cChildren = children[i];
    let { rid, cid } = getRidCidFromStringAddress(cChildren);
    let currSheet = getSheet();
    let dbChildrenCell = currSheet.sheetDb[rid][cid];
    let cFormula = dbChildrenCell.formula;
    let ans = evaluate(cFormula);
    setCell(ans, rid, cid);
    let grandChildren = dbChildrenCell.children;
    evaluateChildren(grandChildren);
  }
}
// *******************************************set formula***************************************
const formulaBar = document.querySelector(".formula_bar");
formulaBar.addEventListener("keypress", function (e) {
  // enter is pressed and formulabar is not empty
  if (e.key == "Enter" && formulaBar.value != "") {
    // formula wala logic implementation
    let formula = formulaBar.value;
    let cCell = addressBar.value;
    let { rid, cid } = cellAddress();
    let obj = getSheet();
    let dbCell = obj.sheetDb[rid][cid];
    let oldFormula = dbCell.formula;
    if (oldFormula == formula) {
      return;
    }
    // remove
    if (oldFormula != "") {
      removeFormula(dbCell, cCell);
    }
    //check formula
    let ans = evaluate(formula);
    if (ans == "error") {
      alert(
        "Please Check -> Either Formula is Incorrect Or Value is not Numeric"
      );
    } else {
      setFormulaInDb(formula, rid, cid, cCell);
      const mySet = {};
      if (checkCyclic(obj, rid, cid, cCell, mySet)) {
        removeFormula(dbCell, cCell);

        alert("Cyclic Dependency!!");
      } else {
        // let ans = evaluate(formula);
        ans = Number(ans);
        setCell(ans, rid, cid);
      }
    }
  }
});

function removeFormula(dbCell, cCell) {
  let formula = dbCell.formula;
  let formulaEntities = formula.split(" ");
  for (let i = 0; i < formulaEntities.length; i++) {
    let cEntity = formulaEntities[i];
    let ascii = cEntity.charCodeAt(0);
    if (ascii >= 65 && ascii <= 90) {
      let { rid, cid } = getRidCidFromStringAddress(cEntity);
      let obj = getSheet();
      let db = obj.sheetDb[rid][cid];
      let children = db.children;
      let idx = children.indexOf(cCell);
      if (idx != -1) {
        children.splice(idx, 1);
      }
    }
  }
  dbCell.formula = "";
}

function evaluate(formula) {
  try {
    let formulaEntities = formula.split(" ");
    for (let i = 0; i < formulaEntities.length; i++) {
      let cEntity = formulaEntities[i];
      let ascii = cEntity.charCodeAt(0);
      if (ascii >= 65 && ascii <= 90) {
        let { rid, cid } = getRidCidFromStringAddress(cEntity);
        let obj = getSheet();
        let db = obj.sheetDb[rid][cid];
        let value = db.value;
        formulaEntities[i] = value;
      }
    }
    let formulaToEvaluate = formulaEntities.join("");
    // console.log(formulaToEvaluate);
    let ans = eval(formulaToEvaluate);
    return ans + "";
  } catch {
    return "error";
  }
}
function setCell(ans, rid, cid) {
  let cell = document.querySelector(
    `.grid .sheetcell[rid="${rid}"][cid="${cid}"]`
  );
  cell.innerText = ans;
  let obj = getSheet();
  let db = obj.sheetDb[rid][cid];
  db.value = ans;
}
function setFormulaInDb(formula, rid, cid, cCell) {
  let obj = getSheet();
  let db = obj.sheetDb[rid][cid];
  db.formula = formula;
  let formulaEntities = formula.split(" ");
  for (let i = 0; i < formulaEntities.length; i++) {
    let cEntity = formulaEntities[i];
    let ascii = cEntity.charCodeAt(0);
    if (ascii >= 65 && ascii <= 90) {
      let { rid, cid } = getRidCidFromStringAddress(cEntity);
      let children = obj.sheetDb[rid][cid].children;
      children.push(cCell);
      // console.log(children);
    }
  }
}
function checkCyclic(obj, rid, cid, cCell, mySet) {
  if (mySet[cCell]) {
    return true;
  }
  mySet[cCell] = true;
  let db = obj.sheetDb[rid][cid];
  let children = db.children;
  for (let i = 0; i < children.length; i++) {
    let childCell = children[i];
    let { crid, ccid } = getRidCidFromStringAddress(childCell);
    if (checkCyclic(obj, rid, cid, childCell, mySet)) {
      return true;
    }
  }
  return false;
}
// *************************helper***************
function getRidCidFromUI(uicell) {
  let rid = uicell.getAttribute("rid");
  let cid = uicell.getAttribute("cid");
  return { rid, cid };
}
function getRidCidFromStringAddress(stringAddress) {
  let ciChar = stringAddress.charCodeAt(0);
  let rowid = stringAddress.substr(1);
  let cid = Number(ciChar) - 65;
  let rid = Number(rowid);
  return { rid: rid, cid: cid };
}
