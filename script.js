document.addEventListener("DOMContentLoaded", () => {
    // Customer logo slideshow functionality
    const slides = document.querySelectorAll(".logo-slide")
    const dots = document.querySelectorAll(".dot")
    const prevBtn = document.querySelector(".arrow.prev")
    const nextBtn = document.querySelector(".arrow.next")
  
    let currentSlide = 0
    let slideInterval
  
    // Initialize the slideshow
    function startSlideshow() {
      slideInterval = setInterval(nextSlide, 4000)
    }
  
    // Show a specific slide
    function showSlide(index) {
      // Remove active class from all slides and dots
      slides.forEach((slide) => slide.classList.remove("active"))
      dots.forEach((dot) => dot.classList.remove("active"))
  
      // Add active class to current slide and dot
      slides[index].classList.add("active")
      dots[index].classList.add("active")
  
      currentSlide = index
    }
  
    // Next slide function
    function nextSlide() {
      let nextIndex = currentSlide + 1
      if (nextIndex >= slides.length) {
        nextIndex = 0
      }
      showSlide(nextIndex)
    }
  
    // Previous slide function
    function prevSlide() {
      let prevIndex = currentSlide - 1
      if (prevIndex < 0) {
        prevIndex = slides.length - 1
      }
      showSlide(prevIndex)
    }
  
    // Event listeners for controls
    prevBtn.addEventListener("click", () => {
      clearInterval(slideInterval)
      prevSlide()
      startSlideshow()
    })
  
    nextBtn.addEventListener("click", () => {
      clearInterval(slideInterval)
      nextSlide()
      startSlideshow()
    })
  
    // Event listeners for dots
    dots.forEach((dot) => {
      dot.addEventListener("click", function () {
        clearInterval(slideInterval)
        const slideIndex = Number.parseInt(this.getAttribute("data-index"))
        showSlide(slideIndex)
        startSlideshow()
      })
    })
  
    // Start the slideshow
    startSlideshow()
  })
  