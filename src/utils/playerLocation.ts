import langs from "./langs";

const language = document
  .getElementsByClassName("playerProfile")?.[0]
  .textContent?.match(/"language":"([a-z]{2}-[A-Z]{2})"/)?.[1];

const flag = language?.slice(3, 5).toLocaleLowerCase();

const profile = langs.find((v) => v.flag === flag);

const userFlag = document.createElement("img");
userFlag.className = "languageFlag";
userFlag.src = `../../../../img/svg/flags/${flag}.svg`;
userFlag.title = profile?.countryEnglish || "";

const delay = () => {
  setTimeout(() => {
    const img = document.querySelector("img.languageFlag");
    img?.before(userFlag);

    console.log("player location: ", { language, flag, img, userFlag, profile });
  }, 200);
};

if (document.readyState == "complete") {
  delay();
} else {
  document.onreadystatechange = function () {
    if (document.readyState === "complete") {
      delay();
    }
  };
}
