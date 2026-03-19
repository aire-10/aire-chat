document.addEventListener("DOMContentLoaded", () => {
  renderNavbar();
});

function renderNavbar() {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;

  const isLoggedIn = !!localStorage.getItem("authToken");

  navbar.innerHTML = `
    <div class="landing-navbar">
      <a href="${isLoggedIn ? 'home.html' : 'landing.html'}" class="landing-logo">
        <img src="logo.png" alt="Airé Logo" />
        <span>Airé</span>
      </a>

      <nav class="landing-navlinks">
        ${
          isLoggedIn
            ? `
              <a href="home.html">Home</a>
              <a href="chat.html">Airé</a>
              <a href="journal.html">Journal</a>

              <div class="nav-dropdown">
                <button class="nav-dropbtn" type="button">Self Care ▾</button>
                <div class="nav-dropdown-menu">
                  <a href="grounding.html">Grounding</a>
                  <a href="breathing-mt.html">Breathing</a>
                  <a href="moodbooster.html">Mood Booster</a>
                </div>
              </div>

              <a href="growth.html">Butterfly Pet</a>

              <div class="nav-profile">
                <img id="navProfilePic" src="profile.jpeg" alt="Profile"/>

                <div class="profile-dropdown" id="profileDropdown">
                  <a href="profile.html">Profile</a>
                  <a href="#" id="hotlineBtn">Hotline</a>
                  <a href="#" id="logoutNav">Logout</a>
                </div>
              </div>
            `
            : `
              <a href="landing.html">Explore</a>
              <a href="home.html">Home</a>
              <a href="login.html">Login</a>
              <a href="signup.html">Sign Up</a>
            `
        }
      </nav>
    </div>
  `;

  const profile = navbar.querySelector(".nav-profile");
  const dropdown = navbar.querySelector("#profileDropdown");

  if (profile && dropdown) {
    profile.addEventListener("click", () => {
      dropdown.classList.toggle("show");
    });
  }

  const logout = navbar.querySelector("#logoutNav");
  if (logout) {
    logout.addEventListener("click", () => {
      localStorage.removeItem("authToken");
      window.location.href = "login.html";
    });
  }

  const hotline = navbar.querySelector("#hotlineBtn");
  if (hotline) {
    hotline.addEventListener("click", () => {
      alert(
        "Hotlines:\n\n" +
        "Talian Harapan: 145\n" +
        "Emergency: 991"
      );
    });
  }

  const navPic = navbar.querySelector("#navProfilePic");

  try {
    const user = JSON.parse(localStorage.getItem("aire_user_profile"));

    if (user && user.photoDataUrl && navPic) {
      navPic.src = user.photoDataUrl;
    }
  } catch (e) {
    console.log("No profile photo found");
  }
}