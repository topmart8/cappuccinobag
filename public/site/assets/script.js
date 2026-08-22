const forms = document.querySelectorAll(".lead-form");
const whatsappBase = "https://wa.me/8613928715568";
const attributionKey = "cappuccino_first_touch";
const currentAttributionKey = "cappuccino_current_visit";

function cleanUrl(value) {
  try {
    const url = new URL(value, window.location.origin);
    const sensitive = /name|mail|phone|whats|address|message|company|contact/i;
    [...url.searchParams.keys()].forEach((key) => {
      const value = url.searchParams.get(key) || "";
      if (
        sensitive.test(key)
        || /[^\s@]+@[^\s@]+\.[^\s@]+/.test(value)
        || /^\+?[\d\s().-]{7,}$/.test(value)
      ) url.searchParams.delete(key);
    });
    url.hash = "";
    return url.toString();
  } catch {
    return "";
  }
}

function getAttribution() {
  const params = new URLSearchParams(window.location.search);
  const current = {
    site: "cappuccinobag",
    landing_page: cleanUrl(window.location.href),
    visit_time: new Date().toISOString(),
    referrer: cleanUrl(document.referrer),
    utm_source: params.get("utm_source") || "",
    utm_medium: params.get("utm_medium") || "",
    utm_campaign: params.get("utm_campaign") || "",
    utm_content: params.get("utm_content") || "",
    utm_term: params.get("utm_term") || "",
    gclid: params.get("gclid") || "",
    msclkid: params.get("msclkid") || "",
  };
  try {
    const first = JSON.parse(window.localStorage.getItem(attributionKey) || "null") || {
      ...current,
      first_landing_page: current.landing_page,
      first_visit_time: current.visit_time,
    };
    const visit = JSON.parse(window.sessionStorage.getItem(currentAttributionKey) || "null")
      || JSON.parse(window.localStorage.getItem(currentAttributionKey) || "null")
      || current;
    return {
      site: "cappuccinobag",
      first_landing_page: first.first_landing_page || first.landing_page,
      first_visit_time: first.first_visit_time || first.visit_time,
      referrer: first.referrer || "",
      utm_source: first.utm_source || "",
      utm_medium: first.utm_medium || "",
      utm_campaign: first.utm_campaign || "",
      utm_content: first.utm_content || "",
      utm_term: first.utm_term || "",
      gclid: first.gclid || "",
      msclkid: first.msclkid || "",
      current_page_url: cleanUrl(window.location.href),
      current_referrer: visit.referrer || "",
      current_utm_source: visit.utm_source || "",
      current_utm_medium: visit.utm_medium || "",
      current_utm_campaign: visit.utm_campaign || "",
      current_utm_content: visit.utm_content || "",
      current_utm_term: visit.utm_term || "",
      current_gclid: visit.gclid || "",
      current_msclkid: visit.msclkid || "",
      submit_time: new Date().toISOString(),
      device: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop",
    };
  } catch {
    return {
      first_landing_page: current.landing_page,
      current_page_url: cleanUrl(window.location.href),
      submit_time: new Date().toISOString(),
    };
  }
}

function getWhatsAppUrl() {
  const page = window.location.href.slice(0, 700);
  const context = new URLSearchParams(window.location.search).get("product") || document.querySelector("h1")?.textContent?.trim() || "your products";
  const code = /pet/i.test(context) ? "CAP-PET" : /padel|pickleball|tennis/i.test(context) ? "CAP-PDL" : /travel/i.test(context) ? "CAP-TRV" : "CAP-OUT";
  const message = `Hello Cappuccino Bag, I am interested in ${context}. I visited: ${page}. Source: ${code}`;
  return `${whatsappBase}?text=${encodeURIComponent(message)}`;
}

