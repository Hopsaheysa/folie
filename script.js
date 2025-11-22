const navToggle = document.getElementById("navToggle");
const mainNav = document.getElementById("mainNav");

const USER = "vinklat";
const MAGIC_NUMBER = 64;
const ZAV = String.fromCharCode(MAGIC_NUMBER); // lol
const DOMAIN = "seznam.cz";
const CONTACT_EMAIL = `${USER}${ZAV}${DOMAIN}`;

let pendingEmailSubject = null;
let pendingEmailBody = null;
const CONTACT_BUTTON_DEFAULT_LABEL = "Napsat e-mail";

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

function buildDefaultBody() {
    return [
        "Dobrý den,",
        "",
        "měl(a) bych zájem o tónování autoskel / polep.",
        "",
        "Prosím o zaslání dodatečných informací a časových možností.",
        "",
        "Děkuji a přeji hezký den."
    ].join("\n");
}

function tryOpenEmail(address, subjectText, bodyText = "") {
    const subject = encodeURIComponent(subjectText);
    const body = bodyText ? encodeURIComponent(bodyText) : "";

    let href = `mailto:${address}?subject=${subject}`;
    if (body) {
        href += `&body=${body}`;
    }

    window.location.href = href;
}

function transformContactButtonToEmail(address) {
    const oldBtn = document.getElementById("contactEmailButton");
    if (!oldBtn) return;

    if (document.getElementById("contactEmailFallback")) {
        return;
    }

    const span = document.createElement("span");
    span.id = "contactEmailFallback";
    span.className = "email-copy";
    span.textContent = address;

    oldBtn.replaceWith(span);
    copyWithFeedback(span, address);

    span.addEventListener("click", () => {
        copyWithFeedback(span, address);

        const subject = pendingEmailSubject || "Poptávka – Autofólie Vodňany";
        const body = pendingEmailBody || buildDefaultBody();
        tryOpenEmail(address, subject, body);
    });
}

function copyWithFeedback(element, text) {
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
        return;
    }

    navigator.clipboard.writeText(text).then(() => {
        const original = element.textContent;
        element.textContent = `${text} (zkopírováno)`;
        setTimeout(() => {
            element.textContent = original;
        }, 1500);
    }).catch(() => {
        // ignore copy errors
    });
}

function pulseContactButton(delayMs = 0) {
    const btn = document.getElementById("contactEmailButton");
    if (!btn) return;

    const run = () => {
        btn.classList.remove("contact-mail-pulse");
        void btn.offsetWidth;
        btn.classList.add("contact-mail-pulse");
    };

    if (delayMs > 0) {
        setTimeout(run, delayMs);
    } else {
        run();
    }
}

const heroButton = document.getElementById("heroEmailButton");
if (heroButton) {
    heroButton.textContent = "Kontaktovat";
    heroButton.addEventListener("click", (e) => {
        e.preventDefault();

        pendingEmailSubject = null;
        pendingEmailBody = null;

        const contactSection = document.getElementById("contact");
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: "smooth" });
            pulseContactButton(1500);
        }
    });
}

const contactEmailButton = document.getElementById("contactEmailButton");
if (contactEmailButton) {
    contactEmailButton.textContent = CONTACT_BUTTON_DEFAULT_LABEL;

    contactEmailButton.addEventListener("click", (e) => {
        e.preventDefault();

        const subject = pendingEmailSubject || "Poptávka – Autofólie Vodňany";
        const body = pendingEmailBody || buildDefaultBody();

        tryOpenEmail(CONTACT_EMAIL, subject, body);
        transformContactButtonToEmail(CONTACT_EMAIL);
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

        rows.forEach((line, index) => {
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
                const rightInner = document.createElement("div");
                rightInner.className = "price-right-inner";
                rightInner.appendChild(ul);
                rightCol.appendChild(rightInner);
            }

            inner.appendChild(leftCol);
            inner.appendChild(rightCol);
            card.appendChild(inner);

            card.addEventListener("click", () => {
                const subject = `Poptávka – ${title}`;
                const bodyLines = [
                    "Dobrý den,",
                    "",
                    "měl(a) bych zájem o polep:",
                    `${title} (${price})`,
                    "",
                    "Prosím o zaslání dodatečných informací a časových možností.",
                    "",
                    "Děkuji a přeji hezký den."
                ];
                const body = bodyLines.join("\n");

                pendingEmailSubject = subject;
                pendingEmailBody = body;

                if (contactEmailButton) {
                    contactEmailButton.textContent = `Napsat o: ${title}`;
                }

                const contactSection = document.getElementById("kontakt");
                if (contactSection) {
                    contactSection.scrollIntoView({ behavior: "smooth" });
                    pulseContactButton(600);
                }
            });

            container.appendChild(card);
        });
    } catch (error) {
        container.innerHTML = "<p>Ceník se nepodařilo načíst.</p>";
        console.error(error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    void loadPriceList();
});
