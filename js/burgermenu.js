let subMenu = document.querySelector(".sub-menu");

window.addEventListener("click", (e) => {
if (e.target.closest(".toggle")) {
    subMenu.style.display = "flex";
    } else {
    subMenu.style.display = "none";
    }
});