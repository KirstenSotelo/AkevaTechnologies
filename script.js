// Use a self-executing function to avoid polluting the global namespace
;(() => {
  // Cache DOM selectors we'll use multiple times
  const DOM = {
    currentYear: document.getElementById("currentYear"),
    header: document.querySelector("header"),
    navLinks: document.querySelectorAll("nav ul li a"),
    sections: Array.from(document.querySelectorAll("section[id]")),
    animateElements: document.querySelectorAll(".feature-card, .about-content, .about-image"),
    slides: document.querySelectorAll(".logo-slide"),
    dots: document.querySelectorAll(".dot"),
    prevBtn: document.querySelector(".prev"),
    nextBtn: document.querySelector(".next"),
    dotsContainer: document.querySelector(".slideshow-dots"),
    mobileMenuToggle: document.querySelector(".mobile-menu-toggle"),
    nav: document.querySelector("nav"),
    scrollTop: document.querySelector(".scroll-top"),
    // Add hero and tech background elements
    heroSection: document.querySelector(".hero"),
    techBackground: document.querySelector(".tech-background"),
  }

  // Initialize on DOMContentLoaded with a single event listener
  document.addEventListener("DOMContentLoaded", init)

  // Main initialization function
  function init() {
    // Set current year
    if (DOM.currentYear) {
      DOM.currentYear.textContent = new Date().getFullYear()
    }

    // Initialize features only if their elements exist
    if (DOM.slides.length) initLogoSlideshow()
    if (DOM.navLinks.length) initNavLinks()
    if (DOM.header) initHeaderScroll()
    if (DOM.animateElements.length) initScrollAnimations()
    if (DOM.mobileMenuToggle) initMobileMenu()
    if (DOM.heroSection && DOM.techBackground) initBackgroundAdjustment()

    // These are always initialized
    initSmoothScrolling()
    initScrollToTop()
  }

  // New function to handle background adjustment
  function initBackgroundAdjustment() {
    // Initial adjustment
    adjustBackgroundHeight()
    adjustTechFrameVisibility()

    // Create a ResizeObserver to monitor hero section size changes
    if ("ResizeObserver" in window) {
      const resizeObserver = new ResizeObserver((entries) => {
        // When hero section size changes, adjust background
        adjustBackgroundHeight()
        adjustTechFrameVisibility()
      })

      // Observe the hero section
      resizeObserver.observe(DOM.heroSection)
    } else {
      // Fallback for browsers without ResizeObserver
      window.addEventListener("resize", adjustBackgroundHeight, { passive: true })
      window.addEventListener("resize", adjustTechFrameVisibility, { passive: true })
    }

    // Also adjust on scroll for dynamic content changes
    window.addEventListener("scroll", adjustBackgroundHeight, { passive: true })
    window.addEventListener("scroll", adjustTechFrameVisibility, { passive: true })
  }

  // Function to adjust background height based on content
  function adjustBackgroundHeight() {
    if (!DOM.heroSection || !DOM.techBackground) return

    // On mobile, ensure the background covers at least the hero section
    if (window.innerWidth <= 768) {
      const heroHeight = DOM.heroSection.offsetHeight
      const windowHeight = window.innerHeight
      const headerHeight = DOM.header ? DOM.header.offsetHeight : 0

      // Set background height to the maximum of hero height or window height
      DOM.techBackground.style.height = Math.max(heroHeight + headerHeight, windowHeight) + "px"

      // Change position to absolute on mobile for better performance
      DOM.techBackground.style.position = "absolute"
    } else {
      // Reset to viewport height and fixed position on larger screens
      DOM.techBackground.style.height = "100vh"
      DOM.techBackground.style.position = "fixed"
    }
  }

  // Function to adjust tech-frame visibility based on screen size
  function adjustTechFrameVisibility() {
    const techFrames = document.querySelectorAll(".tech-frame")
    if (techFrames.length === 0) return

    // Hide tech-frame on smaller screens
    if (window.innerWidth <= 992) {
      techFrames.forEach((frame) => {
        frame.style.display = "none"
      })
    } else {
      techFrames.forEach((frame) => {
        frame.style.display = "block"
      })
    }
  }

  // Mobile menu functionality
function initMobileMenu() {
  if (!DOM.mobileMenuToggle || !DOM.nav) return

  // Toggle menu when button is clicked
  DOM.mobileMenuToggle.addEventListener("click", (e) => {
    e.stopPropagation()
    DOM.nav.classList.toggle("active")
    document.body.classList.toggle("menu-open")

    // Change icon based on menu state
    const icon = DOM.mobileMenuToggle.querySelector("i")
    if (DOM.nav.classList.contains("active")) {
      icon.classList.remove("fa-bars")
      icon.classList.add("fa-times")
    } else {
      icon.classList.remove("fa-times")
      icon.classList.add("fa-bars")
    }

    // Adjust background when menu opens/closes
    if (DOM.heroSection && DOM.techBackground) {
      adjustBackgroundHeight()
    }
  })

  // Close menu when clicking on a link
  const navLinks = DOM.nav.querySelectorAll("a")
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      // Don't stop propagation here to allow normal link behavior
      DOM.nav.classList.remove("active")
      document.body.classList.remove("menu-open")

      // Change icon back to bars
      const icon = DOM.mobileMenuToggle.querySelector("i")
      icon.classList.remove("fa-times")
      icon.classList.add("fa-bars")
    })
  })

  // Close menu when clicking the overlay (body::after)
  document.addEventListener("click", (e) => {
    // Check if the click is on the overlay (not on the menu or toggle button)
    if (
      DOM.nav.classList.contains("active") &&
      !DOM.nav.contains(e.target) &&
      !DOM.mobileMenuToggle.contains(e.target)
    ) {
      DOM.nav.classList.remove("active")
      document.body.classList.remove("menu-open")

      // Change icon back to bars
      const icon = DOM.mobileMenuToggle.querySelector("i")
      icon.classList.remove("fa-times")
      icon.classList.add("fa-bars")
    }
  })

  // Close menu on window resize if screen becomes large
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768 && DOM.nav.classList.contains("active")) {
      DOM.nav.classList.remove("active")
      document.body.classList.remove("menu-open")

      // Change icon back to bars
      const icon = DOM.mobileMenuToggle.querySelector("i")
      icon.classList.remove("fa-times")
      icon.classList.add("fa-bars")
    }
  })
}


  // Logo Slideshow - Highly optimized
  function initLogoSlideshow() {
    let currentSlide = 0
    let slideInterval
    let isTransitioning = false
    const slidesCount = DOM.slides.length

    // Pre-calculate next and previous indices for better performance
    const nextIndices = new Array(slidesCount).fill(0).map((_, i) => (i + 1) % slidesCount)
    const prevIndices = new Array(slidesCount).fill(0).map((_, i) => (i - 1 + slidesCount) % slidesCount)

    // Show slide with optimized class toggling
    function showSlide(index) {
      if (isTransitioning || index === currentSlide) return
      isTransitioning = true

      // Remove active class from current slide and dot
      DOM.slides[currentSlide].classList.remove("active")
      DOM.dots[currentSlide].classList.remove("active")

      // Add active class to new slide and dot
      DOM.slides[index].classList.add("active")
      DOM.dots[index].classList.add("active")

      // Update current slide index
      currentSlide = index

      // Reset transition lock after animation completes
      setTimeout(() => {
        isTransitioning = false
      }, 600)
    }

    // Event delegation for dots
    if (DOM.dotsContainer) {
      DOM.dotsContainer.addEventListener("click", (e) => {
        if (e.target.classList.contains("dot")) {
          const slideIndex = Number.parseInt(e.target.getAttribute("data-index"), 10)
          showSlide(slideIndex)
          resetInterval()
        }
      })
    }

    // Previous button click handler
    if (DOM.prevBtn) {
      DOM.prevBtn.addEventListener("click", () => {
        showSlide(prevIndices[currentSlide])
        resetInterval()
      })
    }

    // Next button click handler
    if (DOM.nextBtn) {
      DOM.nextBtn.addEventListener("click", () => {
        showSlide(nextIndices[currentSlide])
        resetInterval()
      })
    }

    // Auto-advance interval
    function startInterval() {
      slideInterval = setInterval(() => {
        showSlide(nextIndices[currentSlide])
      }, 5000)
    }

    // Reset interval
    function resetInterval() {
      clearInterval(slideInterval)
      startInterval()
    }

    // Initialize slideshow
    startInterval()
  }

  // Smooth scrolling with optimized event delegation
  function initSmoothScrolling() {
    // Use event delegation for all anchor clicks
    document.addEventListener("click", (e) => {
      // Find closest anchor or return if none
      const anchor = e.target.closest('a[href^="#"]')
      if (!anchor) return

      const targetId = anchor.getAttribute("href")
      if (targetId === "#") return

      const targetElement = document.querySelector(targetId)
      if (targetElement) {
        e.preventDefault()

        // Use native scrollIntoView for better performance
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        })
      }
    })
  }

  // Nav links active state with IntersectionObserver
  function initNavLinks() {
    const currentPath = window.location.pathname

    // Set active state for current page
    DOM.navLinks.forEach((link) => {
      const linkPath = link.getAttribute("href")

      if (
        linkPath === currentPath ||
        (currentPath === "/" && linkPath === "index.html") ||
        (currentPath === "/index.html" && linkPath === "index.html")
      ) {
        link.classList.add("active")
      } else if (linkPath !== "#" && currentPath.includes(linkPath)) {
        link.classList.add("active")
      }
    })

    // Only set up scroll-based active states on homepage
    if (currentPath === "/" || currentPath === "/index.html" || currentPath.endsWith("index.html")) {
      // Use IntersectionObserver instead of scroll events
      if (DOM.sections.length && "IntersectionObserver" in window) {
        const navObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                const sectionId = entry.target.id

                // Update active nav links
                DOM.navLinks.forEach((link) => {
                  const linkHref = link.getAttribute("href")
                  if (linkHref && linkHref.startsWith("#")) {
                    if (linkHref === "#" + sectionId) {
                      link.classList.add("active")
                    } else {
                      link.classList.remove("active")
                    }
                  }
                })
              }
            })
          },
          { threshold: 0.3, rootMargin: "-100px 0px -300px 0px" },
        )

        // Observe all sections
        DOM.sections.forEach((section) => {
          navObserver.observe(section)
        })
      }
    }
  }

  // Scroll to top button with IntersectionObserver
  function initScrollToTop() {
    // If scroll-top button already exists in HTML, use that instead of creating a new one
    let scrollBtn = DOM.scrollTop

    if (!scrollBtn) {
      // Create button only once
      scrollBtn = document.createElement("div")
      scrollBtn.classList.add("scroll-top")
      scrollBtn.innerHTML = '<i class="fas fa-arrow-up"></i>'
      document.body.appendChild(scrollBtn)
    }

    // Use IntersectionObserver to detect when we're far enough down the page
    const topSentinel = document.createElement("div")
    topSentinel.style.height = "1px"
    topSentinel.style.position = "absolute"
    topSentinel.style.top = "300px"
    topSentinel.style.left = "0"
    topSentinel.style.width = "100%"
    topSentinel.style.pointerEvents = "none"
    topSentinel.style.opacity = "0"
    document.body.appendChild(topSentinel)

    const scrollObserver = new IntersectionObserver(
      (entries) => {
        // When sentinel is out of view (scrolled past), show button
        if (!entries[0].isIntersecting) {
          scrollBtn.classList.add("active")
        } else {
          scrollBtn.classList.remove("active")
        }
      },
      { threshold: 0 },
    )

    scrollObserver.observe(topSentinel)

    // Scroll to top when button is clicked
    scrollBtn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    })
  }

  // Scroll animations with optimized IntersectionObserver
  function initScrollAnimations() {
    // Create a single IntersectionObserver instance
    const animationObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Add animation class and stop observing
            entry.target.classList.add("fade-in-up")
            animationObserver.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      },
    )

    // Observe all animation elements
    DOM.animateElements.forEach((element) => {
      animationObserver.observe(element)
    })
  }

  // Header scroll effect with IntersectionObserver
  function initHeaderScroll() {
    // Create a sentinel element to detect scroll position
    const headerSentinel = document.createElement("div")
    headerSentinel.style.height = "1px"
    headerSentinel.style.position = "absolute"
    headerSentinel.style.top = "50px" // Keep this the same
    headerSentinel.style.left = "0"
    headerSentinel.style.width = "100%"
    headerSentinel.style.pointerEvents = "none"
    headerSentinel.style.opacity = "0"
    document.body.appendChild(headerSentinel)

    // Use IntersectionObserver instead of scroll event
    const headerObserver = new IntersectionObserver(
      (entries) => {
        // When sentinel is out of view (scrolled past), add scrolled class
        if (!entries[0].isIntersecting) {
          DOM.header.classList.add("scrolled")
        } else {
          DOM.header.classList.remove("scrolled")
        }
      },
      {
        threshold: 0,
        rootMargin: "-10px 0px 0px 0px", // Adjusted rootMargin for better mobile detection
      },
    )

    headerObserver.observe(headerSentinel)

    // Add a fallback for devices that might have issues with IntersectionObserver
    window.addEventListener(
      "scroll",
      () => {
        if (window.scrollY > 50) {
          DOM.header.classList.add("scrolled")
        } else {
          DOM.header.classList.remove("scrolled")
        }
      },
      { passive: true },
    ) // Use passive for better performance
  }
})()
