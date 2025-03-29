// === Constants ===
const BASE = "https://fsa-crud-2aa9294fe819.herokuapp.com/api";
const COHORT = "/2109-CPU-RM-WEB-PT";
const API = BASE + COHORT;

// === State ===
let parties = [];
let selectedParty = null;
let rsvps = [];
let guests = [];

/** Updates state with all parties from the API */
async function getParties() {
  try {
    const response = await fetch(API + "/events"); // fetch party data
    const result = await response.json(); //convert response to JSON
    parties = result.data; //store retrieved parties in state
    render(); // re-render UI with updated data
  } catch (e) {
    console.error(e);
  }
}

/**
 * Updates state with a single party from the API
 *
 * @param {number} id
 */
async function getParty(id) {
  try {
    const response = await fetch(API + "/events/" + id); //fetch party details
    const result = await response.json(); //convert response to JSON
    selectedParty = result.data; // store selected party in state
    render(); //re-reder UI with updated data
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with all RSVPs from the API */
async function getRsvps() {
  try {
    const response = await fetch(API + "/rsvps"); //fetch RSVP data
    const result = await response.json(); //convert response to JSON
    rsvps = result.data; //store RSVPs in state
    render(); //re-render UI with updated data
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with all guests from the API */
async function getGuests() {
  try {
    const response = await fetch(API + "/guests"); //fetch guest data
    const result = await response.json(); // conver response to JSON
    guests = result.data; //store guests in state
    render(); //re-render UI with updated data
  } catch (e) {
    console.error(e);
  }
}

// === Components ===

/**
 * Party name that shows more details about the party when clicked
 *
 * @param {Object} party - party object containing name and ID
 * @returns {HTMLElement} - list item element
 */
/** Party name that shows more details about the party when clicked */
function PartyListItem(party) {
  const $li = document.createElement("li");
  //highlight the selected party
  if (party.id === selectedParty?.id) {
    $li.classList.add("selected");
  }
  //add link to view party details
  $li.innerHTML = `
    <a href="#selected">${party.name}</a>
  `;
  $li.addEventListener("click", () => getParty(party.id));
  return $li;
}

/**
 * creates a list of all parties
 * @returns {HTMLElement} - unordered list element with party names
 */
function PartyList() {
  const $ul = document.createElement("ul");
  $ul.classList.add("parties");
  // map each party to a list item
  const $parties = parties.map(PartyListItem);
  $ul.replaceChildren(...$parties);

  return $ul;
}
/** A form to edit party details */
function PartyForm() {
  const $form = document.createElement("form");
  $form.innerHTML = `
    <h3>Edit Party Details</h3>
    <label for="name">Party Name:</label>
    <input type="text" id="name" value="${selectedParty?.name || ""}" />
    <label for="description">Description:</label>
    <textarea id="description">${selectedParty?.description || ""}</textarea>
    <label for="date">Date:</label>
    <input type="date" id="date" value="${
      selectedParty?.date?.slice(0, 10) || ""
    }" />
    <label for="location">Location:</label>
    <input type="text" id="location" value="${selectedParty?.location || ""}" />
    <button type="submit">Save Changes</button>
  `;

  $form.addEventListener("submit", (e) => {
    e.preventDefault();
    saveParty();
  });

  return $form;
}

/** Delete party functionality */
async function deleteParty() {
  if (selectedParty) {
    try {
      await fetch(API + "/events/" + selectedParty.id, {
        method: "DELETE",
      });
      selectedParty = null; // Reset selected party after deletion
      await getParties(); // Refresh the party list
    } catch (e) {
      console.error("Error deleting party:", e);
    }
  }
}
/**
 * Dispalys detailed information about the selected party
 *
 * @returns {HTMLElement}
 */
function SelectedParty() {
  if (!selectedParty) {
    const $p = document.createElement("p");
    $p.textContent = "Please select a party to learn more.";
    return $p;
  }

  const $party = document.createElement("section");
  $party.innerHTML = `
    <h3>${selectedParty.name} #${selectedParty.id}</h3>
    <time datetime="${selectedParty.date}">
      ${selectedParty.date.slice(0, 10)}
    </time>
    <address>${selectedParty.location}</address>
    <p>${selectedParty.description}</p>
    <GuestList></GuestList>
  `;
  //replace GuestList placeholder with actual component
  $party.querySelector("GuestList").replaceWith(GuestList());

  return $party;
}
/**
 * creates a list of guests attending the selected party
 * @returns {HTMLElement}
 */
function GuestList() {
  const $ul = document.createElement("ul");
  //filter guests attending the selected party based on RSVPs
  const guestsAtParty = guests.filter((guest) =>
    rsvps.find(
      (rsvp) => rsvp.guestId === guest.id && rsvp.eventId === selectedParty.id
    )
  );

  // Simple components can also be created anonymously:
  const $guests = guestsAtParty.map((guest) => {
    const $guest = document.createElement("li");
    $guest.textContent = guest.name;
    return $guest;
  });
  $ul.replaceChildren(...$guests);

  return $ul;
}

// === Render ===
function render() {
  const $app = document.querySelector("#app");
  $app.innerHTML = `
    <h1>Party Planner</h1>
    <main>
      <section>
        <h2>Upcoming Parties</h2>
        <PartyList></PartyList>
      </section>
      <section id="selected">
        <h2>Party Details</h2>
        <SelectedParty></SelectedParty>
      </section>
    </main>
  `;
  /**
   * Replaces placeholders with actual components
   */
  $app.querySelector("PartyList").replaceWith(PartyList());
  $app.querySelector("SelectedParty").replaceWith(SelectedParty());
}

/**
 * Initializes the application by fetching data and rendering the UI
 */
async function init() {
  await getParties(); // fetch all parties
  await getRsvps(); //fetch RSVPs
  await getGuests(); //Render the UI
  render();
}
//start the application
init();
