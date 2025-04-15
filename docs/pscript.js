
import * as pyd from 'pyd';

const output = document.getElementById("output");
const code = document.getElementById("code");
const butt = document.getElementById("run");

function addToOutput(s) {
    output.value += ">>>" + code.value + "\n" + s + "\n";
  }

output.value = "Initializing...\n";
      // init Pyodide
async function main() {
    let pyodide = await loadPyodide();
    await pyodide.loadPackage("micropip");
    const micropip = pyodide.pyimport("micropip");
    await micropip.install('autograd');

    let response = await fetch("https://github.com/calugo/Pyodide_wheels/blob/main/docs/dist/example_package_carlos-0.0.1.tar.gz");
    let buffer = await response.arrayBuffer();

    output.value += "Ready!\n";
    return pyodide;
    }
  
let pyodideReadyPromise = main();



butt.onclick = evaluatePython;

async function evaluatePython() {
    let pyodide = await pyodideReadyPromise;
      try {
        let output = pyodide.runPython(code.value);
        addToOutput(output);
      } catch (err) {
      addToOutput(err);
    }
  }