function preselectInquiryContext(form) {
  const params = new URLSearchParams(window.location.search);
  const project = params.get("product") || "";
  const format = params.get("format") || "";
  const intention = form.elements.inquiry_intention;
  const product = form.elements.product_needed;
  const message = form.elements.message;

  if (/pet/i.test(`${project} ${format}`)) {
    if (intention) intention.value = "Pet Travel Bag Project";
    if (product) {
      const specific = Array.from(product.options)
        .filter((item) => format.toLowerCase().includes(item.value.toLowerCase()))
        .sort((a, b) => b.value.length - a.value.length)[0];
      product.value = specific?.value || "Pet Travel Bags";
    }
    if (message && format) message.value = `Pet travel product: ${format}\n`;
    const secondaryFields = form.querySelector(".rfq-secondary");
    if (secondaryFields) secondaryFields.open = true;
    return;
  }

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

function submissionIdFor(form) {
  if (!form.dataset.submissionId) {
    form.dataset.submissionId = window.crypto.randomUUID();
  }
  return form.dataset.submissionId;
}

function completeSubmission(form) {
  delete form.dataset.submissionId;
}

forms.forEach((form) => {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formName = form.dataset.form || "inquiry";
    const endpoint = "/api/inquiries";
    const payload = {
      ...Object.fromEntries(new FormData(form).entries()),
      ...getAttribution(),
      submission_id: submissionIdFor(form),
    };

    if (endpoint) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error("Lead endpoint failed.");
        completeSubmission(form);
        window.cappuccinoAnalytics?.trackLeadSuccess(
          formName === "sample" ? "sample_request" : "product_inquiry",
          result.inquiryNumber,
          { product_category: payload.product_category || payload.product || "" },
        );
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

function initializeInquiryForm(form) {
  preselectInquiryContext(form);

  if (form.dataset.inquiryInitialized === "true") return;
  form.dataset.inquiryInitialized = "true";

  form.addEventListener("input", (event) => {
    const field = event.target;
    if (!field.matches("input, textarea, select")) return;
    const label = field.closest("label");
    if (!label) return;
    label.classList.remove("is-invalid");
    setInquiryStatus(form, "", "");
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (form.dataset.submitting === "true") return;

    if (form.website && form.website.value) {
      setInquiryStatus(
        form,
        "Submission blocked. Please try again later.",
        "error",
      );
      return;
    }

    if (!validateInquiryForm(form)) return;
    form.dataset.submitting = "true";
    form.setAttribute("aria-busy", "true");

    const submitButton = form.querySelector('button[type="submit"]');
    const endpoint = "/api/inquiries";
    const formData = new FormData(form);
    formData.delete("website");
    Object.entries(getAttribution()).forEach(([key, value]) => formData.set(key, value || ""));
    formData.set("submission_id", submissionIdFor(form));
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
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error("Inquiry endpoint failed.");
        completeSubmission(form);
        window.cappuccinoAnalytics?.trackLeadSuccess(
          "rfq",
          result.inquiryNumber,
          { product_category: payload.product_needed || payload.product || "" },
        );
      }

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
      delete form.dataset.submitting;
      form.removeAttribute("aria-busy");
      submitButton.classList.remove("is-loading");
      submitButton.disabled = false;
      submitButton.textContent = "Send My Project";
    }
  });
}

document.querySelectorAll(".inquiry-form").forEach(initializeInquiryForm);

const inquiryFormObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType !== 1) return;
      if (node.matches(".inquiry-form")) initializeInquiryForm(node);
      node.querySelectorAll(".inquiry-form").forEach(initializeInquiryForm);

      const inquiryForm = node.matches("option")
        ? node.closest(".inquiry-form")
        : node.querySelector("option")?.closest(".inquiry-form");
      if (inquiryForm) preselectInquiryContext(inquiryForm);
    });
  });
});

inquiryFormObserver.observe(document.body, { childList: true, subtree: true });

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
    source.addEventListener("error", () => markProofVideoUnavailable(video));
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

function markProofVideoUnavailable(video) {
  video.closest(".proof-video-frame")?.classList.add("is-unavailable");
}

function initializeProofVideoFallbacks() {
  document.querySelectorAll(".proof-video-frame video").forEach((video) => {
    video.addEventListener("error", () => markProofVideoUnavailable(video));
    if (video.error) markProofVideoUnavailable(video);
  });
}

function addWhatsAppFloat() {
  if (window.location.pathname.startsWith("/inquiry")) return;
  if (document.querySelector(".whatsapp-float")) return;
  const link = document.createElement("a");
  link.className = "whatsapp-float";
  link.href = getWhatsAppUrl();
  link.target = "_blank";
  link.rel = "noopener";
  link.setAttribute("aria-label", "Chat with us on WhatsApp");
  link.setAttribute("data-track", "whatsapp_float_click");
  link.innerHTML =
    '<span class="whatsapp-icon">☎</span><span class="whatsapp-pulse"></span>';
  document.body.appendChild(link);
}

function brandWhatsAppLinks() {
  document.querySelectorAll('a[href*="wa.me/"]').forEach((link) => {
    link.href = getWhatsAppUrl();
    link.rel = "noopener noreferrer";
  });
}

function addQuoteFloat() {
  if (window.location.pathname.startsWith("/inquiry")) return;
  if (document.querySelector(".quote-float")) return;
  const link = document.createElement("a");
  link.className = "quote-float";
  link.href = "/inquiry/";
  link.setAttribute("aria-label", "Request a quote");
  link.setAttribute("data-track", "floating_quote_click");
  link.textContent = "Request Quote";
  document.body.appendChild(link);
}

brandWhatsAppLinks();
addWhatsAppFloat();
addQuoteFloat();
initializeProofVideoFallbacks();
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
