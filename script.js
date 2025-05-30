const API_BASE = "https://mwcschoolback-production.up.railway.app";
console.log("UserAgent:", navigator.userAgent);

// Redirection automatique depuis "index.html" selon l'appareil
const currentPage = window.location.pathname.split("/").pop();
console.log("Page actuelle :", currentPage);

if (currentPage === "index.html" || currentPage === "") {
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  console.log("Appareil détecté :", isMobile ? "mobile" : "desktop");

  const target = isMobile ? "main.html" : "indexwelcome.html";
  window.location.replace(target);
}


document.addEventListener("DOMContentLoaded", () => {
  // ----- Groupe Form Logic -----
  const groupForm = document.getElementById("groupForm");
  const niveauSelect = document.getElementById("Sousniveau");
  const sousNiveauSelect = document.getElementById("SousNiveau0");
  const startDateInput = document.getElementById("Startdate");
  const endDateInput = document.getElementById("Enddate");
  const titleInput = document.getElementById("Title");
  const profSelect = document.getElementById("Prof");

  const unterNiveaus = {
    A1: ["A 1.1", "A 1.2"],
    A2: ["A 2.1", "A 2.2"],
    B1: ["B 1.1", "B 1.2"],
    B2: ["B 2.1", "B 2.2"]
  };

  if (titleInput) {
    titleInput.readOnly = true;
    titleInput.style.backgroundColor = "#f0f0f0";
    titleInput.style.cursor = "not-allowed";
  }

  if (niveauSelect && sousNiveauSelect) {
    niveauSelect.addEventListener("change", () => {
      const selected = niveauSelect.value;
      sousNiveauSelect.innerHTML = '<option value="">Bitte wählen</option>';
      if (unterNiveaus[selected]) {
        unterNiveaus[selected].forEach(value => {
          const option = document.createElement("option");
          option.value = value;
          option.textContent = value;
          sousNiveauSelect.appendChild(option);
        });
      }
      updateGroupName();
    });
  }

  if (sousNiveauSelect) sousNiveauSelect.addEventListener("change", updateGroupName);
  if (startDateInput) startDateInput.addEventListener("change", updateGroupName);
  if (profSelect) profSelect.addEventListener("change", updateGroupName);

  async function loadLehrerList() {
    try {
      const response = await fetch(`${API_BASE}/lehrer`);
      const lehrer = await response.json();
      if (Array.isArray(lehrer) && profSelect) {
        profSelect.innerHTML = '<option value="">Bitte wählen</option>';
        lehrer.forEach(prof => {
          const option = document.createElement("option");
          option.value = prof.id;
          option.textContent = prof.name;
          profSelect.appendChild(option);
        });
      }
    } catch (err) {
      console.error("❌ Fehler beim Laden der Lehrer:", err);
    }
  }
  loadLehrerList();

  function updateGroupName() {
    const niveau = niveauSelect?.value;
    const unterniveau = sousNiveauSelect?.value;
    const prof = profSelect?.options[profSelect.selectedIndex]?.text || "";
    const startDate = startDateInput?.value;

    if (niveau && unterniveau && prof && startDate) {
      const date = new Date(startDate);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const cleanedUnterniveau = unterniveau.replace(/\s/g, "");
      const name = `Niveau ${cleanedUnterniveau} ${prof} Session ${month}/${year}`;
      if (titleInput) titleInput.value = name;
    }
  }

  if (groupForm) {
    groupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const start = new Date(startDateInput.value);
      const end = new Date(endDateInput.value);
      if (start >= end) {
        alert("❌ Das Enddatum muss nach dem Startdatum liegen.");
        return;
      }

      const data = {
        Title: titleInput.value,
        Sousniveau: niveauSelect.value,
        SousNiveau0: sousNiveauSelect.value,
        Prof: profSelect.options[profSelect.selectedIndex].text,
        ProfId: profSelect.value,
        Startdate: startDateInput.value,
        Enddate: endDateInput.value
      };

      try {
        const response = await fetch(`${API_BASE}/add-group`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (response.ok) {
          showNotification("✅ Gruppe erfolgreich gespeichert!");
          groupForm.reset();
        } else {
          alert("❌ Fehler beim Speichern.");
        }
      } catch (error) {
        console.error("Fehler beim Senden:", error);
        alert("❌ Netzwerkfehler oder Server nicht erreichbar.");
      }
    });
  }

  // ----- Lehrer Form -----
  const teacherForm = document.getElementById("teacherForm");
  if (teacherForm) {
    const teacherName = document.getElementById("teacherName");
    const phoneNumber = document.getElementById("phoneNumber");

    teacherForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = teacherName.value.trim();
      const phone = phoneNumber.value.trim();

      try {
        const response = await fetch(`${API_BASE}/api/teachers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, phone })
        });
        if (response.ok) {
          showNotification("✅ Professeur enregistré avec succès.");
          teacherForm.reset();
        } else {
          const error = await response.text();
          showNotification("❌ Erreur : " + error);
        }
      } catch (err) {
        console.error("❌ Erreur réseau:", err);
        showNotification("❌ Erreur lors de l'enregistrement.");
      }
    });
  }

   // ----- Formulaire Step 1 (Candidat) -----
  const step1Form = document.getElementById("step1Form");
  if (step1Form) {
    const kinderField = document.getElementById("children");
    const anzahlField = document.getElementById("numChildren");

    // Initialisation du champ enfants
    if (anzahlField) {
      anzahlField.readOnly = true;
      anzahlField.value = "0";
      anzahlField.style.backgroundColor = "#f0f0f0";
    }

    if (kinderField && anzahlField) {
      kinderField.addEventListener("change", () => {
        if (kinderField.value === "Ja") {
          anzahlField.readOnly = false;
          anzahlField.style.backgroundColor = "#ffffff";
          anzahlField.value = "";
        } else {
          anzahlField.readOnly = true;
          anzahlField.style.backgroundColor = "#f0f0f0";
          anzahlField.value = "0";
        }
      });
    }

    step1Form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Sécurité : forcer à 0 si bloqué
      if (anzahlField && anzahlField.readOnly) {
        anzahlField.value = "0";
      }

      const formData = Object.fromEntries(new FormData(step1Form));
      formData["vollst_x00e4_ndigerName"] = `${formData["Title"]} ${formData["Nachname"]}`;

      try {
        const response = await fetch(`${API_BASE}/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error(await response.text());

        const result = await response.json();
        localStorage.setItem("candidateId", result.id);
        window.location.href = "step2.html";
      } catch (error) {
        console.error("❌ Erreur:", error);
        alert("Erreur lors de la création du candidat.");
      }
    });
  }

  // ----- Step 2 -----
  const step2Form = document.getElementById("step2Form");
  if (step2Form) {
    populateGroups();
    setupSublevelFilter();
    step2Form.addEventListener("submit", handleStep2);
  }

  async function handleStep2(e) {
    e.preventDefault();
    const id = localStorage.getItem("candidateId");
    const formData = Object.fromEntries(new FormData(e.target));

    try {
      const response = await fetch(`${API_BASE}/update/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error(await response.text());

      window.location.href = "step3.html";
    } catch (error) {
      console.error("❌ Erreur mise à jour Step 2:", error);
      alert("Erreur lors de l’enregistrement des données (étape 2)");
    }
  }

  // ----- Step 3 -----
  const step3Form = document.getElementById("step3Form");
  if (step3Form) {
    step3Form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = localStorage.getItem("candidateId");
      const formData = Object.fromEntries(new FormData(e.target));

      try {
        const response = await fetch(`${API_BASE}/update/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error(await response.text());

        window.location.href = "Überprüfung.html";
      } catch (error) {
        console.error("❌ Erreur mise à jour Step 3:", error);
        alert("Erreur lors de l’enregistrement des données (étape 3)");
      }
    });
  }

  // ----- Review Form (Überprüfung.html) -----
  const reviewForm = document.getElementById("reviewForm");
  if (reviewForm) {
    const candidateId = localStorage.getItem("candidateId");
    if (!candidateId) return alert("❌ Keine Kandidaten-ID gefunden.");

    (async () => {
      try {
        const response = await fetch(`${API_BASE}/get/${candidateId}`);
        const data = await response.json();
        const initialData = { ...data };

        for (const [key, value] of Object.entries(data)) {
          const input = reviewForm.querySelector(`[name="${key}"]`);
          if (input) {
            if (input.type === "date" && value) {
              input.value = new Date(value).toISOString().split("T")[0];
            } else {
              input.value = value ?? "";
            }
          }
        }

        // Gestion du comportement du champ "AnzahlderKinder" dans Überprüfung.html
// Ajouter ce bloc à la fin du remplissage automatique :
const kinderField = document.getElementById("children");
const anzahlField = document.getElementById("numChildren");

function toggleNumChildrenField() {
  if (!kinderField || !anzahlField) return;
  if (kinderField.value === "Ja") {
    anzahlField.readOnly = false;
    anzahlField.style.backgroundColor = "#ffffff";
  } else {
    anzahlField.readOnly = true;
    anzahlField.style.backgroundColor = "#f0f0f0";
    anzahlField.value = "0";
  }
}

if (kinderField && anzahlField) {
  toggleNumChildrenField(); // appel immédiat après remplissage
  kinderField.addEventListener("change", toggleNumChildrenField); // écoute changement
}
const saveAndAddBtn = document.getElementById("saveAndAdd");
const saveAndExitBtn = document.getElementById("saveAndExit");

if (saveAndAddBtn && saveAndExitBtn) {
  saveAndAddBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    await handleReviewSubmission("step1.html");
  });

  saveAndExitBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    await handleReviewSubmission("index.html");
  });
}


