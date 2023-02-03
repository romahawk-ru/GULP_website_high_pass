const burgerMenu = document.getElementById('burger-menu');
const openBtn = document.getElementById('burger-open');
const closeBtn = document.getElementById('burger-close');

openBtn.addEventListener('click', () => {
  burgerMenu.classList.add('burger-is-active');
})

closeBtn.addEventListener('click', () => {
  burgerMenu.classList.remove('burger-is-active');
})


const searchOpenBtn = document.getElementById('search-open-btn');
const searchform = document.getElementById('search-form');

const toggleMenu = function () {
  searchform.classList.toggle("search-form-is-active");
}

searchOpenBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    toggleMenu();
});

document.addEventListener("click", function (e) {
    const target = e.target;
    const its_menu = target == searchform || searchform.contains(target);
    const its_btnMenu = target == searchOpenBtn;
    const menu_is_active = searchform.classList.contains("search-form-is-active");

    if (!its_menu && !its_btnMenu && menu_is_active) {
        toggleMenu();
    }
});
