function getParams(url) {
  var params = {};
  var parser = document.createElement("a");
  parser.href = url;
  var query = parser.search.substring(1);
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    params[pair[0]] = decodeURIComponent(pair[1]);
  }
  return params;
}

// Getting parameters from the current URL
const characterId = getParams(window.location.href).id;
var character;

// retrieving data from local storage
var storedCharactersArray = JSON.parse(localStorage.getItem("characters"));

// Fetching superhero details
getMarvelResponse(characterId);

// Hitting the API and fetching the matching characters
async function getMarvelResponse(id) {
  var PRIV_KEY = "b6a133d15c30ef45884097524b83873fc75ee459";
  var PUBLIC_KEY = "4ca00b616904c021d70c81b1b6d4ed43";
  var ts = new Date().getTime();
  var hash = CryptoJS.MD5(ts + PRIV_KEY + PUBLIC_KEY).toString();
  // console.log(hash, " ", ts);
  try {
    const response = await fetch(
      `https://gateway.marvel.com:443/v1/public/characters?ts=${ts}&id=${id}&limit=6&apikey=${PUBLIC_KEY}&hash=${hash}`
    )
      .then((response) => response.json()) // converting response to json
      .then(function (data) {
        character = data;
        showResults(data);
        // console.log("marvelresponse", character);
      });
  } catch (err) {
    console.log("Error : ", err);
  }
}

// Showing results
function showResults(Data) {
  // console.log("Inside showResults", Data);
  document.getElementsByClassName("card-title")[0].innerHTML =
    Data.data.results[0].name;

  heroAvatar = document.getElementsByClassName("card-img")[0];
  heroAvatar.src = Data.data.results[0].thumbnail.path + ".jpg";
  heroAvatar.alt = Data.data.results[0].name + "'s thumbnail";

  document.getElementById("ID").innerHTML = Data.data.results[0].id;
  document.getElementById("Description").innerHTML =
    Data.data.results[0].description;
  document.getElementById("modified").innerHTML = Data.data.results[0].modified;

  for (var key in Data.data.results[0].comics.items) {
    document.getElementById("comics").innerHTML +=
      Data.data.results[0].comics.items[key].name + ", ";
    // console.log(Data.data.results[0].comics.items[key].name);
  }

  for (var key in Data.data.results[0].events.items) {
    document.getElementById("events").innerHTML +=
      Data.data.results[0].events.items[key].name + ", ";
    // console.log(Data.data.results[0].comics.items[key].name);
  }

  for (var key in Data.data.results[0].series.items) {
    document.getElementById("series").innerHTML +=
      Data.data.results[0].series.items[key].name + ", ";
    // console.log(Data.data.results[0].comics.items[key].name);
  }

  for (var key in Data.data.results[0].stories.items) {
    document.getElementById("stories").innerHTML +=
      Data.data.results[0].stories.items[key].name + ", ";
    // console.log(Data.data.results[0].comics.items[key].name);
  }

  for (var key in Data.data.results[0].urls) {
    document.getElementById("more-info").innerHTML +=
      Data.data.results[0].urls[key].url + ", ";
    // console.log(Data.data.results[0].comics.items[key].name);
  }
  initialFavStatus();
}

// Initial favourite status
function initialFavStatus() {
  if (storedCharactersArray == null) {
    return false;
  } else if (storedCharactersArray.length > 0) {
    let favIcon = document.getElementById("fav-btn").firstChild.classList;
    if (isFavourite(character.data.results[0].id, storedCharactersArray)) {
      favIcon.remove("far");
      favIcon.add("fas");
    }
  }
}

// Toggle favourite
function favourite(anchor) {
  // checking if browser supports for localStorage and sessionStorage
  if (typeof Storage == "undefined") {
    window.alert("Sorry! No Web Storage support..");
    return;
  }

  storedCharactersArray = JSON.parse(localStorage.getItem("characters"));
  let favIcon = anchor.firstChild.classList;

  // Handling favourite character case
  if (storedCharactersArray == null || storedCharactersArray.length == 0) {
    var characters = [];
    characters.push(character.data.results[0]);
    // add to local storage
    localStorage.setItem("characters", JSON.stringify(characters));
    // change icon
    favIcon.remove("far");
    favIcon.add("fas");
    // alert message
    window.alert(character.data.results[0].name + " is added to favourites.");
  } else {
    // checking if current character is already in favourites
    if (isFavourite(character.data.results[0].id, storedCharactersArray)) {
      // remove from favourites
      if (
        confirm(
          "Remove " + character.data.results[0].name + " from favourites?"
        )
      ) {
        let isRemoved = removeFromFavourite(
          character.data.results[0].id,
          storedCharactersArray
        );
        if (isRemoved) {
          localStorage.setItem(
            "characters",
            JSON.stringify(storedCharactersArray)
          );
          // change icon
          favIcon.remove("fas");
          favIcon.add("far");
          // alert message
          window.alert(
            character.data.results[0].name + " has been removed from favourites"
          );
        } else {
          window.alert("OOPS! Something went wrong!");
        }
      }
    } else {
      // current character is not a favourite character hence "Add to favrourites"
      try {
        storedCharactersArray.push(character.data.results[0]);
        // add to local storage
        localStorage.setItem(
          "characters",
          JSON.stringify(storedCharactersArray)
        );
        // change icon
        favIcon.remove("far");
        favIcon.add("fas");
        // alert message
        window.alert(character.data.results[0].name + " added to favourites");
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
      return true;
    }
  }
  return false;
}

// Removing character from the favourites
function removeFromFavourite(characterId, storedCharactersArray) {
  for (let i = 0; i < storedCharactersArray.length; i++) {
    if (storedCharactersArray[i].id == characterId) {
      console.log("SPLICING");
      storedCharactersArray.splice(i, 1);
      return true;
    }
  }
  return false;
}
