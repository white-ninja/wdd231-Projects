const navToggle = document.querySelector('.nav-toggle');
const navList = document.getElementById('primary-navigation');
const lastModified = document.getElementById('last-modified');
const currentYear = document.getElementById('current-year');

const weatherIcon = document.getElementById('weather-icon');
const currentTemp = document.getElementById('current-temp');
const currentDescription = document.getElementById('current-weather-desc');
const forecastList = document.getElementById('forecast');

const spotlightContainer = document.getElementById('spotlight-cards');

function toggleNav() {
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';

    navToggle.setAttribute('aria-expanded', !isOpen);
    navList.dataset.visible = !isOpen;
}

/* close menu when clicking a link */
document.querySelectorAll(".nav-list a").forEach(link => {
    link.addEventListener("click", () => {
        navToggle.setAttribute("aria-expanded", "false");
        navList.dataset.visible = "false";
    });
});

/* close menu with ESC key */
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        navToggle.setAttribute("aria-expanded", "false");
        navList.dataset.visible = "false";
    }
});

function updateFooterDates() {
    currentYear.textContent = new Date().getFullYear();
    lastModified.textContent = document.lastModified || 'Unknown';
}

function createMemberCard(member) {
    const article = document.createElement('article');
    article.className = 'member';

    const picture = document.createElement('div');
    picture.className = 'member__image';
    const img = document.createElement('img');
    img.src = `images/${member.image}`;
    img.alt = `${member.name} logo`;
    img.loading = 'lazy';
    picture.appendChild(img);

    const content = document.createElement('div');
    content.className = 'member__content';

    const header = document.createElement('header');
    header.className = 'member__header';
    const name = document.createElement('h3');
    name.textContent = member.name;

    const tagline = document.createElement('p');
    tagline.className = 'member__tagline';
    tagline.textContent = member.tagline || 'Proud Chamber member';

    header.append(name, tagline);

    const info = document.createElement('dl');
    info.className = 'member__info';

    const address = document.createElement('div');
    address.className = 'member__info-row';
    address.innerHTML = `<dt>Address</dt><dd>${member.address}</dd>`;

    const phone = document.createElement('div');
    phone.className = 'member__info-row';
    phone.innerHTML = `<dt>Phone</dt><dd><a href='tel:${member.phone}'>${member.phone}</a></dd>`;

    const website = document.createElement('div');
    website.className = 'member__info-row';
    website.innerHTML = `<dt>Website</dt><dd><a href='${member.website}' target='_blank' rel='noopener'>${member.website.replace(/^https?:\/\//, '')}</a></dd>`;

    const membership = document.createElement('div');
    membership.className = 'member__info-row';
    const level = parseInt(member.membership, 10);
    membership.innerHTML = `<dt>Level</dt><dd>${level === 3 ? 'Gold' : level === 2 ? 'Silver' : 'Member'}</dd>`;

    info.append(membership, address, phone, website);
    content.append(header, info);
    article.append(picture, content);
    return article;
}

async function loadSpotlights() {
    try {
        const response = await fetch('data/members.json');
        if (!response.ok) throw new Error('Could not load members data.');

        const members = await response.json();
        const eligible = members.filter((m) => Number(m.membership) >= 2);

        // randomize and pick up to 3
        const shuffled = eligible.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3);

        spotlightContainer.innerHTML = '';
        if (!selected.length) {
            spotlightContainer.innerHTML = '<p>No spotlight members available now, try again later.</p>';
            return;
        }

        selected.forEach((member) => spotlightContainer.appendChild(createMemberCard(member)));
    } catch (error) {
        spotlightContainer.innerHTML = `<p class='error'>${error.message}</p>`;
        console.error(error);
    }
}

function parseForecastData(data) {
    // choose one reported block per day at 12:00:00 (local)
    const daily = [];
    const utcOffset = data.city?.timezone || 0;

    data.list.forEach((entry) => {
        const date = new Date((entry.dt + utcOffset) * 1000);
        const day = date.toISOString().split('T')[0];
        const time = date.getUTCHours();

        if (time === 12 && daily.length < 3 && !daily.some((d) => d.day === day)) {
            daily.push({ day, temp: entry.main.temp, description: entry.weather[0].description, icon: entry.weather[0].icon });
        }
    });

    return daily;
}

async function loadWeather() {
    const apiKey = '18f4323cc9f4fa3ffc93e97b8382210a';
    const lat = 6.6059;
    const lon = 3.3227;

    try {
        const respWeather = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);
        if (!respWeather.ok) throw new Error('Weather API failed.');

        const current = await respWeather.json();
        currentTemp.textContent = `${Math.round(current.main.temp)} °C`;
        const description = current.weather[0].description;
        currentDescription.textContent = description;
        weatherIcon.src = `https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`;
        weatherIcon.alt = description;

        const respForecast = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);
        if (!respForecast.ok) throw new Error('Forecast API failed.');

        const forecast = await respForecast.json();
        const forecastDays = parseForecastData(forecast);

        forecastList.innerHTML = '';
        if (!forecastDays.length) {
            forecastList.innerHTML = '<li>Forecast is unavailable right now.</li>';
            return;
        }

        forecastDays.forEach((f) => {
            const li = document.createElement('li');
            li.style.cssText = 'padding:0.75rem; background:var(--color-panel); border:1px solid var(--color-border); border-radius:var(--radius);';
            const date = new Date(f.day);
            const weekday = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            li.innerHTML = `<strong>${weekday}</strong>: ${Math.round(f.temp)} °C, ${f.description}`;
            forecastList.appendChild(li);
        });
    } catch (error) {
        currentDescription.textContent = 'Unable to retrieve weather.';
        console.error(error);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    updateFooterDates();
    loadWeather();
    loadSpotlights();

    if (navToggle) {
        navToggle.addEventListener('click', toggleNav);
    }
});