// element to display results within
const resultsContainer = document.getElementById("results");
const searchTerm = document.getElementById("searchBar");
let typingTimer; //timer identifier

// retrieving data from local storage
var storedCharactersArray = JSON.parse(localStorage.getItem("characters"));

// triggering function
searchTerm.addEventListener("keyup", async () => {
  removeAllChildNodes(resultsContainer);
  clearTimeout(typingTimer);

  if (searchTerm.value.length >= 3) {
    typingTimer = setTimeout(afterTyping, 800);
  }
});

// When user finishes typing
function afterTyping() {
  // fetching data from the marvel api
  getMarvelResponse(searchTerm.value);
}

// Clear previous search
function removeAllChildNodes(parent) {
  // console.log("Parent: ", parent);
  document
    .querySelectorAll(".list-group-item")
    .forEach((child) => child.remove());
}

// Hitting the API and fetching the matching characters
// The key generated in marvel.com website
var PRIV_KEY = "b6a133d15c30ef45884097524b83873fc75ee459";
var PUBLIC_KEY = "4ca00b616904c021d70c81b1b6d4ed43";

async function getMarvelResponse(searchTerm) {
  // New timestamp for every request
  var ts = new Date().getTime();
  var hash = CryptoJS.MD5(ts + PRIV_KEY + PUBLIC_KEY).toString();
  //console.log(hash, " ", ts);
  try {
    const response = await fetch(
      `https://gateway.marvel.com:443/v1/public/characters?ts=${ts}&nameStartsWith=${searchTerm}&limit=6&apikey=${PUBLIC_KEY}&hash=${hash}`
    )
      // converting response to json
      .then((response) => response.json())
      .then(function (data) {
        // to show the results on the page
        console.log(typeof data, data);
        character = data;
        showResults(data);
      });
  } catch (err) {
    console.log("Error:", err);
  }
}

// displaying results
function showResults(Data) {
  let maxResultsToDisplay = 1;
  Data.data.results.map((superHero) => {
    if (maxResultsToDisplay > 6) {
      return;
    }
    maxResultsToDisplay++;

    //Creating UI
    let ul = document.createElement("ul");
    ul.className = "list-group";

    let li = document.createElement("li");
    li.className = "list-group-item";

    let anchorTag = document.createElement("a");
    anchorTag.className = "list-group-item list-group-item-action small";
    anchorTag.title = superHero.name;
    anchorTag.href = "details.html?id=" + superHero.id;

    //Main div
    let flexDiv = document.createElement("div");
    flexDiv.className = "d-flex justify-content-between";

    // Image div
    let imgContainer = document.createElement("div");

    let heroAvatar = document.createElement("img");
    heroAvatar.className = "img-fluid";
    heroAvatar.src = superHero.thumbnail.path + ".jpg";
    heroAvatar.alt = superHero.name + "'s thumbnail";
    heroAvatar.height = 30;
    heroAvatar.width = 50;

    // Name, id info div
    let infoContainer = document.createElement("div");
    infoContainer.className = "ml-3";

    let id = document.createElement("div");
    id.innerHTML = superHero.id;

    let characterName = document.createElement("div");
    characterName.innerHTML = superHero.name;
    characterName.className = "font-weight-bold";

    // Favourite heart container
    let heart = document.createElement("div");
    let Heart_anchorTag = document.createElement("a");
    Heart_anchorTag.dataset.id = superHero.id;
    Heart_anchorTag.title = "Favourite";
    Heart_anchorTag.href = "javascript:void(0);";
    Heart_anchorTag.id = "fav-btn";
    if (initialFavStatus(Heart_anchorTag)) {
      Heart_anchorTag.className = "text-danger ml-auto mt-2 fa-heart fa-lg fas";
    } else {
      Heart_anchorTag.className = "text-danger ml-auto mt-2 far fa-heart fa-lg";
    }

    let description = document.createElement("div");
    description.innerHTML = superHero.description;

    ul.append(anchorTag);
    anchorTag.append(flexDiv);
    flexDiv.append(imgContainer, infoContainer, Heart_anchorTag);
    imgContainer.append(heroAvatar);
    infoContainer.append(characterName, id);

    // adds all superheroes cards to DOM
    resultsContainer.append(ul);

    // initialFavStatus(Heart_anchorTag);
    Heart_anchorTag.addEventListener("click", function (e) {
      favourite(this);
    });
  });
}

