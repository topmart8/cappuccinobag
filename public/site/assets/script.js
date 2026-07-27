const forms = document.querySelectorAll(".lead-form");
const inquiryForms = document.querySelectorAll(".inquiry-form");
const whatsappUrl =
  "https://wa.me/8613928715568?text=Hello%2C%20I%20am%20interested%20in%20your%20products.%20Please%20send%20me%20more%20details.";

function preselectInquiryContext(form) {
  const params = new URLSearchParams(window.location.search);
  const project = params.get("product") || "";
  const format = params.get("format") || "";
  const intention = form.elements.inquiry_intention;
  const product = form.elements.product_needed;
  const message = form.elements.message;

  if (/padel/i.test(project)) {
    if (intention) {
      const option = Array.from(intention.options).find((item) => /padel/i.test(item.value));
      if (option) intention.value = option.value;
    }
    if (product) product.value = "Padel Bags";
    if (message && format) message.value = `Padel product format: ${format}\n`;
    return;
  }

  if (/running|outdoor sports bags/i.test(`${project} ${format}`)) {
    if (intention) intention.value = "Outdoor Sports Bag Project";
    if (product) product.value = "Outdoor Sports Bags";
    if (message && format) {
      message.value = `Running product format: ${format}\n`;
    }
  }
}

function showToast(message) {
  const oldToast = document.querySelector(".toast");
  if (oldToast) oldToast.remove();
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  window.setTimeout(() => toast.remove(), 4200);
}

forms.forEach((form) => {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formName = form.dataset.form || "inquiry";
    const endpoint = form.dataset.endpoint;
    const payload = Object.fromEntries(new FormData(form).entries());

    if (endpoint) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error("Lead endpoint failed.");
        showToast(
          "Submitted successfully. Our sales team will contact you soon.",
        );
      } catch (error) {
        showToast("Submission failed. Please contact us on WhatsApp or email.");
      }
    } else {
      showToast(
        "Submitted successfully. Our sales team will contact you soon.",
      );
    }

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: `${formName}_submit`,
      form_name: formName,
    });
  });
});

function setInquiryStatus(form, message, type) {
  const status = form.querySelector(".form-status");
  if (!status) return;
  status.textContent = message;
  status.classList.remove("is-success", "is-error");
  if (type) status.classList.add(`is-${type}`);
}

function validateInquiryForm(form) {
  let isValid = true;
  const fields = form.querySelectorAll("input, textarea, select");

  fields.forEach((field) => {
    if (field.name === "website") return;
    const label = field.closest("label");
    if (!label) return;

    const value = field.value ? field.value.trim() : "";
    const emptyRequired = field.required && !value;
    const invalidPattern = value && !field.checkValidity();

    label.classList.toggle("is-invalid", emptyRequired || invalidPattern);
    if (emptyRequired || invalidPattern) isValid = false;
  });

  if (!isValid) {
    setInquiryStatus(
      form,
      "Please complete all required fields with valid contact information.",
      "error",
    );
  }

  return isValid;
}

inquiryForms.forEach((form) => {
  preselectInquiryContext(form);
  form.addEventListener("input", (event) => {
    const field = event.target;
    if (!field.matches("input, textarea")) return;
    const label = field.closest("label");
    if (!label) return;
    label.classList.remove("is-invalid");
    setInquiryStatus(form, "", "");
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (form.website && form.website.value) {
      setInquiryStatus(
        form,
        "Submission blocked. Please try again later.",
        "error",
      );
      return;
    }

    if (!validateInquiryForm(form)) return;

    const submitButton = form.querySelector('button[type="submit"]');
    const endpoint = form.dataset.endpoint;
    const formData = new FormData(form);
    formData.delete("website");
    const hasFile = Array.from(
      form.querySelectorAll('input[type="file"]'),
    ).some((input) => input.files && input.files.length);
    const payload = Object.fromEntries(formData.entries());

    submitButton.classList.add("is-loading");
    submitButton.disabled = true;
    submitButton.textContent = "Submitting...";
    setInquiryStatus(form, "Sending your inquiry...", "");

    try {
      if (endpoint) {
        const response = await fetch(
          endpoint,
          hasFile
            ? { method: "POST", body: formData }
            : {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              },
        );
        if (!response.ok) throw new Error("Inquiry endpoint failed.");
      }

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "b2b_inquiry_submit",
        form_name: form.dataset.form || "b2b_inquiry",
      });

      setInquiryStatus(
        form,
        "Submitted successfully. Our sales team will contact you soon.",
        "success",
      );
      form.reset();
    } catch (error) {
      setInquiryStatus(
        form,
        "Submission failed. Please try again or contact us on WhatsApp.",
        "error",
      );
    } finally {
      submitButton.classList.remove("is-loading");
      submitButton.disabled = false;
      submitButton.textContent = "Send My Project";
    }
  });
});

document.querySelectorAll("[data-track]").forEach((element) => {
  element.addEventListener("click", () => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: element.dataset.track,
    });
  });
});

function hydrateLazyVideos() {
  const lazyVideos = document.querySelectorAll("video[data-video-src]");
  if (!lazyVideos.length) return;

  const loadVideo = (video) => {
    if (video.dataset.loaded === "true") return;
    const source = document.createElement("source");
    source.src = video.dataset.videoSrc;
    source.type = video.dataset.videoType || "video/mp4";
    video.appendChild(source);
    video.dataset.loaded = "true";
    video.load();
    if (video.autoplay) {
      video.play().catch(() => {});
    }
  };

  if (!("IntersectionObserver" in window)) {
    lazyVideos.forEach(loadVideo);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        loadVideo(entry.target);
        observer.unobserve(entry.target);
      });
    },
    {
      rootMargin: "240px 0px",
    },
  );

  lazyVideos.forEach((video) => observer.observe(video));
}

function addWhatsAppFloat() {
  if (document.querySelector(".whatsapp-float")) return;
  const link = document.createElement("a");
  link.className = "whatsapp-float";
  link.href = whatsappUrl;
  link.target = "_blank";
  link.rel = "noopener";
  link.setAttribute("aria-label", "Chat with us on WhatsApp");
  link.setAttribute("data-track", "whatsapp_float_click");
  link.innerHTML =
    '<span class="whatsapp-icon">☎</span><span class="whatsapp-pulse"></span>';
  document.body.appendChild(link);
}

function addQuoteFloat() {
  if (document.querySelector(".quote-float")) return;
  const link = document.createElement("a");
  link.className = "quote-float";
  link.href = "/inquiry/";
  link.setAttribute("aria-label", "Request a quote");
  link.setAttribute("data-track", "floating_quote_click");
  link.textContent = "Request Quote";
  document.body.appendChild(link);
}

addWhatsAppFloat();
addQuoteFloat();
hydrateLazyVideos();

document.querySelectorAll("video[data-stop-before-end]").forEach((video) => {
  const seconds = Number(video.dataset.stopBeforeEnd || 0);
  if (!seconds) return;
  video.addEventListener("timeupdate", () => {
    if (!Number.isFinite(video.duration) || video.duration <= seconds) return;
    if (video.currentTime >= video.duration - seconds) {
      if (video.loop) {
        video.currentTime = 0;
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    }
  });
});
