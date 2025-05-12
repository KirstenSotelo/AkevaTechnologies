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

  // Log that script has loaded
  console.log("Script initialized successfully")
})

// Logo Slideshow Functionality - Optimized
function initLogoSlideshow() {
  const slides = document.querySelectorAll(".logo-slide")
  const dots = document.querySelectorAll(".dot")
  const prevBtn = document.querySelector(".prev")
  const nextBtn = document.querySelector(".next")
  let currentSlide = 0
  let slideInterval

  // Function to show a specific slide
  function showSlide(index) {
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
  }

  // Event listeners for dots - using event delegation
  document.querySelector(".slideshow-dots").addEventListener("click", (e) => {
    if (e.target.classList.contains("dot")) {
      const slideIndex = Number.parseInt(e.target.getAttribute("data-index"))
      showSlide(slideIndex)
      resetInterval()
    }
  })

  // Event listener for previous button
  prevBtn.addEventListener("click", () => {
    let newIndex = currentSlide - 1
    if (newIndex < 0) {
      newIndex = slides.length - 1
    }
    showSlide(newIndex)
    resetInterval()
  })

  // Event listener for next button
  nextBtn.addEventListener("click", () => {
    let newIndex = currentSlide + 1
    if (newIndex >= slides.length) {
      newIndex = 0
    }
    showSlide(newIndex)
    resetInterval()
  })

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

// Smooth scrolling for anchor links - Optimized
function initSmoothScrolling() {
  document.addEventListener("click", (e) => {
    const anchor = e.target.closest('a[href^="#"]')
    if (!anchor) return

    e.preventDefault()
    const targetId = anchor.getAttribute("href")
    if (targetId === "#") return

    const targetElement = document.querySelector(targetId)
    if (targetElement) {
      window.scrollTo({
        top: targetElement.offsetTop - 100,
        behavior: "smooth",
      })
    }
  })
}

// Nav links active state - Optimized with throttling
function initNavLinks() {
  const navLinks = document.querySelectorAll("nav ul li a")
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
    // Throttle scroll event
    let lastScrollTime = 0
    window.addEventListener("scroll", () => {
      const now = Date.now()
      if (now - lastScrollTime < 100) return // Only process every 100ms
      lastScrollTime = now

      const sections = document.querySelectorAll("section")
      let currentSection = ""

      sections.forEach((section) => {
        const sectionTop = section.offsetTop
        if (pageYOffset >= sectionTop - 200) {
          currentSection = section.getAttribute("id")
        }
      })

      // Only update active state for hash links on the homepage
      navLinks.forEach((link) => {
        const linkHref = link.getAttribute("href")
        // Only modify hash links, preserve the active state for page links
        if (linkHref.startsWith("#")) {
          link.classList.remove("active")
          if (linkHref === "#" + currentSection) {
            link.classList.add("active")
          }
        }
      })
    })
  }
}

// Scroll to top button - Optimized with throttling
function initScrollToTop() {
  // Create scroll to top button
  const scrollBtn = document.createElement("div")
  scrollBtn.classList.add("scroll-top")
  scrollBtn.innerHTML = '<i class="fas fa-arrow-up"></i>'
  document.body.appendChild(scrollBtn)

  // Show/hide scroll button based on scroll position - throttled
  let lastScrollTopTime = 0
  window.addEventListener("scroll", () => {
    const now = Date.now()
    if (now - lastScrollTopTime < 100) return // Only process every 100ms
    lastScrollTopTime = now

    if (window.pageYOffset > 300) {
      scrollBtn.classList.add("active")
    } else {
      scrollBtn.classList.remove("active")
    }
  })

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

// Header scroll effect - Works on all pages
function initHeaderScroll() {
  const header = document.querySelector("header")

  if (!header) {
    console.error("Header element not found!")
    return
  }

  console.log("Header scroll effect initialized")

  // Add a class to indicate the script is loaded
  document.body.classList.add("script-loaded")

  // Function to update header class based on scroll position
  function updateHeaderClass() {
    if (window.pageYOffset > 50) {
      header.classList.add("scrolled")
      console.log("Added scrolled class", window.pageYOffset)
    } else {
      header.classList.remove("scrolled")
      console.log("Removed scrolled class", window.pageYOffset)
    }
  }

  // Throttle scroll event
  let ticking = false
  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateHeaderClass()
        ticking = false
      })
      ticking = true
    }
  })

  // Set initial state on page load
  updateHeaderClass()
}