// Initial favourite status
function initialFavStatus(anchor) {
  if (storedCharactersArray == null) {
    return false;
  } else if (storedCharactersArray.length > 0) {
    if (isFavourite(anchor.dataset.id, storedCharactersArray)) {
      return true;
    }
  }
}

// Toggle favourite
function favourite(anchor) {
  //console.log("inside fav " + anchor.dataset.id, character);

  // checking if browser supports for localStorage and sessionStorage
  if (typeof Storage == "undefined") {
    window.alert("Sorry! No Web Storage support..");
    return;
  }

  storedCharactersArray = JSON.parse(localStorage.getItem("characters"));
  let favIcon = anchor.classList;

  // Handling favourite character case
  if (storedCharactersArray == null || storedCharactersArray.length == 0) {
    var characters = [];
    for (var key in character.data.results) {
      if (character.data.results[key].id == anchor.dataset.id) {
        console.log(
          "Add to Favourite Condition : ",
          character.data.results[key].id + " == " + anchor.dataset.id
        );
        characters.push(character.data.results[key]);
      }
    }

    // add to local storage
    localStorage.setItem("characters", JSON.stringify(characters));
    // change icon
    favIcon.remove("far");
    favIcon.add("fas");
    // alert message
    window.alert("Added to favourites.");
  } else {
    // checking if current character is already in favourites
    if (isFavourite(anchor.dataset.id, storedCharactersArray)) {
      // remove from favourites
      if (confirm("Remove from favourites?")) {
        console.log(
          "after confirm",
          character.data.results[0].id,
          anchor.dataset.id
        );
        let isRemoved = removeFromFavourite(
          anchor.dataset.id,
          storedCharactersArray
        );
        console.log(isRemoved);
        if (isRemoved) {
          localStorage.setItem(
            "characters",
            JSON.stringify(storedCharactersArray)
          );
          // change icon
          favIcon.remove("fas");
          favIcon.add("far");
          // alert message
          window.alert("Removed from favourites");
        } else {
          window.alert("OOPS! Something went wrong!");
        }
      }
    } else {
      // current character is not a favourite character hence "Add to favrourites"
      try {
        for (var key in character.data.results) {
          if (character.data.results[key].id == anchor.dataset.id) {
            console.log(
              "Add to Favourite Condition : ",
              character.data.results[key].id + " == " + anchor.dataset.id
            );
            console.log(character.data.results[key]);
            storedCharactersArray.push(character.data.results[key]);
          }
        }

        // add to local storage
        localStorage.setItem(
          "characters",
          JSON.stringify(storedCharactersArray)
        );
        // change icon
        favIcon.remove("far");
        favIcon.add("fas");
        // alert message
        window.alert("Added to favourites");
      } catch (error) {
        window.alert("OOPS! Something went wrong!");
      }
    }
  }
}

// Checking if character is already in favourites
function isFavourite(characterId, storedCharactersArray) {
  for (let i = 0; i < storedCharactersArray.length; i++) {
    if (storedCharactersArray[i].id == characterId) {
      // console.log("isFavourite = TRUE");
      return true;
    }
  }
  return false;
}

// Removing character from the favourites
function removeFromFavourite(characterId, storedCharactersArray) {
  for (let i = 0; i < storedCharactersArray.length; i++) {
    // console.log(storedCharactersArray[i].id == characterId);
    if (storedCharactersArray[i].id == characterId) {
      console.log("SPLICING");
      storedCharactersArray.splice(i, 1);
      return true;
    }
  }
  return false;
}
