function initContactForm() {
  const contactForm = document.querySelector("#contactForm");

  if (!contactForm) {
    return;
  }

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const firstName = contactForm.querySelector("#contactFirstName").value.trim();
    const lastName = contactForm.querySelector("#contactLastName").value.trim();
    const email = contactForm.querySelector("#contactEmail").value.trim();
    const message = contactForm.querySelector("#contactMessage").value.trim();
    const messageElement = contactForm.querySelector(".form-message");

    if (!firstName || !lastName || !email || !message) {
      messageElement.textContent = "Please fill in all fields.";
      messageElement.className = "form-message error";
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      messageElement.textContent = "Please enter a valid email address.";
      messageElement.className = "form-message error";
      return;
    }

    messageElement.textContent = "Message sent successfully.";
    messageElement.className = "form-message success";
    contactForm.reset();
  });
}
