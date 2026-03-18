const directoryElement = document.getElementById("directory");
const loadingElement = document.getElementById("loading");
const gridButton = document.getElementById("grid-btn");
const listButton = document.getElementById("list-btn");
const lastModified = document.getElementById("last-modified");
const currentYear = document.getElementById("current-year");
const navToggle = document.querySelector(".nav-toggle");
const navList = document.getElementById("primary-navigation");

const STORAGE_KEY = "directory-view";

const viewModes = {
    GRID: "grid",
    LIST: "list",
};

function toggleNav() {
    if (!navToggle || !navList) return;
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!isOpen));
    navList.dataset.visible = String(!isOpen);
}

function formatMembership(level) {
    switch (Number(level)) {
        case 3:
            return "Gold Member";
        case 2:
            return "Silver Member";
        default:
            return "Member";
    }
}

function membershipClass(level) {
    switch (Number(level)) {
        case 3:
            return "gold";
        case 2:
            return "silver";
        default:
            return "member";
    }
}

function formatPhone(phone) {
    // Basic formatting; leave unchanged if already formatted
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) return phone;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function createMemberCard(member) {
    const article = document.createElement("article");
    article.className = "member";

    const picture = document.createElement("div");
    picture.className = "member__image";
    const img = document.createElement("img");
    img.src = `images/${member.image}`;
    img.alt = `${member.name} logo`;
    img.loading = "lazy";
    picture.appendChild(img);

    const content = document.createElement("div");
    content.className = "member__content";

    const header = document.createElement("header");
    header.className = "member__header";
    const name = document.createElement("h3");
    name.textContent = member.name;

    const badge = document.createElement("span");
    badge.className = `member__badge member__badge--${membershipClass(member.membership)}`;
    badge.textContent = formatMembership(member.membership);

    const tagline = document.createElement("p");
    tagline.className = "member__tagline";
    tagline.textContent = member.tagline;
    header.append(name, badge, tagline);

    const info = document.createElement("dl");
    info.className = "member__info";

    const membership = document.createElement("div");
    membership.className = "member__info-row";
    membership.innerHTML = `<dt>Membership</dt><dd>${formatMembership(member.membership)}</dd>`;

    const address = document.createElement("div");
    address.className = "member__info-row";
    address.innerHTML = `<dt>Address</dt><dd>${member.address}</dd>`;

    const phone = document.createElement("div");
    phone.className = "member__info-row";
    phone.innerHTML = `<dt>Phone</dt><dd><a href="tel:${member.phone}">${formatPhone(member.phone)}</a></dd>`;

    const website = document.createElement("div");
    website.className = "member__info-row";
    website.innerHTML = `<dt>Website</dt><dd><a href="${member.website}" target="_blank" rel="noopener">${member.website.replace(/^https?:\/\//, "")}</a></dd>`;

    info.append(membership, address, phone, website);

    content.append(header, info);
    article.append(picture, content);

    return article;
}

function renderMembers(members, view) {
    directoryElement.innerHTML = "";
    directoryElement.className = `directory ${view}`;

    const fragment = document.createDocumentFragment();
    members.forEach((member) => {
        fragment.appendChild(createMemberCard(member));
    });

    directoryElement.appendChild(fragment);
}

function setViewMode(view) {
    const isGrid = view === viewModes.GRID;
    gridButton.setAttribute("aria-pressed", isGrid);
    listButton.setAttribute("aria-pressed", !isGrid);
    gridButton.classList.toggle("is-active", isGrid);
    listButton.classList.toggle("is-active", !isGrid);
    localStorage.setItem(STORAGE_KEY, view);
    directoryElement.classList.remove(viewModes.GRID, viewModes.LIST);
    directoryElement.classList.add(view);
}

function attachViewControls(members) {
    gridButton.addEventListener("click", () => {
        setViewMode(viewModes.GRID);
        renderMembers(members, viewModes.GRID);
    });

    listButton.addEventListener("click", () => {
        setViewMode(viewModes.LIST);
        renderMembers(members, viewModes.LIST);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "g" || event.key === "G") {
            event.preventDefault();
            gridButton.click();
        }
        if (event.key === "l" || event.key === "L") {
            event.preventDefault();
            listButton.click();
        }
    });
}

async function loadMembers() {
    try {
        const response = await fetch("data/members.json");
        if (!response.ok) {
            throw new Error(`Failed to load members.json (${response.status})`);
        }
        const members = await response.json();
        const view = localStorage.getItem(STORAGE_KEY) || viewModes.GRID;
        setViewMode(view);
        renderMembers(members, view);
        attachViewControls(members);
    } catch (error) {
        directoryElement.innerHTML = `<p class="error">Unable to load directory at this time.<br>${error.message}</p>`;
        console.error(error);
    } finally {
        loadingElement?.remove();
    }
}

function updateFooterDates() {
    currentYear.textContent = new Date().getFullYear();
    lastModified.textContent = document.lastModified || "Unknown";
}

window.addEventListener("DOMContentLoaded", () => {
    updateFooterDates();
    loadMembers();

    if (navToggle) {
        navToggle.addEventListener("click", toggleNav);
    }
});
