// Set current year in footer
document.addEventListener("DOMContentLoaded", () => {
  // Set current year in footer if the element exists
  const currentYearElement = document.getElementById("currentYear")
  if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear()
  }

  // Initialize all functionality
  // Only call functions if their required elements exist
  if (document.querySelector(".logo-slide")) {
    initLogoSlideshow()
  }

  initSmoothScrolling()
  initNavLinks()
  initScrollToTop()

  if (document.querySelector(".feature-card, .about-content, .about-image")) {
    initScrollAnimations()
  }

  // Always initialize header scroll effect
  initHeaderScroll()
})

// Logo Slideshow Functionality - Optimized
function initLogoSlideshow() {
  const slides = document.querySelectorAll(".logo-slide")
  const dots = document.querySelectorAll(".dot")
  const prevBtn = document.querySelector(".prev")
  const nextBtn = document.querySelector(".next")
  let currentSlide = 0
  let slideInterval
  let isTransitioning = false

  // Function to show a specific slide with debounce
  function showSlide(index) {
    if (isTransitioning) return
    isTransitioning = true

    // Hide all slides
    slides.forEach((slide) => {
      slide.classList.remove("active")
    })

    // Remove active class from all dots
    dots.forEach((dot) => {
      dot.classList.remove("active")
    })

    // Show the current slide and activate the corresponding dot
    slides[index].classList.add("active")
    dots[index].classList.add("active")

    // Update current slide index
    currentSlide = index

    // Reset transition lock after animation completes
    setTimeout(() => {
      isTransitioning = false
    }, 600)
  }

  // Event listeners for dots - using event delegation
  const dotsContainer = document.querySelector(".slideshow-dots")
  if (dotsContainer) {
    dotsContainer.addEventListener("click", (e) => {
      if (e.target.classList.contains("dot")) {
        const slideIndex = Number.parseInt(e.target.getAttribute("data-index"), 10)
        showSlide(slideIndex)
        resetInterval()
      }
    })
  }

  // Event listener for previous button
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      let newIndex = currentSlide - 1
      if (newIndex < 0) {
        newIndex = slides.length - 1
      }
      showSlide(newIndex)
      resetInterval()
    })
  }

  // Event listener for next button
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      let newIndex = currentSlide + 1
      if (newIndex >= slides.length) {
        newIndex = 0
      }
      showSlide(newIndex)
      resetInterval()
    })
  }

  // Start auto-advance interval
  function startInterval() {
    slideInterval = setInterval(() => {
      let newIndex = currentSlide + 1
      if (newIndex >= slides.length) {
        newIndex = 0
      }
      showSlide(newIndex)
    }, 5000)
  }

  // Reset interval when user interacts
  function resetInterval() {
    clearInterval(slideInterval)
    startInterval()
  }

  // Initialize slideshow
  startInterval()
}

// Smooth scrolling for anchor links - Optimized with passive event listener
function initSmoothScrolling() {
  document.addEventListener("click", (e) => {
    const anchor = e.target.closest('a[href^="#"]')
    if (!anchor) return

    const targetId = anchor.getAttribute("href")
    if (targetId === "#") return

    const targetElement = document.querySelector(targetId)
    if (targetElement) {
      e.preventDefault()
      window.scrollTo({
        top: targetElement.offsetTop - 100,
        behavior: "smooth",
      })
    }
  })
}

// Nav links active state - Optimized with requestAnimationFrame
function initNavLinks() {
  const navLinks = document.querySelectorAll("nav ul li a")
  if (!navLinks.length) return

  const currentPath = window.location.pathname

  // First, handle active state based on current page
  navLinks.forEach((link) => {
    const linkPath = link.getAttribute("href")

    // Check if this is the current page
    if (
      linkPath === currentPath ||
      (currentPath === "/" && linkPath === "index.html") ||
      (currentPath === "/index.html" && linkPath === "index.html")
    ) {
      // This is the current page's link
      link.classList.add("active")
    } else if (linkPath !== "#" && currentPath.includes(linkPath)) {
      // This handles subpages
      link.classList.add("active")
    }
  })

  // Then, handle scroll-based active states only if we're on the homepage
  if (currentPath === "/" || currentPath === "/index.html" || currentPath.endsWith("index.html")) {
    // Cache section elements
    const sections = Array.from(document.querySelectorAll("section")).filter((section) => section.id)
    if (!sections.length) return

    // Use requestAnimationFrame for better performance
    let ticking = false

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            let currentSection = ""
            const scrollPosition = window.pageYOffset

            // Find current section
            for (let i = 0; i < sections.length; i++) {
              const section = sections[i]
              const sectionTop = section.offsetTop

              if (scrollPosition >= sectionTop - 200) {
                currentSection = section.id
              }
            }

            // Update active links
            if (currentSection) {
              navLinks.forEach((link) => {
                const linkHref = link.getAttribute("href")
                // Only modify hash links, preserve the active state for page links
                if (linkHref && linkHref.startsWith("#")) {
                  if (linkHref === "#" + currentSection) {
                    if (!link.classList.contains("active")) {
                      link.classList.add("active")
                    }
                  } else {
                    link.classList.remove("active")
                  }
                }
              })
            }

            ticking = false
          })
          ticking = true
        }
      },
      { passive: true },
    )
  }
}

// Scroll to top button - Optimized with requestAnimationFrame
function initScrollToTop() {
  // Create scroll to top button
  const scrollBtn = document.createElement("div")
  scrollBtn.classList.add("scroll-top")
  scrollBtn.innerHTML = '<i class="fas fa-arrow-up"></i>'
  document.body.appendChild(scrollBtn)

  // Show/hide scroll button based on scroll position
  let ticking = false

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (window.pageYOffset > 300) {
            scrollBtn.classList.add("active")
          } else {
            scrollBtn.classList.remove("active")
          }
          ticking = false
        })
        ticking = true
      }
    },
    { passive: true },
  )

  // Scroll to top when button is clicked
  scrollBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  })
}

// Scroll animations - Optimized with IntersectionObserver
function initScrollAnimations() {
  // Use IntersectionObserver for better performance
  const animateElements = document.querySelectorAll(".feature-card, .about-content, .about-image")
  if (!animateElements.length) return

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("fade-in-up")
          observer.unobserve(entry.target)
        }
      })
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    },
  )

  animateElements.forEach((element) => {
    observer.observe(element)
  })
}

// Header scroll effect - Optimized with requestAnimationFrame
function initHeaderScroll() {
  const header = document.querySelector("header")
  if (!header) return

  // Function to update header class based on scroll position
  function updateHeaderClass() {
    if (window.pageYOffset > 50) {
      if (!header.classList.contains("scrolled")) {
        header.classList.add("scrolled")
      }
    } else if (header.classList.contains("scrolled")) {
      header.classList.remove("scrolled")
    }
  }

  // Use requestAnimationFrame for better performance
  let ticking = false

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateHeaderClass()
          ticking = false
        })
        ticking = true
      }
    },
    { passive: true },
  )

  // Set initial state on page load
  updateHeaderClass()
}
