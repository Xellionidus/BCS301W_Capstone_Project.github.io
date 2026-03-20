document.addEventListener("DOMContentLoaded", function () {
  const revealItems = document.querySelectorAll(".reveal");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
    }
  );

  revealItems.forEach((item) => observer.observe(item));

  const bookingForm = document.getElementById("bookingForm");
  const confirmationMessage = document.getElementById("confirmationMessage");

  bookingForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const patientName = document.getElementById("patientName").value;
    const doctor = document.getElementById("doctor").value;
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;
    const type = document.getElementById("type").value;

    confirmationMessage.innerHTML = `
      <strong>Appointment Submitted</strong><br><br>
      <strong>Patient:</strong> ${patientName}<br>
      <strong>Doctor:</strong> ${doctor}<br>
      <strong>Date:</strong> ${date}<br>
      <strong>Time:</strong> ${time}<br>
      <strong>Type:</strong> ${type}<br><br>
   ;

    bookingForm.reset();
  });
});
