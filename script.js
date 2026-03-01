const layout = document.getElementById('layout');
const toggle = document.getElementById('sidebarToggle');
const overlay = document.getElementById('overlay');
const menuLinks = [...document.querySelectorAll('.menu a')];
const sections = [...document.querySelectorAll('main .section')];

sections.forEach((section) => section.classList.add('reveal-init'));

const desktopQuery = window.matchMedia('(min-width: 1024px)');

function closeMobileSidebar() {
  if (!desktopQuery.matches) layout.classList.remove('sidebar-open');
}

function setupInitialState() {
  if (desktopQuery.matches) {
    layout.classList.add('sidebar-open');
    document.body.classList.toggle('sidebar-collapsed-desktop', layout.classList.contains('sidebar-collapsed'));
    toggle.setAttribute('aria-expanded', String(!layout.classList.contains('sidebar-collapsed')));
  } else {
    layout.classList.remove('sidebar-open', 'sidebar-collapsed');
    document.body.classList.remove('sidebar-collapsed-desktop');
    toggle.setAttribute('aria-expanded', 'false');
  }
}

function activateMenuByHash(hash) {
  menuLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === hash));
}

toggle.addEventListener('click', () => {
  if (desktopQuery.matches) {
    layout.classList.toggle('sidebar-collapsed');
    document.body.classList.toggle('sidebar-collapsed-desktop', layout.classList.contains('sidebar-collapsed'));
    toggle.setAttribute('aria-expanded', String(!layout.classList.contains('sidebar-collapsed')));
  } else {
    layout.classList.toggle('sidebar-open');
    toggle.setAttribute('aria-expanded', String(layout.classList.contains('sidebar-open')));
  }
});

overlay.addEventListener('click', closeMobileSidebar);
menuLinks.forEach((link) => {
  link.addEventListener('click', () => {
    activateMenuByHash(link.getAttribute('href'));
    closeMobileSidebar();
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('is-visible');
    });
  },
  { threshold: 0.15 }
);
sections.forEach((section) => revealObserver.observe(section));

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) activateMenuByHash(`#${entry.target.id}`);
    });
  },
  { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
);
sections.forEach((section) => navObserver.observe(section));

desktopQuery.addEventListener('change', setupInitialState);
setupInitialState();
