document.addEventListener("DOMContentLoaded", () => {
  const groupForm = document.getElementById("groupForm");
  const niveauSelect = document.getElementById("Sousniveau");
  const sousNiveauSelect = document.getElementById("SousNiveau0");
  const startDateInput = document.getElementById("Startdate");
  const endDateInput = document.getElementById("Enddate");
  const titleInput = document.getElementById("Title");
  const profSelect = document.getElementById("Prof");

  // Désactiver le champ nom du groupe (lecture seule) et ajouter style grisé uniquement si on est dans le formulaire de groupe
  if (groupForm && titleInput) {
    titleInput.readOnly = true;
    titleInput.style.backgroundColor = "#f0f0f0";
    titleInput.style.cursor = "not-allowed";
  }

  const unterNiveaus = {
    A1: ["A 1.1", "A 1.2"],
    A2: ["A 2.1", "A 2.2"],
    B1: ["B 1.1", "B 1.2"],
    B2: ["B 2.1", "B 2.2"]
  };

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

  if (sousNiveauSelect) {
  sousNiveauSelect.addEventListener("change", updateGroupName);
}
if (startDateInput) {
  startDateInput.addEventListener("change", updateGroupName);
}

  // Chargement des profs depuis SharePoint
  async function loadLehrerList() {
  try {
    const response = await fetch("http://localhost:3000/lehrer");
    const lehrer = await response.json(); // tableau d'objets : { id, name }

    if (Array.isArray(lehrer) && profSelect) {
      profSelect.innerHTML = '<option value="">Bitte wählen</option>';
      lehrer.forEach(prof => {
        const option = document.createElement("option");
        option.value = prof.id; // l'ID sera stocké comme value
        option.textContent = prof.name;
        profSelect.appendChild(option);
      });
    }
  } catch (err) {
    console.error("❌ Fehler beim Laden der Lehrer:", err);
  }
}

  loadLehrerList();

if (profSelect) {
  profSelect.addEventListener("change", updateGroupName);
}

  function updateGroupName() {
    const niveau = niveauSelect.value;
    const unterniveau = sousNiveauSelect.value;
    const prof = profSelect.options[profSelect.selectedIndex]?.text || "";
    const startDate = startDateInput.value;

    if (niveau && unterniveau && prof && startDate) {
      const date = new Date(startDate);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const cleanedUnterniveau = unterniveau.replace(/\s/g, "");
      const name = `Niveau ${cleanedUnterniveau} ${prof} Session ${month}/${year}`;
      titleInput.value = name;
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

     const selectedProfId = profSelect.value;
const selectedProfName = profSelect.options[profSelect.selectedIndex].text;

const data = {
  Title: titleInput.value,
  Sousniveau: niveauSelect.value,
  SousNiveau0: sousNiveauSelect.value,
  Prof: selectedProfName,  // nom pour affichage
  ProfId: selectedProfId,  // ID pour relation Power BI
  Startdate: startDateInput.value,
  Enddate: endDateInput.value,
};


      try {
        const response = await fetch("http://localhost:3000/add-group", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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

  function showNotification(message) {
    const notification = document.getElementById("notification");
    if (!notification) return;

    notification.textContent = message;
    notification.classList.add("show");

    setTimeout(() => {
      notification.classList.remove("show");
    }, 5000);
  }


// Ajouter la logique d'enregistrement du professeur dans SharePoint

  const teacherForm = document.getElementById("teacherForm");

  if (teacherForm) {
    const teacherName = document.getElementById("teacherName");
    const phoneNumber = document.getElementById("phoneNumber");

    teacherForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = teacherName.value.trim();
      const phone = phoneNumber.value.trim();

      try {
        const response = await fetch("http://localhost:3000/api/teachers", {
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

  // ✅ Notification flottante
  function showNotification(message) {
    const notification = document.getElementById("notification");
    if (!notification) return;

    notification.textContent = message;
    notification.classList.add("show");

    setTimeout(() => {
      notification.classList.remove("show");
    }, 5000);
  }
});

  // ----- Animation des boutons dans menu.html -----
  const menuButtons = document.querySelectorAll(".menu-button");
  if (menuButtons.length > 0) {
    menuButtons.forEach((btn, index) => {
      btn.style.opacity = 0;
      btn.style.transform = "translateY(20px)";
      setTimeout(() => {
        btn.style.transition = "all 0.4s ease";
        btn.style.opacity = 1;
        btn.style.transform = "translateY(0)";
      }, index * 150); // léger décalage entre les boutons
    });
  }

// ----- Notification flottante -----
function showNotification(message) {
  const notification = document.getElementById("notification");
  if (!notification) return;

  notification.textContent = message;
  notification.classList.add("show");

  setTimeout(() => {
    notification.classList.remove("show");
  }, 5000);
}



// -------------------- État add candidate --------------------
let currentStep = 1;

async function createCandidateAndGoToStep2() {
    const form = document.getElementById("candidateForm");
    const formData = new FormData(form);
    const data = {};

    formData.forEach((value, key) => {
        data[key] = value;
    });
    data["vollst_x00e4_ndigerName"] = `${data["Title"]} ${data["Nachname"]}`;
    console.log("📤 Données envoyées :", data);

    try {
        const response = await fetch("http://localhost:3000/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (!response.ok) throw new Error("Erreur lors de la création du candidat.");

        const result = await response.json();

        // Supposons que result.id = ID SharePoint retourné
        const itemId = result.id || result.ID || result.Id;
        localStorage.setItem("kandidatId", itemId);

        window.location.href = "step2.html";
    } catch (error) {
        console.error("❌ Erreur:", error);
        alert("Une erreur est survenue. Veuillez réessayer.");
    }
}
const phoneInput = document.getElementById("phone");

if (phoneInput) {
  phoneInput.addEventListener("input", () => {
    phoneInput.value = phoneInput.value.replace(/\D/g, "").slice(0, 8);
  });
}


// step2

// -------------------- Groupe & Lehrer (conservés) --------------------
document.addEventListener("DOMContentLoaded", () => {
  // Groupe Form Logic
  
  

  // Boutons animés (menu.html)
  const menuButtons = document.querySelectorAll(".menu-button");
  if (menuButtons.length > 0) {
    menuButtons.forEach((btn, index) => {
      btn.style.opacity = 0;
      btn.style.transform = "translateY(20px)";
      setTimeout(() => {
        btn.style.transition = "all 0.4s ease";
        btn.style.opacity = 1;
        btn.style.transform = "translateY(0)";
      }, index * 150);
    });
  }
});

// script.js

document.addEventListener("DOMContentLoaded", () => {
  const form1 = document.getElementById("step1Form");
  const form2 = document.getElementById("step2Form");
  const form3 = document.getElementById("step3Form");

  if (form1) form1.addEventListener("submit", handleStep1);
  if (form2) {
    populateGroups();
    setupSublevelFilter();
    form2.addEventListener("submit", handleStep2);
  }
  if (form3) form3.addEventListener("submit", handleStep3);

const childrenSelect = document.getElementById("children");
const numChildren = document.getElementById("numChildren");

if (childrenSelect && numChildren) {
  childrenSelect.addEventListener("change", () => {
    if (childrenSelect.value === "Ja") {
      numChildren.readOnly = false;
      numChildren.value = ""; // l'utilisateur doit remplir manuellement
    } else {
      numChildren.readOnly = true;
      numChildren.value = "0"; // valeur fixe envoyée à SharePoint
    }
  });
}

});

async function handleStep1(e) {
  e.preventDefault();
  const formData = Object.fromEntries(new FormData(e.target));

  const response = await fetch("http://localhost:3000/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  // ✅ Ajout du bloc de vérification
  if (!response.ok) {
    const errorText = await response.text(); // Lire le message d'erreur brut
    console.error("❌ Server error:", errorText);
    alert("Erreur côté serveur : " + errorText);
    return; // Empêche la suite de s'exécuter
  }

  const result = await response.json();
  localStorage.setItem("candidateId", result.id);
  window.location.href = "step2.html";
}


async function handleStep2(e) {
  e.preventDefault();
  const id = localStorage.getItem("candidateId");

  const formData = Object.fromEntries(new FormData(e.target));  // 🔧 d’abord on le définit

  console.log("📤 Données envoyées (Step 2):", formData);        // ✅ ensuite on log

  const response = await fetch(`http://localhost:3000/update/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("❌ Erreur mise à jour Step 2:", errorText);
    alert("Erreur lors de l’enregistrement des données (étape 2)");
    return;
  }

  window.location.href = "step3.html";
}


async function handleStep3(e) {
  e.preventDefault();
  const id = localStorage.getItem("candidateId");

  const formData = Object.fromEntries(new FormData(e.target));
  console.log("📤 Données envoyées (Step 3):", formData);

  const response = await fetch(`http://localhost:3000/update/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("❌ Erreur mise à jour Step 3:", errorText);
    alert("Erreur lors de l’enregistrement des données (étape 3)");
    return;
  }

  //localStorage.removeItem("candidateId");
  window.location.href = "Überprüfung.html";
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

  const response = await fetch("http://localhost:3000/groupes");
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

document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("reviewForm");
  if (!form) return;

  const candidateId = localStorage.getItem("candidateId");
  if (!candidateId) {
    alert("❌ Keine Kandidaten-ID gefunden.");
    return;
  }

  try {
    // 🔁 Récupération des données du candidat
    const response = await fetch(`http://localhost:3000/get/${candidateId}`);
    const data = await response.json();

    // 🧠 Stocker l'état initial pour comparaison
    const initialData = { ...data };

    // 🔄 Remplir les champs du formulaire
    for (const [key, value] of Object.entries(data)) {
      const input = form.querySelector(`[name="${key}"]`);
      if (input) {
  if (input.type === "date" && value) {
    // ✅ Formater correctement la date : 2025-12-31
    const formattedDate = new Date(value).toISOString().split("T")[0];
    input.value = formattedDate;
  } else {
    input.value = value ?? "";
  }
}

    }

    // 💾 Gérer la soumission
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(form);
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
        return;
      }

      const patchResponse = await fetch(`http://localhost:3000/update/${candidateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (patchResponse.ok) {
        alert("✅ Änderungen erfolgreich gespeichert!");
      } else {
        alert("❌ Fehler beim Speichern.");
      }
    });
  } catch (err) {
    console.error("❌ Fehler beim Laden der Daten:", err);
    alert("Fehler beim Laden der Daten.");
  }
});

