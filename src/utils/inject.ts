function injectScript(file_path: string, tag: string) {
  var node = document.getElementsByTagName(tag)[0];
  var script = document.createElement("script");
  script.setAttribute("type", "text/javascript");
  script.setAttribute("src", file_path);
  node.appendChild(script);
}

injectScript(chrome.runtime.getURL("dist/searchPlayers.js"), "body");
injectScript(chrome.runtime.getURL("dist/trackTarget.js"), "body");
injectScript(chrome.runtime.getURL("dist/calcDist.js"), "body");
