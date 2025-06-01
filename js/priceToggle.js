const monthlyBtn = document.getElementById("monthlyBtn");
const yearlyBtn = document.getElementById("yearlyBtn");
const prices = document.querySelectorAll(".price");
const durations = document.querySelectorAll(".duration");

monthlyBtn.addEventListener("click", () => {
  monthlyBtn.classList.add("active");
  yearlyBtn.classList.remove("active");

  prices.forEach(price => {
    price.textContent = price.dataset.monthly;
  });
  durations.forEach(d => d.textContent = "/month");
});

yearlyBtn.addEventListener("click", () => {
  yearlyBtn.classList.add("active");
  monthlyBtn.classList.remove("active");

  prices.forEach(price => {
    price.textContent = price.dataset.yearly;
  });
  durations.forEach(d => d.textContent = "/year");
});