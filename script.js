const memeContainer = document.getElementById("memeContainer");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");

let allMemes = [];

// Fonction pour récupérer les mèmes depuis le fichier JSONBlob en ligne
function fetchMemes() {
  fetch("https://jsonblob.com/api/jsonBlob/1341512672054796288")
    .then((response) => response.text()) // On récupère la réponse en texte
    .then((text) => {
      const data = JSON.parse(text); // On parse manuellement le JSON
      allMemes = data;
      displayMemes(allMemes);
    })
    .catch((error) =>
      console.error("Erreur lors de la récupération des mèmes :", error)
    );
}

// Fonction pour afficher les mèmes sur la page
function displayMemes(memes) {
  memeContainer.innerHTML = "";
  memes.forEach((meme) => {
    const memeCard = document.createElement("div");
    memeCard.classList.add("meme-card");

    const title = meme["title"] || "Mème sans titre";
    const imgSrc = meme["image src"] || "";
    const pageUrl = meme["card href"] || "#";
    const downloadUrl = meme["card-footer-item href 2"] || imgSrc;

    let mediaContent = "";

    // Vérifier si c'est une vidéo ou une image
    if (imgSrc.endsWith(".mp4") || imgSrc.endsWith(".webm")) {
      mediaContent = `
    <video controls muted loop width="100%">
      <source src="${imgSrc}" type="video/mp4">
      <source src="${imgSrc}" type="video/webm">
      Ton navigateur ne supporte pas la vidéo.
    </video>
  `;
    } else {
      mediaContent = `<img src="${imgSrc}" alt="${title}">`;
    }

    memeCard.innerHTML = `
    <h3>${title}</h3>
    ${mediaContent}
    <p>Source : TrouveTonMeme</p>
    <div class="meme-actions">
        <button class="download-btn">📥 Télécharger</button>
        <button class="copy-url-btn">🔗 Copier l’URL</button>
        <button class="fullscreen-btn">🔍 Plein écran</button>
    </div>
`;

    // Ajouter les événements aux boutons après leur création
    addMemeActions(memeCard, downloadUrl, title);

    memeContainer.appendChild(memeCard);
  });
}

// Fonction pour ajouter les actions aux boutons d’une carte mème
function addMemeActions(card, imgSrc, imgName) {
  const downloadBtn = card.querySelector(".download-btn");
  const copyUrlBtn = card.querySelector(".copy-url-btn");
  const fullscreenBtn = card.querySelector(".fullscreen-btn");

  // Télécharger l'image via Blob (pour les images et vidéos)
  downloadBtn.addEventListener("click", async () => {
    if (imgSrc.endsWith(".mp4") || imgSrc.endsWith(".webm")) {
      // Si c'est une vidéo → Ouvre dans un nouvel onglet pour permettre le téléchargement
      window.open(imgSrc, "_blank");
    } else {
      // Si c'est une image → Téléchargement classique avec fetch et blob
      try {
        const response = await fetch(imgSrc);
        const blob = await response.blob();
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = imgName; // Nom du fichier
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      } catch (error) {
        console.error("Erreur lors du téléchargement :", error);
      }
    }
  });

  // Copier l'URL dans le presse-papier
  copyUrlBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(imgSrc).then(() => {
      showCopyFeedback();
    });
  });

  // Plein écran adapté pour images ET vidéos
  fullscreenBtn.addEventListener("click", () => {
    const modal = document.createElement("div");
    modal.classList.add("meme-modal");

    let mediaContent;
    if (imgSrc.endsWith(".mp4") || imgSrc.endsWith(".webm")) {
      mediaContent = `
        <video controls autoplay loop style="max-width: 90vw; max-height: 90vh;">
          <source src="${imgSrc}" type="video/mp4">
          <source src="${imgSrc}" type="video/webm">
          Ton navigateur ne supporte pas cette vidéo.
        </video>
      `;
    } else {
      mediaContent = `<img src="${imgSrc}" alt="Meme en plein écran" style="max-width: 90vw; max-height: 90vh;">`;
    }

    modal.innerHTML = `
      <div class="meme-modal-content">
        <span class="close-modal">&times;</span>
        ${mediaContent}
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector(".close-modal").onclick = () => modal.remove();
    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };
  });
}

// Feedback visuel "Lien copié"
function showCopyFeedback() {
  let feedback = document.querySelector(".copied-feedback");
  if (!feedback) {
    feedback = document.createElement("div");
    feedback.classList.add("copied-feedback");
    feedback.textContent = "Lien copié dans le presse-papier !";
    document.body.appendChild(feedback);
  }

  feedback.style.display = "block";
  setTimeout(() => {
    feedback.style.display = "none";
  }, 2000);
}

// Fonction recherche mèmes
function searchMemes() {
  const query = searchInput.value.toLowerCase();
  const filteredMemes = allMemes.filter((meme) =>
    meme["title"].toLowerCase().includes(query)
  );
  displayMemes(filteredMemes);
}

// Événements
searchButton.addEventListener("click", searchMemes);
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    searchMemes();
  }
});

// Charger les mèmes au démarrage
fetchMemes();
