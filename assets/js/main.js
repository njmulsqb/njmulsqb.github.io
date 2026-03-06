$(function () {

    "use strict";

   //===== Prealoder
   $(window).on('load', function() {
    $("#loading").fadeOut(500);
});


   setTimeout(function() {
    $("#loading").fadeOut(500);
   }, 3000);

//header-scroll
    let areaHeight = $('[data-scroll-area="true"]').height();
    $('.hero-scrolli').on('click', function(e){
        let target = $(this).attr('href');
        if (target && target.startsWith('#')) {
            e.preventDefault();
            $('html, body').animate({
                scrollTop: $(target).offset().top - 80 // offset for sticky header
            }, 1000);
        } else {
            $('html').animate({
                scrollTop: areaHeight
            }, 1000);
        }
    });

//scroll-to-top
    $(window).scroll(function() {
        if ($(this).scrollTop() >= 600 && ($(window).scrollTop() + $(window).height() < $(document).height() - 50)) {        
            $('.scroll-to-top').fadeIn(200);    
        } else {
            $('.scroll-to-top').fadeOut(200);   
        }
    }).trigger('scroll');

    $('.scroll-to-top').on('click', function(){
        $('html').animate({
            scrollTop: 0
        }, 1000);
    });
//mobile-menu
    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileSidebar = document.getElementById('mobile-sidebar');
    const closeSidebar = document.getElementById('close-sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const body = document.body;

    if (mobileToggle) {
        mobileToggle.addEventListener('click', function() {
            mobileSidebar.classList.add('active');
            sidebarOverlay.classList.add('active');
            body.style.overflow = 'hidden';
        });
    }

    function hideSidebar() {
        if (mobileSidebar) mobileSidebar.classList.remove('active');
        if (sidebarOverlay) sidebarOverlay.classList.remove('active');
        body.style.overflow = '';
    }

    if (closeSidebar) {
        closeSidebar.addEventListener('click', hideSidebar);
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', hideSidebar);
    }

    // Close sidebar when clicking a link
    $('.mobile-nav a').on('click', function() {
        hideSidebar();
    });

//one page nav
if ($('.main-menu ul').length) {
    $('.main-menu ul').onePageNav({
        currentClass: 'current',
        changeHash: false,
        scrollSpeed: 750,
        scrollThreshold: 0.5,
        filter: '',
        easing: 'swing'
    });
}

$('a[href*="#"]')
  .not('[href="#"]')
  .not('[href="#0"]')
  .click(function(event) {
    if (
      location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') 
      && 
      location.hostname == this.hostname
    ) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        event.preventDefault();
        $('html, body').animate({
          scrollTop: target.offset().top - 80
        }, 1000, function() {
          var $target = $(target);
          $target.focus();
          if ($target.is(":focus")) {
            return false;
          } else {
            $target.attr('tabindex','-1');
            $target.focus();
          };
        });
      }
    }
  });




    var lastScrollTop = 0;
    var scrollThreshold = 10;
    
    $(window).on('scroll', function (event) {
        var scroll = $(window).scrollTop();
        var header = $(".bottom-header-area");
        
        if (scroll < scrollThreshold) {
            header.removeClass("sticky header-hidden");
        } else {
            header.addClass("sticky");
            
            if (scroll > lastScrollTop && scroll > 100) {
                header.addClass("header-hidden");
            } else {
                header.removeClass("header-hidden");
            }
        }
        
        lastScrollTop = scroll;
    });





    //===== hero Active slick slider
    $('.hero-carousel-active').slick({
        dots: false,
        infinite: true,
        autoplay: false,
        autoplaySpeed: 3000,
        arrows: false,
        prevArrow: '<span class="prev"><i class="fal fa-long-arrow-alt-left"></i></span>',
        nextArrow: '<span class="next"><i class="fal fa-long-arrow-alt-right"></i></span>',
        speed: 1500,
        slidesToShow: 1,
        slidesToScroll: 1,
        responsive: [
            {
                breakpoint: 1201,
                settings: {
                    slidesToShow: 1,
                }
        },
            {
                breakpoint: 992,
                settings: {
                    slidesToShow: 1,
                }
        },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                }
        },
            {
                breakpoint: 576,
                settings: {
                    slidesToShow: 1,
                }
        }
        ]
    });



    //===== textimonial-carousel-active
    $('.textimonial-carousel-active').slick({
        dots: false,
        infinite: true,
        autoplay: true,
        autoplaySpeed: 3000,
        arrows: true,
        prevArrow: '<span class="prev"><i class="fa fa-angle-left"></i></i></span>',
        nextArrow: '<span class="next"><i class="fa fa-angle-right"></i></i></span>',
        speed: 1500,
        slidesToShow: 1,
        slidesToScroll: 1,
        responsive: [
            {
                breakpoint: 1201,
                settings: {
                    slidesToShow: 1,
                }
        },
            {
                breakpoint: 992,
                settings: {
                    slidesToShow: 1,
                }
        },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                }
        },
            {
                breakpoint: 576,
                settings: {
                    slidesToShow: 1,
                }
        }
        ]
    });



    //===== team-carousel-active
    $('.team-carousel-active').slick({
        dots: false,
        infinite: true,
        autoplay: true,
        autoplaySpeed: 3000,
        arrows: false,
        prevArrow: '<span class="prev"><i class="fa fa-angle-left"></i></i></span>',
        nextArrow: '<span class="next"><i class="fa fa-angle-right"></i></i></span>',
        speed: 1500,
        slidesToShow: 3,
        slidesToScroll: 1,
        responsive: [
            {
                breakpoint: 1201,
                settings: {
                    slidesToShow: 3,
                }
        },
            {
                breakpoint: 992,
                settings: {
                    slidesToShow: 2,
                }
        },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                }
        },
            {
                breakpoint: 576,
                settings: {
                    slidesToShow: 1,
                }
        }
        ]
    });

    //===== counter up
    $('.count').counterUp({
        delay: 10,
        time: 2000
    });


    //====== Magnific Popup

    $('.video-popup').magnificPopup({
        type: 'iframe',
        // other options
    });



    //===== Magnific Popup
    $('.img-popup').magnificPopup({
        type: 'image',
        gallery: {
            enabled: true
        }
    });


    var searchInput = document.getElementById('search-input');
    var resultsContainer = document.getElementById('results-container');
    
    var sjs = SimpleJekyllSearch({
      searchInput: searchInput,
      resultsContainer: resultsContainer,
      json: '/search.json',
      searchResultTemplate: '<li><a href="{url}">- {title}</a></li>',
      noResultsText: '<li>No results found</li>',
      success: function() {
        updateResultCount();
      }
    });

    // Function to update result count and scroll to top
    function updateResultCount() {
      const resultsCount = document.getElementById('results-count');
      const resultsWrapper = document.querySelector('.search-results-wrapper');
      
      if (resultsContainer && resultsCount) {
        const items = resultsContainer.querySelectorAll('li');
        const count = items.length;
        
        if (searchInput.value.trim() === '') {
          resultsCount.textContent = '';
        } else if (count === 1 && items[0].textContent === 'No results found') {
          resultsCount.textContent = '(0 found)';
        } else {
          resultsCount.textContent = `(${count} found)`;
        }

        // Always scroll back to top when results change
        if (resultsWrapper) {
            resultsWrapper.scrollTop = 0;
        }
      }
    }

    // Watch for changes in the results container
    if (resultsContainer) {
      const observer = new MutationObserver(function() {
        updateResultCount();
      });
      
      observer.observe(resultsContainer, {
        childList: true,
        subtree: true
      });
    }

    // Update count when search input changes
    if (searchInput) {
      searchInput.addEventListener('input', function() {
        setTimeout(updateResultCount, 0);
      });
    }

    // Fixing search button for mobile (using delegated event for better support)
    $(document).on('click', '.search-btn', function(e) {
        e.preventDefault();
        $(".offcanvas-search-area").addClass("search-bar-active");
        $("body").addClass("search-active");
        // Focus the input
        setTimeout(() => {
            $('#search-input').focus();
        }, 300);
    });

    $(document).on('click', ".close-bar i, .sidebar-overlay, .close-bar", function(){
        $(".offcanvas-search-area").removeClass("search-bar-active");
        $("body").removeClass("search-active");
    });
});

// Update year

document.addEventListener('DOMContentLoaded', function () {
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        const currentYear = new Date().getFullYear();
        yearSpan.textContent = currentYear;
    }
});