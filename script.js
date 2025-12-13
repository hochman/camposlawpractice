document.addEventListener("DOMContentLoaded", () => {
  const year = document.getElementById("year");
  year.textContent = new Date().getFullYear();

  const enBtn = document.getElementById("en-btn");
  const ptBtn = document.getElementById("pt-btn");

  fetch("languages.json")
    .then(res => res.json())
    .then(data => {
      const elements = document.querySelectorAll("[data-key]");
      const setLanguage = (lang) => {
        elements.forEach(el => {
          const key = el.getAttribute("data-key");
          if (data[lang][key]) el.textContent = data[lang][key];
        });
      };

      setLanguage("en");

      enBtn.addEventListener("click", () => setLanguage("en"));
      ptBtn.addEventListener("click", () => setLanguage("pt"));
    });
});

document.getElementById("contact-form").addEventListener("submit", function (e) {
  e.preventDefault(); // impede recarregar a página

  const name = encodeURIComponent(document.getElementById("name").value);
  const email = encodeURIComponent(document.getElementById("email").value);
  const message = encodeURIComponent(document.getElementById("message").value);

  // Cria o assunto e o corpo do e-mail
  const subject = `Schedule Appointment: ${name}`;
  const body = `Hello Campos Law Practice,%0D%0A%0D%0A` +
               `My name is ${name}.%0D%0A` +
               `Email: ${email}%0D%0A%0D%0A` +
               `Message:%0D%0A${message}%0D%0A%0D%0A` +
               `Best regards,%0D%0A${name}`;

  // Abre o email no cliente padrão
  window.location.href = `mailto:info@camposlawpractice.com.au?subject=${subject}&body=${body}`;
});
