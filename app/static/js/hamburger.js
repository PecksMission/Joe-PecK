var hamburger = document.getElementById('hamburger');
var mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', function() {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});
function closeMobile() {
  hamburger.classList.remove('open');
  mobileMenu.classList.remove('open');
}
