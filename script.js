const navToggle = document.getElementById("navToggle");
const mainNav = document.getElementById("mainNav");

const USER = "vinklat";
const DOMAIN = "seznam.cz";

if (navToggle && mainNav) {
    navToggle.addEventListener("click", () => {
        mainNav.classList.toggle("open");
    });

    mainNav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            mainNav.classList.remove("open");
        });
    });
}

const yearEl = document.getElementById("year");
if (yearEl) {
    yearEl.textContent = new Date().getFullYear().toString();
}

const heroEmailButton = document.getElementById("heroEmailButton");
if (heroEmailButton) {
    heroEmailButton.addEventListener("click", (e) => {
        e.preventDefault();
        const subject = encodeURIComponent("Poptávka – Autofólie Vodňany");
        const email = `${USER}@${DOMAIN}`;
        window.location.href = `mailto:${email}?subject=${subject}`;
    });
}

const contactEmailButton = document.getElementById("contactEmailButton");
if (contactEmailButton) {
    contactEmailButton.addEventListener("click", (e) => {
        e.preventDefault();
        const subject = encodeURIComponent("Poptávka – Autofólie Vodňany");
        const email = `${USER}@${DOMAIN}`;
        window.location.href = `mailto:${email}?subject=${subject}`;
    });
}

async function loadPriceList() {
    const container = document.getElementById("priceCards");
    if (!container) return;

    try {
        const response = await fetch("data/cenik.csv");
        if (!response.ok) {
            container.innerHTML = "<p>Ceník se nepodařilo načíst.</p>";
            return;
        }

        const text = await response.text();
        const lines = text.trim().split(/\r?\n/);

        if (lines.length <= 1) {
            container.innerHTML = "<p>Ceník zatím není k dispozici.</p>";
            return;
        }

        const rows = lines.slice(1);
        container.innerHTML = "";

        rows.forEach((line) => {
            if (!line.trim()) return;

            const parts = line.split(";");
            const title = (parts[0] || "").replace(/^"|"$/g, "");
            const price = (parts[1] || "").replace(/^"|"$/g, "");
            const itemsRaw = (parts[2] || "").replace(/^"|"$/g, "");

            const card = document.createElement("div");
            card.className = "price-card";

            const h3 = document.createElement("h3");
            h3.textContent = title;

            const priceEl = document.createElement("p");
            priceEl.className = "price";
            priceEl.textContent = price;

            const ul = document.createElement("ul");
            if (itemsRaw) {
                itemsRaw.split("|").forEach((item) => {
                    const trimmed = item.trim();
                    if (!trimmed) return;
                    const li = document.createElement("li");
                    li.textContent = trimmed;
                    ul.appendChild(li);
                });
            }

            const inner = document.createElement("div");
            inner.className = "price-card-inner";

            const leftCol = document.createElement("div");
            leftCol.className = "price-left";
            leftCol.appendChild(h3);
            leftCol.appendChild(priceEl);

            const rightCol = document.createElement("div");
            rightCol.className = "price-right";
            if (ul.children.length > 0) {
                rightCol.appendChild(ul);
            }

            inner.appendChild(leftCol);
            inner.appendChild(rightCol);
            card.appendChild(inner);

            card.addEventListener("click", () => {
                const subject = encodeURIComponent(`Poptávka – ${title}`);
                const bodyLines = [
                    "Dobrý den,",
                    "",
                    "měl(a) bych zájem o polep:",
                    `${title} za ${price}`,
                    "",
                    "Prosím o zaslání dodatečných informací a časových možností.",
                    "",
                    "Děkuji a přeji hezký den."
                ];
                const body = encodeURIComponent(bodyLines.join("\n"));
                const email = `${USER}@${DOMAIN}`;
                window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
            });

            container.appendChild(card);
        });
    } catch (error) {
        container.innerHTML = "<p>Ceník se nepodařilo načíst.</p>";
        console.error(error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadPriceList();
});