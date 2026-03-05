// pokemonDetail.js — Fetches a single Pokémon from PokeAPI and renders its detail page.

(() => {
  'use strict';

  // ─── 1. Read the Pokémon ID from the URL ───
  // When we navigate here from a card, the URL looks like:
  //   pokemonDetail.html?id=25
  // URLSearchParams lets us grab that "25" easily.
  const params = new URLSearchParams(window.location.search);
  const pokemonId = params.get('id');

  // ─── 2. Grab references to the HTML elements we need to fill ───
  const els = {
    loading:   document.getElementById('loading'),     // "Cargando…" message
    error:     document.getElementById('error'),       // "No se encontró" message
    detail:    document.getElementById('pokemon-detail'), // The main card (hidden)
    img:       document.getElementById('pokemon-img'),
    name:      document.getElementById('pokemon-name'),
    id:        document.getElementById('pokemon-id'),
    types:     document.getElementById('pokemon-types'),
    abilities: document.getElementById('pokemon-abilities'),
    stats:     document.getElementById('pokemon-stats'),
  };

  // ─── 3. Validate: if there's no ID in the URL, show error immediately ───
  if (!pokemonId) {
    showError();
    return;           // Stop here — nothing to fetch
  }

  // ─── 4. Kick off the fetch ───
  fetchPokemon(pokemonId);

  // ─── 5. Main function: call the API and render ───
  async function fetchPokemon(nameOrId) {
    try {
      // Call PokeAPI.  encodeURIComponent makes the value URL-safe
      // (spaces or special characters won't break the URL).
      const url = `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(nameOrId)}`;
      const res = await fetch(url);

      // If the API returns 404 (not found) or any other error status,
      // throw so we jump to the catch block.
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      // Parse the JSON body — this is the full Pokémon object with
      // sprites, types, abilities, stats, etc.
      const data = await res.json();

      // Hand the data off to the render function
      renderDetail(data);

    } catch (err) {
      // Any network error or bad status lands here
      console.error('Failed to load Pokémon:', err);
      showError();
    }
  }

  // ─── 6. Render: fill every element with data from the API ───
  function renderDetail(poke) {
    // --- Image ---
    // PokeAPI provides several sprite options. We prefer the official artwork
    // because it's the highest quality.  If that's missing, we fall back to
    // dream_world, then the basic front sprite, then a transparent pixel.
    const imgUrl =
      poke.sprites?.other?.['official-artwork']?.front_default ||
      poke.sprites?.other?.dream_world?.front_default ||
      poke.sprites?.front_default ||
      'data:image/gif;base64,R0lGODlhAQABAAAAACw=';

    els.img.src = imgUrl;
    els.img.alt = `Image of ${capitalize(poke.name)}`;

    // --- Name & ID ---
    els.name.textContent = capitalize(poke.name);               // "Pikachu"
    els.id.textContent   = `#${String(poke.id).padStart(4, '0')}`; // "#0025"

    // Update the page title in the browser tab
    document.title = `${capitalize(poke.name)} — Pokédex`;

    // --- Type chips ---
    // poke.types is an array like:
    //   [{ slot: 1, type: { name: "electric", url: "..." } }]
    // We create a coloured <span> for each type.
    for (const t of poke.types) {
      const chip = document.createElement('span');
      chip.className = `type-chip type-chip--${t.type.name}`;
      chip.textContent = t.type.name;
      els.types.appendChild(chip);
    }

    // --- Abilities ---
    // poke.abilities is an array like:
    //   [{ ability: { name: "static", url: "..." }, is_hidden: false }, ...]
    // We create an <li> for each one.
    for (const ab of poke.abilities) {
      const li = document.createElement('li');
      li.textContent = ab.ability.name;
      // Mark hidden abilities so the user knows they're special
      if (ab.is_hidden) {
        li.textContent += ' (oculta)';
      }
      els.abilities.appendChild(li);
    }

    // Base stats
    // poke.stats is an array like:
    //   [{ base_stat: 35, stat: { name: "hp" } }, ...]
    // We show each one as "hp — 35".
    for (const s of poke.stats) {
      const li = document.createElement('li');
      li.innerHTML = `<span>${s.stat.name}</span> <strong>${s.base_stat}</strong>`;
      els.stats.appendChild(li);
    }

    // Swap visibility: hide loading, show the filled card 
    els.loading.hidden = true;
    els.detail.hidden  = false;
  }

  // 7. Helper: show the error state
  function showError() {
    els.loading.hidden = true;   // Hide "Cargando…"
    els.error.hidden   = false;  // Show "No se encontró"
  }

  // 8. Helper: capitalize first letter
  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

})();
