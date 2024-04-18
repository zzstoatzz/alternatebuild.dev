document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contact-form');
  
    form.addEventListener('submit', function(event) {
      event.preventDefault();
  
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const message = document.getElementById('message').value;
  
      const mailtoURL = `mailto:nate@prefect.io?subject=Contact Form Submission&body=Name: ${encodeURIComponent(name)}%0D%0AEmail: ${encodeURIComponent(email)}%0D%0AMessage: ${encodeURIComponent(message)}`;
  
      window.location.href = mailtoURL;
  
      // Reset form fields
      form.reset();
  
      // Display success message to the user
      alert('Thank you for your message! Your email client will open with your message.');
    });
  });