async function handleReviewSubmission(redirectTo) {
  const formData = new FormData(reviewForm);
  const updatedData = {};
  let hasChanges = false;

  for (const [key, value] of formData.entries()) {
    if (initialData[key] !== value) {
      updatedData[key] = value;
      hasChanges = true;
    }
  }

  if (!hasChanges) {
    alert("ℹ️ Keine Änderungen erkannt.");
    window.location.href = redirectTo;
    return;
  }

  const patchResponse = await fetch(`${API_BASE}/update/${candidateId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedData),
  });

  if (patchResponse.ok) {
    
    window.location.href = redirectTo;
  } else {
    alert("❌ Fehler beim Speichern.");
  }
}
      } catch (err) {
        console.error("❌ Fehler beim Laden der Daten:", err);
        alert("Fehler beim Laden der Daten.");
      }
    })();
  }

  // ----- Menu Animation -----
  const menuButtons = document.querySelectorAll(".menu-button");
  menuButtons.forEach((btn, index) => {
    btn.style.opacity = 0;
    btn.style.transform = "translateY(20px)";
    setTimeout(() => {
      btn.style.transition = "all 0.4s ease";
      btn.style.opacity = 1;
      btn.style.transform = "translateY(0)";
    }, index * 150);
  });

  // ----- Helper -----
  function showNotification(message) {
    const notification = document.getElementById("notification");
    if (!notification) return;
    notification.textContent = message;
    notification.classList.add("show");
    setTimeout(() => notification.classList.remove("show"), 5000);
  }

  function setupSublevelFilter() {
    const niveau = document.getElementById("niveau");
    const sublevel = document.getElementById("sublevel");
    const options = {
      A1: ["A 1.1", "A 1.2"],
      A2: ["A 2.1", "A 2.2"],
      B1: ["B 1.1", "B 1.2"],
      B2: ["B 2.1", "B 2.2"]
    };
    if (niveau && sublevel) {
      niveau.addEventListener("change", () => {
        sublevel.innerHTML = '<option value="" disabled selected>Bitte wählen...</option>';
        options[niveau.value]?.forEach(level => {
          const opt = document.createElement("option");
          opt.value = level;
          opt.textContent = level;
          sublevel.appendChild(opt);
        });
      });
    }
  }

  async function populateGroups() {
    const groupIds = [
      ["groupA11", "Niveau A1.1"],
      ["groupA12", "Niveau A1.2"],
      ["groupA21", "Niveau A2.1"],
      ["groupA22", "Niveau A2.2"],
      ["groupB11", "Niveau B1.1"],
      ["groupB12", "Niveau B1.2"],
      ["groupB21", "Niveau B2.1"],
      ["groupB22", "Niveau B2.2"]
    ];

    const response = await fetch(`${API_BASE}/groupes`);
    const groups = await response.json();

    groupIds.forEach(([selectId, prefix]) => {
      const select = document.getElementById(selectId);
      if (!select) return;
      groups.forEach(g => {
        if (g.Title.startsWith(prefix)) {
          const opt = document.createElement("option");
          opt.value = g.Title;
          opt.textContent = g.Title;
          select.appendChild(opt);
        }
      });
    });
  }
});
