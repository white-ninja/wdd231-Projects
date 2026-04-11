// Mobile navigation toggle - shared across all pages
const menuBtn = document.querySelector("#menuBtn");
const navMenu = document.querySelector("#navMenu");
const navLinks = document.querySelectorAll("#navMenu a");

// Toggle menu open/close
menuBtn?.addEventListener("click", () => {
    navMenu.classList.toggle("open");
    menuBtn.classList.toggle("active");
});

// Close menu when a nav link is clicked
navLinks.forEach(link => {
    link.addEventListener("click", () => {
        navMenu.classList.remove("open");
        menuBtn.classList.remove("active");
    });
});

// Close menu when clicking outside
document.addEventListener("click", (e) => {
    if (!e.target.closest("nav") && !e.target.closest("#menuBtn")) {
        navMenu.classList.remove("open");
        menuBtn.classList.remove("active");
    }
});

// Footer dates - shared across all pages
const currentYear = document.querySelector("#current-year");
const lastModified = document.querySelector("#last-modified");

if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
}

if (lastModified) {
    lastModified.textContent = document.lastModified;
}